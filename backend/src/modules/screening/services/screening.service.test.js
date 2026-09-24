import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { processScreeningRun, resolveBrandContext, startRun } = require("./screening.service.js");
const { normalizeRulesetConfig } = require("./ruleset.service.js");
const { hashBuffer } = require("./dedupe.service.js");
const { createFakeDb } = require("../__fixtures__/fakeDb.js");

const RUN_ID = "run-1";
const ARTWORK_ID = "artwork-1";
const ENTRY_ID = "entry-1";
const RULESET_ID = "ruleset-1";
const BRAND_ID = "brand-1";

const image = { buffer: Buffer.from("bytes"), contentType: "image/png", bytes: 5, filename: "a.png" };

function seed({
  runOverrides = {},
  config = { requireHumanReview: false },
  artworkOverrides = {},
  withContest = false,
  withStyleGuide = false,
} = {}) {
  return createFakeDb({
    screening_runs: [
      {
        id: RUN_ID,
        artwork_id: ARTWORK_ID,
        contest_entry_id: withContest ? ENTRY_ID : null,
        ruleset_id: RULESET_ID,
        status: "running",
        aiornot: null,
        moderation: null,
        style: null,
        decision: null,
        decision_reasons: null,
        ...runOverrides,
      },
    ],
    rulesets: [{ id: RULESET_ID, brand_id: null, version: 1, config: normalizeRulesetConfig(config) }],
    artworks: [
      {
        id: ARTWORK_ID,
        title: "A hand drawn cat",
        description: "ink on paper",
        file_url: "https://cdn.example/artworks/cat.png",
        creator_id: "artist-1",
        moderation_status: "pending",
        moderated_by: null,
        moderated_at: null,
        ...artworkOverrides,
      },
    ],
    contest_entries: withContest
      ? [
          {
            id: ENTRY_ID,
            contest_id: "contest-1",
            artwork_id: ARTWORK_ID,
            moderation_status: "pending",
            moderated_by: null,
            moderated_at: null,
          },
        ]
      : [],
    contests: withContest ? [{ id: "contest-1", brand_id: BRAND_ID }] : [],
    brand_artworks: [],
    style_guides: withStyleGuide
      ? [
          {
            id: "guide-1",
            brand_id: BRAND_ID,
            parse_status: "parsed",
            prompt_block: "No pink. Keep it heroic.",
            parsed_rules: {},
            created_at: "2026-01-01",
          },
        ]
      : [],
    taggings: [],
    tags: [],
    moderation_queue: [],
    audited_events: [],
  });
}

/** Adapters that record their calls, so "did this stage run again?" is directly assertable. */
function trackingAdapters(overrides = {}) {
  const calls = { aiornot: 0, moderation: 0, style: 0 };

  const adapters = {
    aiornot: {
      name: "aiornot",
      run: vi.fn(async () => {
        calls.aiornot += 1;
        return { verdict: "human", humanConfidence: 0.98, generators: [] };
      }),
    },
    moderation: {
      name: "moderation",
      run: vi.fn(async () => {
        calls.moderation += 1;
        return { flagged: false, categories: {}, categoryScores: { violence: 0.01 } };
      }),
    },
    style: {
      name: "style",
      run: vi.fn(async () => {
        calls.style += 1;
        return { styleScore: 0.95, brandFitScore: 0.9, ipRisk: 0.01, violations: [] };
      }),
    },
  };

  for (const [stage, impl] of Object.entries(overrides)) {
    adapters[stage] = { name: stage, run: vi.fn(impl) };
  }

  return { adapters, calls };
}

function deps(adapters) {
  return { adapters, loadImage: vi.fn(async () => image) };
}

/**
 * A submission with full brand context, so the style stage is applicable. The bare `seed()` has
 * no brand and therefore legitimately skips style — which is the right default for a gallery
 * upload, but useless for asserting that all three stages ran.
 */
function seedWithStyle(options = {}) {
  return seed({ withContest: true, withStyleGuide: true, ...options });
}

