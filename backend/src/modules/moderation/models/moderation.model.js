// src/modules/moderation/models/moderation.model.js
//
// Methods take `db` explicitly so they can be exercised without a live database: `src/config`
// connects at load time and exits the process on failure. Screening's own writes to this table
// (enqueueing a flagged run, resolving an item) live in the screening transition service, the
// single write path for review state.
const { sql } = require("kysely");

class ModerationQueue {
  static async findById(db, id) {
    return db
      .selectFrom("moderation_queue")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  /**
   * Files a user-submitted report.
   *
   * The structured payload goes in `rule_matches` next to the human-readable `notes`: a reviewer
   * needs the reporter and the claimed violation type, and `moderation_queue` has no dedicated
   * columns for them. `notes` alone would mean parsing prose to find out who reported what.
   */
  static async enqueueReport(
    db,
    { entityType, entityId, violationType, description = null, reporterId = null, priority = 0 }
  ) {
    return db
      .insertInto("moderation_queue")
      .values({
        entity_type: entityType,
        entity_id: entityId,
        status: "pending",
        priority,
        notes: description
          ? `[report:${violationType}] ${description}`
          : `[report:${violationType}]`,
        rule_matches: JSON.stringify({
          source: "user_report",
          violation_type: violationType,
          description,
          reporter_id: reporterId,
        }),
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }
}

module.exports = ModerationQueue;
