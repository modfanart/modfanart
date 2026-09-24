import { beforeEach, describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  IllegalTransitionError,
  MODERATION_STATUS,
  applyHumanReview,
  applyScreeningDecision,
  assertTransitionAllowed,
  markPending,
} = require("./transition.service.js");
const { DECISIONS } = require("./decision.engine.js");
const { createFakeDb } = require("../__fixtures__/fakeDb.js");

const ARTWORK_ID = "artwork-1";
const ENTRY_ID = "entry-1";
const RUN_ID = "run-1";
const REVIEWER_ID = "reviewer-1";

function seed({ artworkStatus = "pending", entryStatus = "pending", queue = [] } = {}) {
  return createFakeDb({
    artworks: [
      { id: ARTWORK_ID, moderation_status: artworkStatus, moderated_by: null, moderated_at: null },
    ],
    contest_entries: [
      {
        id: ENTRY_ID,
        artwork_id: ARTWORK_ID,
        moderation_status: entryStatus,
        moderated_by: null,
        moderated_at: null,
      },
    ],
    moderation_queue: queue,
    audited_events: [],
  });
}

// --- Transition legality -------------------------------------------------------------------

describe("assertTransitionAllowed", () => {
  const allStatuses = Object.values(MODERATION_STATUS);

  it("treats a missing current status as pending", () => {
    expect(() => assertTransitionAllowed(null, MODERATION_STATUS.APPROVED)).not.toThrow();
    expect(() => assertTransitionAllowed(undefined, MODERATION_STATUS.FLAGGED)).not.toThrow();
  });

  it.each(allStatuses)("refuses the no-op transition %s -> itself", (status) => {
    expect(() => assertTransitionAllowed(status, status)).toThrow(IllegalTransitionError);
  });

  it.each([
    ["pending", "approved"],
    ["pending", "rejected"],
    ["pending", "flagged"],
    ["flagged", "approved"],
    ["flagged", "rejected"],
    ["flagged", "pending"],
    ["approved", "rejected"],
    ["rejected", "approved"],
  ])("allows %s -> %s", (from, to) => {
    expect(() => assertTransitionAllowed(from, to)).not.toThrow();
  });

  it("refuses a status this module does not model", () => {
    expect(() => assertTransitionAllowed("pending", "quarantined")).toThrow(
      IllegalTransitionError
    );
  });

  it("refuses to act on a current status it does not recognise, rather than overwriting it", () => {
    expect(() => assertTransitionAllowed("legacy_unknown", "approved")).toThrow(
      IllegalTransitionError
    );
  });

  it("carries the offending pair and an HTTP status on the error", () => {
    try {
      assertTransitionAllowed("approved", "approved");
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(IllegalTransitionError);
      expect(error.from).toBe("approved");
      expect(error.to).toBe("approved");
      expect(error.status).toBe(409);
    }
  });
});

// --- Automated decisions -------------------------------------------------------------------

