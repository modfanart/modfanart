// The single write path for screening moderation state.
//
// Nothing else in the codebase may write `artworks.moderation_status`,
// `contest_entries.moderation_status` or `moderation_queue.status` on behalf of screening. Routing
// every change through one function is what guarantees the audit trail is complete: the
// `audited_events` insert happens in the same transaction as the status change, so a status can
// never exist without a recorded explanation.
//
// Grep check for reviewers: `moderation_status` should only be assigned in this file (plus the
// screening migration and the pre-existing artwork publish/moderate paths).
const { sql } = require("kysely");

const { DECISIONS } = require("./decision.engine");

/** Moderation states an artwork or contest entry can be in. */
const MODERATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  FLAGGED: "flagged",
};

/**
 * Legal moderation-status transitions.
 *
 * `pending` is the entry point. Terminal states can still be revisited by a human override or a
 * rescreen — an artwork rejected in error must be recoverable — but a state may not transition to
 * itself, which would write a no-op audit row and hide a double-delivered job.
 */
const ALLOWED_TRANSITIONS = {
  [MODERATION_STATUS.PENDING]: [
    MODERATION_STATUS.APPROVED,
    MODERATION_STATUS.REJECTED,
    MODERATION_STATUS.FLAGGED,
  ],
  [MODERATION_STATUS.FLAGGED]: [
    MODERATION_STATUS.APPROVED,
    MODERATION_STATUS.REJECTED,
    MODERATION_STATUS.PENDING,
  ],
  [MODERATION_STATUS.APPROVED]: [
    MODERATION_STATUS.REJECTED,
    MODERATION_STATUS.FLAGGED,
    MODERATION_STATUS.PENDING,
  ],
  [MODERATION_STATUS.REJECTED]: [
    MODERATION_STATUS.APPROVED,
    MODERATION_STATUS.FLAGGED,
    MODERATION_STATUS.PENDING,
  ],
};

/** The moderation status each automated decision maps onto. */
const DECISION_TO_STATUS = {
  [DECISIONS.AUTO_APPROVED]: MODERATION_STATUS.APPROVED,
  [DECISIONS.AUTO_REJECTED]: MODERATION_STATUS.REJECTED,
  [DECISIONS.FLAGGED_MANUAL]: MODERATION_STATUS.FLAGGED,
};

/** Human review outcomes, as accepted by POST /api/moderation/queue/:id/resolve. */
const HUMAN_DECISION_TO_STATUS = {
  approved: MODERATION_STATUS.APPROVED,
  rejected: MODERATION_STATUS.REJECTED,
  // An escalation is explicitly not a verdict: it stays out of the published set and goes back
  // into the queue for someone with more authority.
  escalated: MODERATION_STATUS.FLAGGED,
};

const ENTITY_TABLES = {
  artwork: "artworks",
  contest_entry: "contest_entries",
};

class IllegalTransitionError extends Error {
  constructor(from, to) {
    super(`Illegal moderation transition: ${from} -> ${to}`);
    this.name = "IllegalTransitionError";
    this.from = from;
    this.to = to;
    this.status = 409;
  }
}

function assertTransitionAllowed(from, to) {
  const current = from ?? MODERATION_STATUS.PENDING;

  if (!Object.values(MODERATION_STATUS).includes(to)) {
    throw new IllegalTransitionError(current, to);
  }

  const allowed = ALLOWED_TRANSITIONS[current];

  // An unrecognised current value means the row holds something this module does not model.
  // Refusing is safer than overwriting state whose meaning we do not know.
  if (!allowed || !allowed.includes(to)) {
    throw new IllegalTransitionError(current, to);
  }
}

async function insertAuditEvent(trx, { actorId, action, entityType, entityId, oldValues, newValues }) {
  return trx
    .insertInto("audited_events")
    .values({
      actor_id: actorId ?? null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: JSON.stringify(oldValues ?? null),
      new_values: JSON.stringify(newValues ?? null),
      created_at: sql`NOW()`,
    })
    .returningAll()
    .executeTakeFirst();
}

/**
 * Applies a screening decision to an artwork (and its contest entry, when there is one).
 *
 * Everything happens in one transaction: the status changes, the audit row and the review-queue
 * enqueue either all land or none do. A flagged decision that failed to enqueue would strand the
 * submission in a state nobody is looking at.
 *
 * @param {import('kysely').Kysely<any>} db
 * @param {object} params
 * @param {string} params.runId
 * @param {string} params.artworkId
 * @param {string | null} [params.contestEntryId]
 * @param {string} params.decision one of DECISIONS
 * @param {Array<object>} params.reasons ordered rule hits from the decision engine
 * @param {string | null} [params.actorId] null for automated decisions
 * @param {number} [params.priority] review queue priority
 */
