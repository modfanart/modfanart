// src/models/userViolation.model.js
const { db } = require('../config');           // ← only db
const { sql } = require('kysely');             // ← ADD THIS LINE

class UserViolation {
  static async report(userId, reportedBy, violationType, description, entityType = null, entityId = null) {
    return db
      .insertInto('user_violations')
      .values({
        user_id: userId,
        reported_by: reportedBy,
        violation_type: violationType,
        description,
        entity_type: entityType,
        entity_id: entityId,
        status: 'open',
        strike_issued: false,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async issueStrike(id, resolverId) {
    return db
      .updateTable('user_violations')
      .set({
        strike_issued: true,
        resolved_by: resolverId,
        resolved_at: sql`NOW()`,
        status: 'resolved',
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static async resolve(id, resolverId, finalStatus = 'resolved') {
    return db
      .updateTable('user_violations')
      .set({
        status: finalStatus,
        resolved_by: resolverId,
        resolved_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .execute();
  }

  static async getOpenViolationsForUser(userId) {
    return db
      .selectFrom('user_violations')
      .selectAll()
      .where('user_id', '=', userId)
      .where('status', '=', 'open')
      .orderBy('created_at', 'desc')
      .execute();
  }
}

module.exports = UserViolation;