describe("applyScreeningDecision", () => {
  it.each([
    [DECISIONS.AUTO_APPROVED, "approved"],
    [DECISIONS.AUTO_REJECTED, "rejected"],
    [DECISIONS.FLAGGED_MANUAL, "flagged"],
  ])("maps %s onto moderation_status %s", async (decision, expected) => {
    const db = seed();
    const result = await applyScreeningDecision(db, {
      runId: RUN_ID,
      artworkId: ARTWORK_ID,
      decision,
      reasons: [{ code: "test" }],
    });

    expect(result.moderationStatus).toBe(expected);
    expect(db.rows("artworks")[0].moderation_status).toBe(expected);
  });

  it("writes an audit event for every legal transition", async () => {
    for (const decision of Object.values(DECISIONS)) {
      const db = seed();
      await applyScreeningDecision(db, {
        runId: RUN_ID,
        artworkId: ARTWORK_ID,
        decision,
        reasons: [{ code: "test" }],
      });

      const events = db.rows("audited_events");
      expect(events).toHaveLength(1);
      expect(events[0].action).toBe("screening.decision");
      expect(events[0].entity_id).toBe(ARTWORK_ID);
      expect(JSON.parse(events[0].old_values).moderation_status).toBe("pending");
      expect(JSON.parse(events[0].new_values).decision).toBe(decision);
    }
  });

  it("records the reasons on the audit event so a verdict can be explained later", async () => {
    const db = seed();
    const reasons = [{ code: "authenticity_borderline", humanConfidence: 0.7 }];

    await applyScreeningDecision(db, {
      runId: RUN_ID,
      artworkId: ARTWORK_ID,
      decision: DECISIONS.FLAGGED_MANUAL,
      reasons,
    });

    expect(JSON.parse(db.rows("audited_events")[0].new_values).reasons).toEqual(reasons);
  });

  it("leaves moderated_by null for an automated decision, marking it as machine-made", async () => {
    const db = seed();
    await applyScreeningDecision(db, {
      runId: RUN_ID,
      artworkId: ARTWORK_ID,
      decision: DECISIONS.AUTO_APPROVED,
    });

    expect(db.rows("artworks")[0].moderated_by).toBeNull();
    expect(db.rows("artworks")[0].moderated_at).not.toBeNull();
  });

  it("updates the contest entry alongside the artwork", async () => {
    const db = seed();
    const result = await applyScreeningDecision(db, {
      runId: RUN_ID,
      artworkId: ARTWORK_ID,
      contestEntryId: ENTRY_ID,
      decision: DECISIONS.AUTO_APPROVED,
    });

    expect(result.contestEntryIds).toEqual([ENTRY_ID]);
    expect(db.rows("contest_entries")[0].moderation_status).toBe("approved");
  });

  it("enqueues a review task only for a flagged decision", async () => {
    for (const decision of [DECISIONS.AUTO_APPROVED, DECISIONS.AUTO_REJECTED]) {
      const db = seed();
      await applyScreeningDecision(db, {
        runId: RUN_ID,
        artworkId: ARTWORK_ID,
        decision,
      });
      expect(db.rows("moderation_queue")).toHaveLength(0);
    }

    const db = seed();
    await applyScreeningDecision(db, {
      runId: RUN_ID,
      artworkId: ARTWORK_ID,
      decision: DECISIONS.FLAGGED_MANUAL,
      reasons: [{ code: "authenticity_borderline" }],
    });

    const queue = db.rows("moderation_queue");
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      entity_type: "artwork",
      entity_id: ARTWORK_ID,
      status: "pending",
      screening_run_id: RUN_ID,
    });
    expect(JSON.parse(queue[0].rule_matches)).toEqual([{ code: "authenticity_borderline" }]);
  });

  it("queues under the contest entry when there is one, so reviewers see contest context", async () => {
    const db = seed();
    await applyScreeningDecision(db, {
      runId: RUN_ID,
      artworkId: ARTWORK_ID,
      contestEntryId: ENTRY_ID,
      decision: DECISIONS.FLAGGED_MANUAL,
    });

    expect(db.rows("moderation_queue")[0]).toMatchObject({
      entity_type: "contest_entry",
      entity_id: ENTRY_ID,
    });
  });

  it("does not create a second review task when rescreening an already-queued item", async () => {
    const db = seed({
      queue: [
        {
          id: "queue-1",
          entity_type: "artwork",
          entity_id: ARTWORK_ID,
          status: "pending",
          priority: 0,
        },
      ],
    });

    await applyScreeningDecision(db, {
      runId: "run-2",
      artworkId: ARTWORK_ID,
      decision: DECISIONS.FLAGGED_MANUAL,
      reasons: [{ code: "fresh" }],
    });

    const queue = db.rows("moderation_queue");
    expect(queue).toHaveLength(1);
    // The existing task is refreshed to point at the newer run.
    expect(queue[0].screening_run_id).toBe("run-2");
  });

  it("rejects an unknown decision rather than inventing a status", async () => {
    await expect(
      applyScreeningDecision(seed(), {
        runId: RUN_ID,
        artworkId: ARTWORK_ID,
        decision: "probably_fine",
      })
    ).rejects.toThrow(/Unknown screening decision/);
  });

  it("throws on an illegal transition and writes nothing at all", async () => {
    const db = seed({ artworkStatus: "approved" });

    await expect(
      applyScreeningDecision(db, {
        runId: RUN_ID,
        artworkId: ARTWORK_ID,
        decision: DECISIONS.AUTO_APPROVED,
      })
    ).rejects.toThrow(IllegalTransitionError);

    expect(db.rows("artworks")[0].moderation_status).toBe("approved");
    expect(db.rows("audited_events")).toHaveLength(0);
  });

  it("rolls the whole transaction back when a later step fails", async () => {
    const db = seed({ artworkStatus: "pending", entryStatus: "approved" });

    // artwork pending -> approved is legal; entry approved -> approved is not, so the entry
    // check must undo the artwork write rather than leave a half-applied decision.
    await expect(
      applyScreeningDecision(db, {
        runId: RUN_ID,
        artworkId: ARTWORK_ID,
        contestEntryId: ENTRY_ID,
        decision: DECISIONS.AUTO_APPROVED,
      })
    ).rejects.toThrow(IllegalTransitionError);

    expect(db.rows("artworks")[0].moderation_status).toBe("pending");
    expect(db.rows("audited_events")).toHaveLength(0);
  });

  it("fails loudly when the artwork does not exist", async () => {
    await expect(
      applyScreeningDecision(seed(), {
        runId: RUN_ID,
        artworkId: "missing",
        decision: DECISIONS.AUTO_APPROVED,
      })
    ).rejects.toThrow(/Artwork not found/);
  });
});

