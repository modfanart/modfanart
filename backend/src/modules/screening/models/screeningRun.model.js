// src/modules/screening/models/screeningRun.model.js
const { sql } = require("kysely");

/** The three pipeline stages, in the order they are reported. */
const STAGES = ["aiornot", "moderation", "style"];

class ScreeningRun {
  static table = "screening_runs";

  static async create(
    db,
    { artworkId, contestEntryId = null, rulesetId }
  ) {
    return db
      .insertInto("screening_runs")
      .values({
        artwork_id: artworkId,
        contest_entry_id: contestEntryId,
        ruleset_id: rulesetId,
        status: "running",
        started_at: sql`NOW()`,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async findById(db, id) {
    return db
      .selectFrom("screening_runs")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  static async listForArtwork(db, artworkId) {
    return db
      .selectFrom("screening_runs")
      .selectAll()
      .where("artwork_id", "=", artworkId)
      .orderBy("created_at", "desc")
      .execute();
  }

  /**
   * Writes a stage result, but only while that stage is still NULL.
   *
   * This is what makes a retried job cheap and idempotent: a stage that already succeeded is not
   * re-run and not re-billed, and a concurrent duplicate delivery cannot overwrite a result. The
   * `where ... is null` guard is the lock — the return value tells the caller whether it won.
   *
   * @returns {Promise<boolean>} true when this call wrote the stage
   */
  static async saveStageResult(db, runId, stage, result) {
    if (!STAGES.includes(stage)) {
      throw new Error(`Unknown screening stage: ${stage}`);
    }

    const updated = await db
      .updateTable("screening_runs")
      .set({
        [stage]: JSON.stringify(result),
        updated_at: sql`NOW()`,
      })
      .where("id", "=", runId)
      .where(stage, "is", null)
      .returning("id")
      .executeTakeFirst();

    return Boolean(updated);
  }

  /**
   * Records that this run matched an already-rejected image byte for byte.
   *
   * Kept separate from `complete` so a reviewer opening the run can tell an inherited decision
   * from a computed one, and so the metrics endpoint can exclude them from adapter accuracy.
   */
  static async markDuplicate(db, runId, duplicateOfArtworkId) {
    return db
      .updateTable("screening_runs")
      .set({
        duplicate_of_artwork_id: duplicateOfArtworkId,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", runId)
      .returning("id")
      .executeTakeFirst();
  }

  static async complete(db, runId, { decision, reasons }) {
    return db
      .updateTable("screening_runs")
      .set({
        status: "complete",
        decision,
        decision_reasons: JSON.stringify(reasons),
        finished_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", runId)
      .returningAll()
      .executeTakeFirst();
  }

  static async fail(db, runId, message) {
    return db
      .updateTable("screening_runs")
      .set({
        status: "failed",
        error: message ? String(message).slice(0, 2000) : null,
        finished_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", runId)
      .returningAll()
      .executeTakeFirst();
  }

  /** Counts by decision, for /api/moderation/metrics. Computed on read; there is no stats table. */
  static async decisionCounts(db) {
    return db
      .selectFrom("screening_runs")
      .select(["decision", (eb) => eb.fn.countAll().as("count")])
      .groupBy("decision")
      .execute();
  }

  static async statusCounts(db) {
    return db
      .selectFrom("screening_runs")
      .select(["status", (eb) => eb.fn.countAll().as("count")])
      .groupBy("status")
      .execute();
  }
}

module.exports = ScreeningRun;
module.exports.STAGES = STAGES;
