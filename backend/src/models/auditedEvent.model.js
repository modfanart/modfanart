// src/models/auditedEvent.model.js
const { db } = require('../config'); // ← only db
const { sql } = require('kysely'); // ← ADD THIS LINE

class AuditedEvent {
  static async log(
    actorId,
    action,
    entityType = null,
    entityId = null,
    oldValues = null,
    newValues = null,
    ip = null,
    userAgent = null
  ) {
    return db
      .insertInto('audited_events')
      .values({
        actor_id: actorId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ip,
        user_agent: userAgent,
        created_at: sql`NOW()`,
      })
      .execute(); // usually fire-and-forget
  }

  // Example: get recent actions by actor
  static async getRecentByActor(actorId, limit = 50) {
    return db
      .selectFrom('audited_events')
      .selectAll()
      .where('actor_id', '=', actorId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();
  }
}

module.exports = AuditedEvent;