// --- Human review --------------------------------------------------------------------------

describe("applyHumanReview", () => {
  let db;

  beforeEach(() => {
    db = seed({
      artworkStatus: "flagged",
      entryStatus: "flagged",
      queue: [
        {
          id: "queue-1",
          entity_type: "artwork",
          entity_id: ARTWORK_ID,
          status: "pending",
          priority: 0,
          screening_run_id: RUN_ID,
          rule_matches: JSON.stringify([{ code: "authenticity_borderline" }]),
        },
      ],
    });
  });

  it.each([
    ["approved", "approved"],
    ["rejected", "rejected"],
  ])("applies a %s verdict to the entity", async (decision, expected) => {
    const result = await applyHumanReview(db, {
      queueItemId: "queue-1",
      reviewerId: REVIEWER_ID,
      decision,
    });

    expect(result.moderationStatus).toBe(expected);
    expect(db.rows("artworks")[0].moderation_status).toBe(expected);
    expect(db.rows("artworks")[0].moderated_by).toBe(REVIEWER_ID);
  });

  it("closes the queue item and records who decided", async () => {
    await applyHumanReview(db, {
      queueItemId: "queue-1",
      reviewerId: REVIEWER_ID,
      decision: "approved",
      notes: "hand-drawn, verified",
    });

    const item = db.rows("moderation_queue")[0];
    expect(item.status).toBe("reviewed");
    expect(item.reviewed_by).toBe(REVIEWER_ID);
    expect(item.decision).toBe("approved");
    expect(item.notes).toBe("hand-drawn, verified");
  });

  it("keeps an escalation in the queue at raised priority instead of settling it", async () => {
    const result = await applyHumanReview(db, {
      queueItemId: "queue-1",
      reviewerId: REVIEWER_ID,
      decision: "escalated",
    });

    const item = db.rows("moderation_queue")[0];
    expect(result.moderationStatus).toBe("flagged");
    expect(item.status).toBe("pending");
    expect(item.priority).toBe(10);
    expect(db.rows("artworks")[0].moderation_status).toBe("flagged");
  });

  it("writes an audit event carrying the override", async () => {
    await applyHumanReview(db, {
      queueItemId: "queue-1",
      reviewerId: REVIEWER_ID,
      decision: "approved",
      notes: "overriding the AI",
    });

    const event = db.rows("audited_events")[0];
    expect(event.action).toBe("screening.human_review");
    expect(event.actor_id).toBe(REVIEWER_ID);
    expect(JSON.parse(event.old_values).moderation_status).toBe("flagged");
    expect(JSON.parse(event.new_values)).toMatchObject({
      moderation_status: "approved",
      decision: "approved",
      notes: "overriding the AI",
      screening_run_id: RUN_ID,
    });
  });

  it("settles the underlying artwork when a contest entry is reviewed", async () => {
    const entryDb = seed({
      artworkStatus: "flagged",
      entryStatus: "flagged",
      queue: [
        {
          id: "queue-2",
          entity_type: "contest_entry",
          entity_id: ENTRY_ID,
          status: "pending",
          priority: 0,
        },
      ],
    });

    await applyHumanReview(entryDb, {
      queueItemId: "queue-2",
      reviewerId: REVIEWER_ID,
      decision: "approved",
    });

    expect(entryDb.rows("contest_entries")[0].moderation_status).toBe("approved");
    expect(entryDb.rows("artworks")[0].moderation_status).toBe("approved");
  });

  it("refuses to review the same item twice", async () => {
    await applyHumanReview(db, {
      queueItemId: "queue-1",
      reviewerId: REVIEWER_ID,
      decision: "approved",
    });

    await expect(
      applyHumanReview(db, {
        queueItemId: "queue-1",
        reviewerId: REVIEWER_ID,
        decision: "rejected",
      })
    ).rejects.toMatchObject({ status: 409 });
  });

  it("requires an attributable reviewer", async () => {
    await expect(
      applyHumanReview(db, { queueItemId: "queue-1", reviewerId: null, decision: "approved" })
    ).rejects.toThrow(/who made it/);
  });

  it("rejects an unknown verdict", async () => {
    await expect(
      applyHumanReview(db, {
        queueItemId: "queue-1",
        reviewerId: REVIEWER_ID,
        decision: "maybe",
      })
    ).rejects.toThrow(/Unknown human review decision/);
  });

  it("404s on a missing queue item", async () => {
    await expect(
      applyHumanReview(db, {
        queueItemId: "nope",
        reviewerId: REVIEWER_ID,
        decision: "approved",
      })
    ).rejects.toMatchObject({ status: 404 });
  });

  it("refuses an entity type screening does not own, such as a reported comment", async () => {
    const commentDb = seed({
      queue: [
        {
          id: "queue-3",
          entity_type: "comment",
          entity_id: "comment-1",
          status: "pending",
          priority: 0,
        },
      ],
    });

    await expect(
      applyHumanReview(commentDb, {
        queueItemId: "queue-3",
        reviewerId: REVIEWER_ID,
        decision: "approved",
      })
    ).rejects.toMatchObject({ status: 422 });
  });

  it("leaves nothing written when the review fails", async () => {
    await expect(
      applyHumanReview(db, {
        queueItemId: "queue-1",
        reviewerId: REVIEWER_ID,
        decision: "maybe",
      })
    ).rejects.toThrow();

    expect(db.rows("audited_events")).toHaveLength(0);
    expect(db.rows("moderation_queue")[0].status).toBe("pending");
  });
});

// --- Rescreen reset ------------------------------------------------------------------------

describe("markPending", () => {
  it("resets a settled artwork so the next verdict is a legal transition", async () => {
    const db = seed({ artworkStatus: "rejected" });
    const result = await markPending(db, { artworkId: ARTWORK_ID, actorId: REVIEWER_ID });

    expect(result.changed).toBe(true);
    expect(db.rows("artworks")[0].moderation_status).toBe("pending");
    expect(db.rows("audited_events")[0].action).toBe("screening.rescreen_requested");
  });

  it("is a no-op, with no audit noise, when already pending", async () => {
    const db = seed({ artworkStatus: "pending" });
    const result = await markPending(db, { artworkId: ARTWORK_ID });

    expect(result.changed).toBe(false);
    expect(db.rows("audited_events")).toHaveLength(0);
  });

  it("resets the contest entry too", async () => {
    const db = seed({ artworkStatus: "approved", entryStatus: "approved" });
    await markPending(db, { artworkId: ARTWORK_ID, contestEntryId: ENTRY_ID });

    expect(db.rows("contest_entries")[0].moderation_status).toBe("pending");
  });
});
