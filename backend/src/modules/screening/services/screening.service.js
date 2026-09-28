// Orchestration: create a run, resolve its context, execute the stages, record the verdict.
//
// Split deliberately in two:
//   startRun()          runs in the API request, does the minimum, and enqueues.
//   processScreeningRun() runs in the worker and does all the slow, failure-prone work.
//
// `processScreeningRun` takes its collaborators as an argument rather than importing them, so the
// resume-after-retry behaviour can be tested with fakes and no Redis, database or API key. It
// knows nothing about BullMQ — src/queue/screening.queue.js adapts a job onto it.
const ScreeningRun = require("../models/screeningRun.model");
const StyleGuide = require("../models/styleGuide.model");
const Ruleset = require("../models/ruleset.model");
const { DECISIONS, evaluate } = require("./decision.engine");
const { findRejectedDuplicate, hashBuffer, recordHash } = require("./dedupe.service");
const { loadImage } = require("./image.loader");
const { normalizeRulesetConfig, resolveRuleset } = require("./ruleset.service");
const { applyScreeningDecision, markPending } = require("./transition.service");

const STAGE_ORDER = ["aiornot", "moderation", "style"];

/** Loads the adapter set named by SCREENING_ADAPTERS. */
function defaultAdapters() {
  if ((process.env.SCREENING_ADAPTERS ?? "").toLowerCase() === "mock") {
    return require("../adapters/mock");
  }

  return {
    aiornot: require("../adapters/aiornot.adapter"),
    moderation: require("../adapters/openai-moderation.adapter"),
    style: require("../adapters/style.adapter"),
  };
}

/**
 * Finds the brand whose rules apply to an artwork.
 *
 * A contest entry inherits the brand running the contest. Outside a contest an artwork may be
 * attached to a brand storefront. Neither is guaranteed, and no brand simply means the platform
 * default ruleset with no style stage.
 */
async function resolveBrandContext(db, { artworkId, contestEntryId }) {
  if (contestEntryId) {
    const row = await db
      .selectFrom("contest_entries")
      .innerJoin("contests", "contests.id", "contest_entries.contest_id")
      .select(["contests.brand_id as brand_id", "contests.id as contest_id"])
      .where("contest_entries.id", "=", contestEntryId)
      .executeTakeFirst();

    if (row?.brand_id) return { brandId: row.brand_id, contestId: row.contest_id };
  }

  const brandArtwork = await db
    .selectFrom("brand_artworks")
    .select(["brand_id"])
    .where("artwork_id", "=", artworkId)
    .executeTakeFirst();

  return { brandId: brandArtwork?.brand_id ?? null, contestId: null };
}

/**
 * Creates a screening run and hands it to the queue.
 *
 * Called from the artwork and contest-entry controllers, which must not be made to wait on — or
 * fail because of — the pipeline. Enqueue failures are reported to the caller so it can decide;
 * the controllers log and carry on, leaving the run visible as `running` for the sweeper.
 *
 * @param {import('kysely').Kysely<any>} db
 * @param {{artworkId: string, contestEntryId?: string|null, actorId?: string|null, rescreen?: boolean}} params
 * @param {{queue?: object}} [deps]
 */
async function startRun(
  db,
  { artworkId, contestEntryId = null, actorId = null, rescreen = false },
  deps = {}
) {
  const { brandId } = await resolveBrandContext(db, { artworkId, contestEntryId });
  const ruleset = await resolveRuleset(db, { brandId });

  if (rescreen) {
    // Reset to pending so the eventual verdict is a legal transition and the reset is audited.
    await markPending(db, { artworkId, contestEntryId, actorId });
  }

  const run = await ScreeningRun.create(db, {
    artworkId,
    contestEntryId,
    rulesetId: ruleset.id,
  });

  const queue = deps.queue ?? require("../../../queue/screening.queue");
  await queue.enqueueScreening({
    runId: run.id,
    artworkId,
    contestEntryId,
  });

  return run;
}

/**
 * Wraps an adapter call with timing and the status the decision engine reads.
 * Adapters signal failure by throwing; deciding what a failure *means* is this module's job.
 */
async function runStage(adapter, input) {
  const startedAt = Date.now();
  const payload = await adapter.run(input);
  return { status: "ok", ...payload, latencyMs: Date.now() - startedAt };
}

