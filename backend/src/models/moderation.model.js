// src/models/moderationQueue.model.js
const { db } = require('../config'); // ← only db
const { sql } = require('kysely'); // ← ADD THIS LINE

class ModerationQueue {
  static async enqueue(entityType, entityId, priority = 0) {
    return db
      .insertInto('moderation_queue')
      .values({
        entity_type: entityType,
        entity_id: entityId,
        status: 'pending',
        priority,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async assign(id, moderatorId) {
    return db
      .updateTable('moderation_queue')
      .set({
        assigned_to: moderatorId,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .where('status', '=', 'pending')
      .returningAll()
      .executeTakeFirst();
  }

  static async decide(id, moderatorId, decision, notes = null) {
    return db
      .updateTable('moderation_queue')
      .set({
        status: 'reviewed',
        reviewed_by: moderatorId,
        reviewed_at: sql`NOW()`,
        decision,
        notes,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static async getPendingItems(limit = 50, offset = 0) {
    return db
      .selectFrom('moderation_queue')
      .selectAll()
      .where('status', '=', 'pending')
      .orderBy('priority', 'desc')
      .orderBy('created_at', 'asc')
      .limit(limit)
      .offset(offset)
      .execute();
  }
}

module.exports = ModerationQueue;
