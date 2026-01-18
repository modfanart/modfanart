// src/models/notification.model.js
const { db } = require('../config');           // ← only db
const { sql } = require('kysely');             // ← ADD THIS LINE

class Notification {
  static async create(userId, type, title, body = null, data = {}) {
    return db
      .insertInto('notifications')
      .values({
        user_id: userId,
        type,
        title,
        body,
        data,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async markAsRead(id) {
    return db
      .updateTable('notifications')
      .set({ read_at: sql`NOW()` })
      .where('id', '=', id)
      .execute();
  }

  static async markAllAsReadForUser(userId) {
    return db
      .updateTable('notifications')
      .set({ read_at: sql`NOW()` })
      .where('user_id', '=', userId)
      .where('read_at', 'is', null)
      .execute();
  }

  static async getUnreadForUser(userId, limit = 20) {
    return db
      .selectFrom('notifications')
      .selectAll()
      .where('user_id', '=', userId)
      .where('read_at', 'is', null)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();
  }

  static async getRecentForUser(userId, limit = 50) {
    return db
      .selectFrom('notifications')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();
  }
}

module.exports = Notification;