async function applyScreeningDecision(
  db,
  {
    runId,
    artworkId,
    contestEntryId = null,
    decision,
    reasons = [],
    actorId = null,
    priority = 0,
  }
) {
  const target = DECISION_TO_STATUS[decision];

  if (!target) {
    throw new Error(`Unknown screening decision: ${decision}`);
  }

  return db.transaction().execute(async (trx) => {
    const artwork = await trx
      .selectFrom("artworks")
      .select(["id", "moderation_status"])
      .where("id", "=", artworkId)
      .executeTakeFirst();

    if (!artwork) {
      throw new Error(`Artwork not found: ${artworkId}`);
    }

    assertTransitionAllowed(artwork.moderation_status, target);

    await trx
      .updateTable("artworks")
      .set({
        moderation_status: target,
        // An automated decision has no human moderator; leaving `moderated_by` null is what
        // distinguishes a machine verdict from a human one in the audit trail.
        moderated_by: actorId,
        moderated_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", artworkId)
      .execute();

    const entries = [];

    if (contestEntryId) {
      const entry = await trx
        .selectFrom("contest_entries")
        .select(["id", "moderation_status"])
        .where("id", "=", contestEntryId)
        .executeTakeFirst();

      if (entry) {
        assertTransitionAllowed(entry.moderation_status, target);

        await trx
          .updateTable("contest_entries")
          .set({
            moderation_status: target,
            moderated_by: actorId,
            moderated_at: sql`NOW()`,
            updated_at: sql`NOW()`,
          })
          .where("id", "=", contestEntryId)
          .execute();

        entries.push(entry.id);
      }
    }

    let queueItem = null;

    if (target === MODERATION_STATUS.FLAGGED) {
      queueItem = await enqueueForReview(trx, {
        runId,
        artworkId,
        contestEntryId,
        reasons,
        priority,
      });
    }

    await insertAuditEvent(trx, {
      actorId,
      action: "screening.decision",
      entityType: "artwork",
      entityId: artworkId,
      oldValues: { moderation_status: artwork.moderation_status },
      newValues: {
        moderation_status: target,
        decision,
        screening_run_id: runId,
        contest_entry_id: contestEntryId,
        reasons,
      },
    });

    return {
      moderationStatus: target,
      artworkId,
      contestEntryIds: entries,
      queueItem,
    };
  });
}

/**
 * Puts a flagged submission in front of a human.
 *
 * Reuses the pre-existing polymorphic `moderation_queue` rather than a screening-specific table,
 * so screening flags and user reports land in one place for reviewers. Note `entity_id` is `text`
 * in the live schema, not `uuid`.
 */
async function enqueueForReview(
  trx,
  { runId, artworkId, contestEntryId = null, reasons = [], priority = 0 }
) {
  const entityType = contestEntryId ? "contest_entry" : "artwork";
  const entityId = contestEntryId ?? artworkId;

  // A rescreen of an already-queued item should not create a second review task.
  const existing = await trx
    .selectFrom("moderation_queue")
    .select(["id"])
    .where("entity_type", "=", entityType)
    .where("entity_id", "=", entityId)
    .where("status", "=", "pending")
    .executeTakeFirst();

  if (existing) {
    return trx
      .updateTable("moderation_queue")
      .set({
        screening_run_id: runId,
        rule_matches: JSON.stringify(reasons),
        priority,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", existing.id)
      .returningAll()
      .executeTakeFirst();
  }

  return trx
    .insertInto("moderation_queue")
    .values({
      entity_type: entityType,
      entity_id: entityId,
      status: "pending",
      priority,
      screening_run_id: runId,
      rule_matches: JSON.stringify(reasons),
      created_at: sql`NOW()`,
      updated_at: sql`NOW()`,
    })
    .returningAll()
    .executeTakeFirst();
}

/**
 * Records a human's verdict on a queued item, overriding whatever the pipeline concluded.
 *
 * @param {import('kysely').Kysely<any>} db
 * @param {object} params
 * @param {string} params.queueItemId
 * @param {string} params.reviewerId
 * @param {'approved'|'rejected'|'escalated'} params.decision
 * @param {string | null} [params.notes]
 */
async function applyHumanReview(
  db,
  { queueItemId, reviewerId, decision, notes = null }
) {
  const target = HUMAN_DECISION_TO_STATUS[decision];

  if (!target) {
    throw new Error(`Unknown human review decision: ${decision}`);
  }

  if (!reviewerId) {
    throw new Error("A human review must record who made it");
  }

  return db.transaction().execute(async (trx) => {
    const item = await trx
      .selectFrom("moderation_queue")
      .selectAll()
      .where("id", "=", queueItemId)
      .executeTakeFirst();

    if (!item) {
      const err = new Error(`Moderation queue item not found: ${queueItemId}`);
      err.status = 404;
      throw err;
    }

    if (item.status !== "pending") {
      const err = new Error("This item has already been reviewed");
      err.status = 409;
      throw err;
    }

    const table = ENTITY_TABLES[item.entity_type];

    if (!table) {
      const err = new Error(
        `Screening review cannot resolve entity type: ${item.entity_type}`
      );
      err.status = 422;
      throw err;
    }

    const entity = await trx
      .selectFrom(table)
      .select(["id", "moderation_status"])
      .where("id", "=", item.entity_id)
      .executeTakeFirst();

    if (!entity) {
      const err = new Error(`${item.entity_type} not found: ${item.entity_id}`);
      err.status = 404;
      throw err;
    }

    // An escalation deliberately leaves the entity flagged. Asserting flagged -> flagged would
    // throw, so only a status change is validated and written.
    if (entity.moderation_status !== target) {
      assertTransitionAllowed(entity.moderation_status, target);

      await trx
        .updateTable(table)
        .set({
          moderation_status: target,
          moderated_by: reviewerId,
          moderated_at: sql`NOW()`,
          updated_at: sql`NOW()`,
        })
        .where("id", "=", item.entity_id)
        .execute();

      // Approving or rejecting a contest entry should settle the underlying artwork too,
      // otherwise the artwork stays flagged and invisible in the gallery.
      if (item.entity_type === "contest_entry") {
        const entry = await trx
          .selectFrom("contest_entries")
          .select(["artwork_id"])
          .where("id", "=", item.entity_id)
          .executeTakeFirst();

        if (entry?.artwork_id) {
          const artwork = await trx
            .selectFrom("artworks")
            .select(["id", "moderation_status"])
            .where("id", "=", entry.artwork_id)
            .executeTakeFirst();

          if (artwork && artwork.moderation_status !== target) {
            assertTransitionAllowed(artwork.moderation_status, target);

            await trx
              .updateTable("artworks")
              .set({
                moderation_status: target,
                moderated_by: reviewerId,
                moderated_at: sql`NOW()`,
                updated_at: sql`NOW()`,
              })
              .where("id", "=", entry.artwork_id)
              .execute();
          }
        }
      }
    }

    const resolvedStatus = decision === "escalated" ? "pending" : "reviewed";

    const updatedItem = await trx
      .updateTable("moderation_queue")
      .set({
        status: resolvedStatus,
        reviewed_by: reviewerId,
        reviewed_at: sql`NOW()`,
        decision,
        notes,
        // An escalation raises priority so it surfaces above ordinary pending work.
        priority: decision === "escalated" ? (item.priority ?? 0) + 10 : item.priority,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", queueItemId)
      .returningAll()
      .executeTakeFirst();

    await insertAuditEvent(trx, {
      actorId: reviewerId,
      action: "screening.human_review",
      entityType: item.entity_type,
      entityId: item.entity_id,
      oldValues: {
        moderation_status: entity.moderation_status,
        queue_status: item.status,
        automated_decision: item.rule_matches ? "flagged_manual" : null,
      },
      newValues: {
        moderation_status: target,
        queue_status: resolvedStatus,
        decision,
        notes,
        screening_run_id: item.screening_run_id ?? null,
      },
    });

    return { queueItem: updatedItem, moderationStatus: target };
  });
}

/**
 * Moves a submission back to `pending` at the start of a rescreen, so the eventual verdict is a
 * legal transition and the audit trail shows the reset.
 */
async function markPending(db, { artworkId, contestEntryId = null, actorId = null }) {
  return db.transaction().execute(async (trx) => {
    const artwork = await trx
      .selectFrom("artworks")
      .select(["id", "moderation_status"])
      .where("id", "=", artworkId)
      .executeTakeFirst();

    if (!artwork) {
      throw new Error(`Artwork not found: ${artworkId}`);
    }

    if (artwork.moderation_status === MODERATION_STATUS.PENDING) {
      return { moderationStatus: MODERATION_STATUS.PENDING, changed: false };
    }

    assertTransitionAllowed(artwork.moderation_status, MODERATION_STATUS.PENDING);

    await trx
      .updateTable("artworks")
      .set({
        moderation_status: MODERATION_STATUS.PENDING,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", artworkId)
      .execute();

    if (contestEntryId) {
      await trx
        .updateTable("contest_entries")
        .set({
          moderation_status: MODERATION_STATUS.PENDING,
          updated_at: sql`NOW()`,
        })
        .where("id", "=", contestEntryId)
        .execute();
    }

    await insertAuditEvent(trx, {
      actorId,
      action: "screening.rescreen_requested",
      entityType: "artwork",
      entityId: artworkId,
      oldValues: { moderation_status: artwork.moderation_status },
      newValues: { moderation_status: MODERATION_STATUS.PENDING },
    });

    return { moderationStatus: MODERATION_STATUS.PENDING, changed: true };
  });
}

module.exports = {
  ALLOWED_TRANSITIONS,
  DECISION_TO_STATUS,
  HUMAN_DECISION_TO_STATUS,
  IllegalTransitionError,
  MODERATION_STATUS,
  applyHumanReview,
  applyScreeningDecision,
  assertTransitionAllowed,
  markPending,
};