/**
 * Executes any stage that has not already produced a result, then records the verdict.
 *
 * Idempotency and resumption both come from the same place: a stage's jsonb column is written only
 * while NULL (see ScreeningRun.saveStageResult), and a stage that is already non-NULL is skipped
 * entirely. A job redelivered after a crash therefore resumes at the incomplete stage without
 * re-billing the completed ones.
 *
 * @param {import('kysely').Kysely<any>} db
 * @param {{runId: string, isFinalAttempt?: boolean}} params
 * @param {{adapters?: object, loadImage?: Function, onDecision?: Function}} [deps]
 */
async function processScreeningRun(db, { runId, isFinalAttempt = false }, deps = {}) {
  const adapters = deps.adapters ?? defaultAdapters();
  const fetchImage = deps.loadImage ?? loadImage;

  const run = await ScreeningRun.findById(db, runId);

  if (!run) {
    // A permanent failure: retrying cannot conjure the row. The queue is told not to retry.
    const error = new Error(`Screening run not found: ${runId}`);
    error.permanent = true;
    throw error;
  }

  // Already settled. A duplicate delivery must not re-decide and re-audit.
  if (run.status === "complete") {
    return { runId, skipped: true, decision: run.decision };
  }

  const ruleset = await Ruleset.findById(db, run.ruleset_id);

  if (!ruleset) {
    const error = new Error(`Ruleset not found for run ${runId}: ${run.ruleset_id}`);
    error.permanent = true;
    throw error;
  }

  const config = normalizeRulesetConfig(ruleset.config);

  const artwork = await db
    .selectFrom("artworks")
    .select(["id", "title", "description", "file_url", "creator_id"])
    .where("id", "=", run.artwork_id)
    .executeTakeFirst();

  if (!artwork) {
    const error = new Error(`Artwork not found for run ${runId}: ${run.artwork_id}`);
    error.permanent = true;
    throw error;
  }

  // Stage results already on the row win, so this is where resumption happens.
  const stages = {
    aiornot: run.aiornot ?? null,
    moderation: run.moderation ?? null,
    style: run.style ?? null,
  };

  if (config.enabled === false) {
    // Screening is off. No external calls, and explicitly not an approval: the engine returns
    // flagged_manual for a disabled ruleset.
    return finish(db, { run, config, stages, deps });
  }

  const { brandId } = await resolveBrandContext(db, {
    artworkId: run.artwork_id,
    contestEntryId: run.contest_entry_id,
  });

  const styleGuide = brandId ? await StyleGuide.findActiveForBrand(db, brandId) : null;

  const tags = await db
    .selectFrom("taggings")
    .innerJoin("tags", "tags.id", "taggings.tag_id")
    .select(["tags.name as name"])
    .where("taggings.artwork_id", "=", run.artwork_id)
    .execute()
    .catch(() => []);

  const needsImage = STAGE_ORDER.some((stage) => stages[stage] === null);
  let image = null;
  const failures = [];

  if (needsImage) {
    try {
      image = await fetchImage(artwork.file_url);
    } catch (error) {
      // Without bytes no stage can run. On the last attempt every stage is marked unavailable so
      // the submission reaches a human rather than sitting in `running` forever.
      if (!isFinalAttempt) throw error;

      for (const stage of STAGE_ORDER) {
        if (stages[stage] === null) {
          const result = { status: "unavailable", error: `image_unavailable: ${error.message}` };
          await ScreeningRun.saveStageResult(db, run.id, stage, result);
          stages[stage] = result;
        }
      }

      return finish(db, { run, config, stages, deps });
    }
  }

  // Cheapest stage, and the only one that runs before the paid ones: identical bytes that were
  // already rejected go straight to a human. Hashing here rather than in the upload controller
  // means the hash covers exactly what the adapters see, and costs the request nothing.
  if (image?.buffer) {
    const sha256 = hashBuffer(image.buffer);
    await recordHash(db, artwork.id, sha256).catch((error) =>
      console.error(`[screening] could not record file hash for ${artwork.id}: ${error.message}`)
    );

    const duplicate = await findRejectedDuplicate(db, {
      sha256,
      excludeArtworkId: artwork.id,
    }).catch(() => null);

    if (duplicate) {
      for (const stage of STAGE_ORDER) {
        if (stages[stage] === null) {
          const result = { status: "skipped", reason: "duplicate_of_rejected" };
          await ScreeningRun.saveStageResult(db, run.id, stage, result);
          stages[stage] = result;
        }
      }

      await ScreeningRun.markDuplicate(db, run.id, duplicate.id);

      return finish(db, {
        run,
        config,
        stages,
        deps,
        forced: {
          decision: DECISIONS.FLAGGED_MANUAL,
          reasons: [
            {
              code: "duplicate_of_rejected",
              duplicate_of_artwork_id: duplicate.id,
              sha256,
            },
          ],
        },
      });
    }
  }

  const input = {
    runId: run.id,
    artwork,
    image,
    tags: tags.map((t) => t.name),
    config,
    styleGuide,
    brandId,
  };

  for (const stage of STAGE_ORDER) {
    if (stages[stage] !== null) continue;

    // The style stage is legitimately inapplicable rather than broken when there is nothing to
    // compare against. 'skipped' still permits auto-approval; 'unavailable' does not.
    if (stage === "style") {
      const skipReason = !config.styleEnabled
        ? "style_disabled"
        : !brandId
          ? "no_brand_context"
          : !styleGuide
            ? "no_style_guide"
            : null;

      if (skipReason) {
        const result = { status: "skipped", reason: skipReason };
        await ScreeningRun.saveStageResult(db, run.id, stage, result);
        stages[stage] = result;
        continue;
      }
    }

    const adapter = adapters[stage];

    if (!adapter) {
      const error = new Error(`No adapter configured for stage: ${stage}`);
      error.permanent = true;
      throw error;
    }

    try {
      const result = await runStage(adapter, input);
      await ScreeningRun.saveStageResult(db, run.id, stage, result);
      stages[stage] = result;
    } catch (error) {
      // Collected rather than thrown immediately: the remaining stages still run so their
      // results are cached before the retry, and so a single flaky provider does not hide what
      // the others found.
      failures.push({ stage, error });
    }
  }

  if (failures.length && !isFinalAttempt) {
    const permanent = failures.find(({ error }) => error.permanent);
    if (permanent) permanent.error.permanent = true;

    const summary = failures.map(({ stage, error }) => `${stage}: ${error.message}`).join("; ");
    const aggregate = new Error(`Screening stage failure — ${summary}`);
    aggregate.permanent = failures.every(({ error }) => error.permanent);
    aggregate.stageFailures = failures.map(({ stage }) => stage);
    throw aggregate;
  }

  // Retries are spent. Record the stages as unavailable and let the engine route to a human.
  for (const { stage, error } of failures) {
    const result = { status: "unavailable", error: error.message };
    await ScreeningRun.saveStageResult(db, run.id, stage, result);
    stages[stage] = result;
  }

  return finish(db, { run, config, stages, deps });
}

