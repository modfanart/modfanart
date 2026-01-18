// src/models/contest.model.js
const { db } = require('../config');           // ← only db
const { sql } = require('kysely');             // ← ADD THIS LINE

/** @typedef {import('../db/types').ContestRow} ContestRow */

class Contest {
  static async findById(id, includeDeleted = false) {
    let q = db.selectFrom('contests').selectAll().where('id', '=', id);
    if (!includeDeleted) q = q.where('deleted_at', 'is', null);
    return q.executeTakeFirst();
  }

  static async findBySlug(slug) {
    return db
      .selectFrom('contests')
      .selectAll()
      .where('slug', '=', slug)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
  }

  static async create(brandId, data) {
    return db
      .insertInto('contests')
      .values({
        brand_id: brandId,
        ...data,
        winner_announced: false,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async updateStatus(id, newStatus) {
    return db
      .updateTable('contests')
      .set({
        status: newStatus,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .execute();
  }

  // Example: active public contests
  static async getActivePublic() {
    return db
      .selectFrom('contests')
      .selectAll()
      .where('status', '=', 'live')
      .where('visibility', '=', 'public')
      .where('deleted_at', 'is', null)
      .where('submission_end_date', '>', sql`NOW()`)
      .orderBy('created_at', 'desc')
      .execute();
  }
}

module.exports = Contest;