describe("processScreeningRun: happy path", () => {
  it("runs every stage, records the decision and settles the artwork", async () => {
    const db = seedWithStyle();
    const { adapters, calls } = trackingAdapters();

    const result = await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(result.decision).toBe("auto_approved");
    expect(calls).toEqual({ aiornot: 1, moderation: 1, style: 1 });

    const run = db.rows("screening_runs")[0];
    expect(run.status).toBe("complete");
    expect(run.decision).toBe("auto_approved");
    expect(JSON.parse(run.aiornot).status).toBe("ok");
    expect(JSON.parse(run.moderation).status).toBe("ok");

    expect(db.rows("artworks")[0].moderation_status).toBe("approved");
    expect(db.rows("audited_events")).toHaveLength(1);
  });

  it("records a latency figure per stage", async () => {
    const db = seed();
    const { adapters } = trackingAdapters();

    await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(JSON.parse(db.rows("screening_runs")[0].aiornot).latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("runs all stages even when an early one already justifies a flag", async () => {
    const db = seedWithStyle();
    const { adapters, calls } = trackingAdapters({
      aiornot: async () => ({ verdict: "human", humanConfidence: 0.7, generators: [] }),
    });

    const result = await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    // Borderline authenticity means manual review, but the other stages still ran so the reviewer
    // sees a complete report rather than one line.
    expect(result.decision).toBe("flagged_manual");
    expect(calls.moderation).toBe(1);
    expect(calls.style).toBe(1);
  });

  it("queues a flagged submission for review", async () => {
    const db = seed();
    const { adapters } = trackingAdapters({
      moderation: async () => ({ flagged: true, categories: {}, categoryScores: { violence: 0.85 } }),
    });

    await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(db.rows("moderation_queue")).toHaveLength(1);
    expect(db.rows("moderation_queue")[0].screening_run_id).toBe(RUN_ID);
  });

  it("applies the decision to the contest entry as well", async () => {
    const db = seed({ withContest: true, withStyleGuide: true });
    const { adapters } = trackingAdapters();

    await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(db.rows("contest_entries")[0].moderation_status).toBe("approved");
  });
});

describe("processScreeningRun: idempotency and resumption", () => {
  it("does not re-run a stage that already has a result", async () => {
    const db = seed({
      runOverrides: {
        aiornot: { status: "ok", verdict: "human", humanConfidence: 0.99 },
      },
    });
    const { adapters, calls } = trackingAdapters();

    await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(calls.aiornot).toBe(0);
    expect(calls.moderation).toBe(1);
  });

  it("resumes at the incomplete stage after a mid-run failure", async () => {
    const db = seedWithStyle();
    let moderationAttempts = 0;

    const { adapters, calls } = trackingAdapters({
      moderation: async () => {
        moderationAttempts += 1;
        if (moderationAttempts === 1) throw new Error("provider 503");
        return { flagged: false, categories: {}, categoryScores: { violence: 0.01 } };
      },
    });

    // First delivery: aiornot and style succeed and are persisted, moderation throws.
    await expect(
      processScreeningRun(db, { runId: RUN_ID, isFinalAttempt: false }, deps(adapters))
    ).rejects.toThrow(/provider 503/);

    const afterFailure = db.rows("screening_runs")[0];
    expect(JSON.parse(afterFailure.aiornot).status).toBe("ok");
    expect(afterFailure.moderation).toBeNull();
    expect(afterFailure.status).toBe("running");

    // Redelivery: only the incomplete stage is retried, so the successful stages are not re-billed.
    const result = await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(calls.aiornot).toBe(1);
    expect(calls.style).toBe(1);
    expect(moderationAttempts).toBe(2);
    expect(result.decision).toBe("auto_approved");
  });

  it("still caches the other stages' results on the attempt that fails", async () => {
    const db = seedWithStyle();
    const { adapters, calls } = trackingAdapters({
      aiornot: async () => {
        throw new Error("aiornot timeout");
      },
    });

    await expect(
      processScreeningRun(db, { runId: RUN_ID, isFinalAttempt: false }, deps(adapters))
    ).rejects.toThrow(/aiornot timeout/);

    // Moderation and style were attempted rather than abandoned when stage one threw.
    expect(calls.moderation).toBe(1);
    expect(calls.style).toBe(1);
    expect(db.rows("screening_runs")[0].moderation).not.toBeNull();
  });

  it("returns early without re-deciding a completed run", async () => {
    const db = seed({
      runOverrides: { status: "complete", decision: "auto_approved" },
    });
    const { adapters, calls } = trackingAdapters();

    const result = await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(result.skipped).toBe(true);
    expect(calls).toEqual({ aiornot: 0, moderation: 0, style: 0 });
    // Crucially: no second audit row from a duplicate delivery.
    expect(db.rows("audited_events")).toHaveLength(0);
  });

  it("loads the image once for the whole run", async () => {
    const db = seed();
    const { adapters } = trackingAdapters();
    const d = deps(adapters);

    await processScreeningRun(db, { runId: RUN_ID }, d);

    expect(d.loadImage).toHaveBeenCalledTimes(1);
  });

  it("does not load the image at all when every stage is already done", async () => {
    const db = seed({
      runOverrides: {
        aiornot: { status: "ok", verdict: "human", humanConfidence: 0.99 },
        moderation: { status: "ok", categories: {}, categoryScores: {} },
        style: { status: "skipped", reason: "style_disabled" },
      },
    });
    const { adapters } = trackingAdapters();
    const d = deps(adapters);

    await processScreeningRun(db, { runId: RUN_ID }, d);

    expect(d.loadImage).not.toHaveBeenCalled();
  });
});

describe("processScreeningRun: degradation", () => {
  it("marks a stage unavailable and defers to a human once retries are spent", async () => {
    const db = seed();
    const { adapters } = trackingAdapters({
      aiornot: async () => {
        throw new Error("aiornot down");
      },
    });

    const result = await processScreeningRun(
      db,
      { runId: RUN_ID, isFinalAttempt: true },
      deps(adapters)
    );

    expect(result.decision).toBe("flagged_manual");
    expect(JSON.parse(db.rows("screening_runs")[0].aiornot)).toMatchObject({
      status: "unavailable",
      error: "aiornot down",
    });
    expect(db.rows("artworks")[0].moderation_status).toBe("flagged");
  });

  it("never approves when a stage degraded, even on an otherwise clean submission", async () => {
    const db = seedWithStyle();
    const { adapters } = trackingAdapters({
      style: async () => {
        throw new Error("vision model down");
      },
    });

    const result = await processScreeningRun(
      db,
      { runId: RUN_ID, isFinalAttempt: true },
      deps(adapters)
    );

    expect(result.decision).not.toBe("auto_approved");
  });

  it("defers when the image itself cannot be fetched on the final attempt", async () => {
    const db = seed();
    const { adapters } = trackingAdapters();

    const result = await processScreeningRun(
      db,
      { runId: RUN_ID, isFinalAttempt: true },
      {
        adapters,
        loadImage: async () => {
          throw new Error("403 from storage");
        },
      }
    );

    expect(result.decision).toBe("flagged_manual");
    const run = db.rows("screening_runs")[0];
    for (const stage of ["aiornot", "moderation", "style"]) {
      expect(JSON.parse(run[stage]).status).toBe("unavailable");
    }
  });

  it("retries rather than degrading while attempts remain", async () => {
    const db = seed();
    const { adapters } = trackingAdapters();

    await expect(
      processScreeningRun(
        db,
        { runId: RUN_ID, isFinalAttempt: false },
        {
          adapters,
          loadImage: async () => {
            throw new Error("transient storage error");
          },
        }
      )
    ).rejects.toThrow(/transient storage error/);

    expect(db.rows("screening_runs")[0].status).toBe("running");
  });

  it("aggregates multiple stage failures into one retryable error", async () => {
    const db = seed();
    const { adapters } = trackingAdapters({
      aiornot: async () => {
        throw new Error("a down");
      },
      moderation: async () => {
        throw new Error("b down");
      },
    });

    await expect(
      processScreeningRun(db, { runId: RUN_ID, isFinalAttempt: false }, deps(adapters))
    ).rejects.toThrow(/aiornot: a down; moderation: b down/);
  });
});

describe("processScreeningRun: style stage applicability", () => {
  it("skips style, and still allows approval, when the ruleset disables it", async () => {
    const db = seed({ config: { requireHumanReview: false, styleEnabled: false } });
    const { adapters, calls } = trackingAdapters();

    const result = await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(calls.style).toBe(0);
    expect(JSON.parse(db.rows("screening_runs")[0].style)).toEqual({
      status: "skipped",
      reason: "style_disabled",
    });
    expect(result.decision).toBe("auto_approved");
  });

  it("skips style when the artwork has no brand context", async () => {
    const db = seed();
    const { adapters, calls } = trackingAdapters();

    await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(calls.style).toBe(0);
    expect(JSON.parse(db.rows("screening_runs")[0].style).reason).toBe("no_brand_context");
  });

  it("skips style when the brand has not uploaded a guide yet", async () => {
    const db = seed({ withContest: true, withStyleGuide: false });
    const { adapters, calls } = trackingAdapters();

    await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(calls.style).toBe(0);
    expect(JSON.parse(db.rows("screening_runs")[0].style).reason).toBe("no_style_guide");
  });

  it("runs style, and passes the compiled prompt block, when a parsed guide exists", async () => {
    const db = seed({ withContest: true, withStyleGuide: true });
    const { adapters } = trackingAdapters();

    await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(adapters.style.run).toHaveBeenCalledTimes(1);
    const input = adapters.style.run.mock.calls[0][0];
    expect(input.styleGuide.prompt_block).toBe("No pink. Keep it heroic.");
    expect(input.brandId).toBe(BRAND_ID);
  });
});

describe("processScreeningRun: disabled screening", () => {
  it("makes no external calls and defers to a human", async () => {
    const db = seed({ config: { enabled: false, requireHumanReview: false } });
    const { adapters, calls } = trackingAdapters();

    const result = await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(calls).toEqual({ aiornot: 0, moderation: 0, style: 0 });
    expect(result.decision).toBe("flagged_manual");
    expect(result.reasons[0].code).toBe("screening_disabled");
  });
});

describe("processScreeningRun: permanent failures", () => {
  it.each([
    ["run", { runId: "missing-run" }, /Screening run not found/],
  ])("marks a missing %s permanent so the queue stops retrying", async (_label, args, matcher) => {
    const db = seed();
    const { adapters } = trackingAdapters();

    await expect(
      processScreeningRun(db, { ...args }, deps(adapters))
    ).rejects.toMatchObject({ permanent: true });

    await expect(processScreeningRun(db, { ...args }, deps(adapters))).rejects.toThrow(matcher);
  });

  it("is permanent when the artwork has been deleted", async () => {
    const db = seed();
    db._tables.artworks.length = 0;
    const { adapters } = trackingAdapters();

    await expect(
      processScreeningRun(db, { runId: RUN_ID }, deps(adapters))
    ).rejects.toMatchObject({ permanent: true });
  });

  it("is permanent when the ruleset has vanished", async () => {
    const db = seed();
    db._tables.rulesets.length = 0;
    const { adapters } = trackingAdapters();

    await expect(
      processScreeningRun(db, { runId: RUN_ID }, deps(adapters))
    ).rejects.toMatchObject({ permanent: true });
  });

  it("is permanent when no adapter is configured for a stage", async () => {
    const db = seed();
    await expect(
      processScreeningRun(db, { runId: RUN_ID, isFinalAttempt: false }, {
        adapters: {},
        loadImage: async () => image,
      })
    ).rejects.toMatchObject({ permanent: true });
  });
});

describe("resolveBrandContext", () => {
  it("takes the brand from the contest running the entry", async () => {
    const db = seed({ withContest: true });
    const context = await resolveBrandContext(db, {
      artworkId: ARTWORK_ID,
      contestEntryId: ENTRY_ID,
    });

    expect(context).toEqual({ brandId: BRAND_ID, contestId: "contest-1" });
  });

  it("falls back to a brand storefront link outside a contest", async () => {
    const db = seed();
    db._tables.brand_artworks.push({ brand_id: "brand-store", artwork_id: ARTWORK_ID });

    const context = await resolveBrandContext(db, { artworkId: ARTWORK_ID });
    expect(context.brandId).toBe("brand-store");
  });

  it("reports no brand when the artwork stands alone", async () => {
    const db = seed();
    const context = await resolveBrandContext(db, { artworkId: ARTWORK_ID });
    expect(context.brandId).toBeNull();
  });
});

describe("startRun", () => {
  let queue;

  beforeEach(() => {
    queue = { enqueueScreening: vi.fn(async () => ({ id: RUN_ID })) };
  });

  it("creates a run against the resolved ruleset and enqueues it", async () => {
    const db = seed();
    db._tables.screening_runs.length = 0;

    const run = await startRun(db, { artworkId: ARTWORK_ID }, { queue });

    expect(run.ruleset_id).toBe(RULESET_ID);
    expect(run.status).toBe("running");
    expect(queue.enqueueScreening).toHaveBeenCalledWith({
      runId: run.id,
      artworkId: ARTWORK_ID,
      contestEntryId: null,
    });
  });

  it("uses the brand ruleset when the entry belongs to a brand's contest", async () => {
    const db = seed({ withContest: true });
    db._tables.screening_runs.length = 0;
    db._tables.rulesets.push({
      id: "brand-ruleset",
      brand_id: BRAND_ID,
      version: 3,
      config: normalizeRulesetConfig({}),
    });

    const run = await startRun(db, { artworkId: ARTWORK_ID, contestEntryId: ENTRY_ID }, { queue });

    expect(run.ruleset_id).toBe("brand-ruleset");
  });

  it("resets a settled artwork to pending when rescreening", async () => {
    const db = seed({ artworkOverrides: { moderation_status: "rejected" } });
    db._tables.screening_runs.length = 0;

    await startRun(db, { artworkId: ARTWORK_ID, actorId: "admin-1", rescreen: true }, { queue });

    expect(db.rows("artworks")[0].moderation_status).toBe("pending");
    expect(db.rows("audited_events")[0].action).toBe("screening.rescreen_requested");
  });

  it("does not touch moderation state on a first screening", async () => {
    const db = seed();
    db._tables.screening_runs.length = 0;

    await startRun(db, { artworkId: ARTWORK_ID }, { queue });

    expect(db.rows("audited_events")).toHaveLength(0);
  });
});

describe("processScreeningRun — resubmission of rejected bytes", () => {
  const IMAGE_HASH = hashBuffer(image.buffer);
  const REJECTED_ID = "artwork-rejected";

  /** Seeds an earlier artwork, rejected, whose bytes hash to the image the loader returns. */
  function withRejectedTwin(options = {}) {
    const db = seed(options);

    db._tables.artworks.push({
      id: REJECTED_ID,
      title: "Same image, earlier attempt",
      description: null,
      file_url: "https://cdn.example/artworks/earlier.png",
      creator_id: "artist-1",
      file_sha256: IMAGE_HASH,
      moderation_status: "rejected",
      moderated_by: null,
      moderated_at: null,
      deleted_at: null,
      created_at: "2026-01-01",
    });

    return db;
  }

  it("routes to a human without calling a single paid adapter", async () => {
    const db = withRejectedTwin();
    const { adapters, calls } = trackingAdapters();

    const result = await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(result.decision).toBe("flagged_manual");
    expect(calls).toEqual({ aiornot: 0, moderation: 0, style: 0 });
  });

  it("names the artwork it matched, so the reviewer can see the precedent", async () => {
    const db = withRejectedTwin();
    const { adapters } = trackingAdapters();

    const result = await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(result.reasons[0]).toMatchObject({
      code: "duplicate_of_rejected",
      duplicate_of_artwork_id: REJECTED_ID,
      sha256: IMAGE_HASH,
    });

    const run = db.rows("screening_runs")[0];
    expect(run.duplicate_of_artwork_id).toBe(REJECTED_ID);
  });

  it("records the hash on the artwork being screened", async () => {
    const db = withRejectedTwin();
    const { adapters } = trackingAdapters();

    await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    const artworkRow = db.rows("artworks").find((row) => row.id === ARTWORK_ID);
    expect(artworkRow.file_sha256).toBe(IMAGE_HASH);
  });

  it("marks the stages skipped rather than leaving them null", async () => {
    const db = withRejectedTwin();
    const { adapters } = trackingAdapters();

    await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    // Read back through a query rather than db.rows(), so the jsonb columns come out parsed the
    // way node-postgres would hand them over.
    const run = await db
      .selectFrom("screening_runs")
      .selectAll()
      .where("id", "=", RUN_ID)
      .executeTakeFirst();

    for (const stage of ["aiornot", "moderation", "style"]) {
      expect(run[stage]).toMatchObject({ status: "skipped", reason: "duplicate_of_rejected" });
    }
  });

  it("still screens normally when the earlier twin was approved", async () => {
    const db = withRejectedTwin();
    db._tables.artworks.find((row) => row.id === REJECTED_ID).moderation_status = "approved";
    const { adapters, calls } = trackingAdapters();

    const result = await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(calls.aiornot).toBe(1);
    expect(calls.moderation).toBe(1);
    expect(result.decision).toBe("auto_approved");
  });

  it("hashes and screens normally when nothing matches", async () => {
    const db = seed();
    const { adapters, calls } = trackingAdapters();

    const result = await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(calls.aiornot).toBe(1);
    expect(result.decision).toBe("auto_approved");

    const artworkRow = db.rows("artworks").find((row) => row.id === ARTWORK_ID);
    expect(artworkRow.file_sha256).toBe(IMAGE_HASH);
  });

  it("does not treat a rescreen of the same artwork as its own duplicate", async () => {
    // The artwork under screening is itself rejected and already carries the hash — exactly the
    // state a rescreen starts from. It must not match itself and skip every stage.
    const db = seed({
      artworkOverrides: { moderation_status: "pending", file_sha256: IMAGE_HASH },
    });
    const { adapters, calls } = trackingAdapters();

    await processScreeningRun(db, { runId: RUN_ID }, deps(adapters));

    expect(calls.aiornot).toBe(1);
  });
});
