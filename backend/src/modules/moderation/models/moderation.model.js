// src/models/moderationQueue.model.js
const { db } = require("../../../config"); // ← only db
const { sql } = require("kysely"); // ← ADD THIS LINE

class ModerationQueue {
  static async enqueue(entityType, entityId, priority = 0) {
    return db
      .insertInto("moderation_queue")
      .values({
        entity_type: entityType,
        entity_id: entityId,
        status: "pending",
        priority,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async assign(id, moderatorId) {
    return db
      .updateTable("moderation_queue")
      .set({
        assigned_to: moderatorId,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", id)
      .where("status", "=", "pending")
      .returningAll()
      .executeTakeFirst();
  }

  static async decide(id, moderatorId, decision, notes = null) {
    return db
      .updateTable("moderation_queue")
      .set({
        status: "reviewed",
        reviewed_by: moderatorId,
        reviewed_at: sql`NOW()`,
        decision,
        notes,
        updated_at: sql`NOW()`,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Files a user-submitted report.
   *
   * Takes `db` explicitly, unlike the older methods above, so it can be exercised without a live
   * database (the module-level `db` import connects at load time and exits the process on
   * failure). New methods here follow that convention.
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

  static async getPendingItems(limit = 50, offset = 0) {
    return db
      .selectFrom("moderation_queue")
      .selectAll()
      .where("status", "=", "pending")
      .orderBy("priority", "desc")
      .orderBy("created_at", "asc")
      .limit(limit)
      .offset(offset)
      .execute();
  }
}

module.exports = ModerationQueue;
