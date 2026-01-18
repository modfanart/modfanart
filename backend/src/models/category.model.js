// src/models/category.model.js
const { db } = require('../config');           // ← only db
const { sql } = require('kysely');             // ← ADD THIS LINE

/** @typedef {import('../db/types').CategoryRow} CategoryRow */

class Category {
  static table = 'categories';

  /**
   * @param {string} id
   * @returns {Promise<CategoryRow | undefined>}
   */
  static async findById(id) {
    return db
      .selectFrom('categories')
      .selectAll()
      .where('id', '=', id)
      .where('is_active', '=', true)
      .executeTakeFirst();
  }

  /**
   * @param {string} slug
   * @returns {Promise<CategoryRow | undefined>}
   */
  static async findBySlug(slug) {
    return db
      .selectFrom('categories')
      .selectAll()
      .where('slug', '=', slug)
      .where('is_active', '=', true)
      .executeTakeFirst();
  }

  /**
   * @param {Partial<CategoryRow>} data
   */
  static async create(data) {
    return db
      .insertInto('categories')
      .values({
        ...data,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * @param {string} id
   * @param {Partial<CategoryRow>} data
   */
  static async update(id, data) {
    return db
      .updateTable('categories')
      .set({
        ...data,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static async getActiveTree() {
    return db
      .selectFrom('categories')
      .selectAll()
      .where('is_active', '=', true)
      .orderBy('sort_order', 'asc')
      .orderBy('name', 'asc')
      .execute();
  }
}

module.exports = Category;