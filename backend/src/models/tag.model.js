// src/models/tag.model.js
const { db } = require('../config');           // ← only db
const { sql } = require('kysely');             // ← ADD THIS LINE

/** @typedef {import('../db/types').TagRow} TagRow */

class Tag {
  static async findByNameOrSlug(value) {
    return db
      .selectFrom('tags')
      .selectAll()
      .where((eb) => eb.or([
        eb('name', '=', value),
        eb('slug', '=', value),
      ]))
      .executeTakeFirst();
  }

  static async create(name, slug, creatorId) {
    return db
      .insertInto('tags')
      .values({
        name,
        slug,
        created_by: creatorId,
        approved: false,
        usage_count: 0,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async approve(tagId, approverId) {
    return db
      .updateTable('tags')
      .set({
        approved: true,
        approved_by: approverId,
      })
      .where('id', '=', tagId)
      .returningAll()
      .executeTakeFirst();
  }

  static async incrementUsage(tagId, increment = 1) {
    return db
      .updateTable('tags')
      .set((eb) => ({
        usage_count: eb.ref('usage_count').plus(increment),
      }))
      .where('id', '=', tagId)
      .execute();
  }
}

module.exports = Tag;