/**
 * Evaluates, records the decision, and applies it through the single write path.
 *
 * `forced` exists for the one case that is decided without consulting the stages — a resubmission
 * of already-rejected bytes. It is kept out of the engine so the engine stays a pure function of
 * stage results and config, with no history lookups.
 */
async function finish(db, { run, config, stages, deps, forced = null }) {
  const { decision, reasons } = forced ?? evaluate(stages, config);

  await ScreeningRun.complete(db, run.id, { decision, reasons });

  const transition = await applyScreeningDecision(db, {
    runId: run.id,
    artworkId: run.artwork_id,
    contestEntryId: run.contest_entry_id,
    decision,
    reasons,
  });

  // Notification is a side effect that must not undo a recorded decision, so it runs after the
  // transaction and its failure is swallowed rather than triggering a retry of the whole run.
  if (deps.onDecision) {
    try {
      await deps.onDecision({ run, decision, reasons, config, transition });
    } catch (error) {
      console.error(
        `[screening] post-decision hook failed for run ${run.id}:`,
        error.message
      );
    }
  }

  return { runId: run.id, decision, reasons, transition };
}

/** Marks a run failed after the queue has exhausted its retries. */
async function failRun(db, runId, message) {
  return ScreeningRun.fail(db, runId, message);
}

module.exports = {
  STAGE_ORDER,
  defaultAdapters,
  failRun,
  processScreeningRun,
  resolveBrandContext,
  startRun,
};
