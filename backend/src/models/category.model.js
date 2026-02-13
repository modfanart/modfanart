const { db } = require('../config');
const { sql } = require('kysely');

/** @typedef {import('../db/types').CategoryRow} CategoryRow */

class Category {
  static table = 'categories';

  /**
   * Find category by ID (only active ones)
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
   * Find category by slug (only active ones)
   * @param {string} slug
   * @returns {Promise<CategoryRow | undefined>}
   */
  static async findBySlug(slug) {
    if (!slug || typeof slug !== 'string') {
      return undefined;
    }

    return db
      .selectFrom('categories')
      .selectAll()
      .where('slug', '=', slug.trim().toLowerCase()) // normalize
      .where('is_active', '=', true)
      .executeTakeFirst();
  }

  /**
   * Create a new category
   * @param {Partial<CategoryRow>} data
   * @returns {Promise<CategoryRow | undefined>}
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
   * Update existing category
   * @param {string} id
   * @param {Partial<CategoryRow>} data
   * @returns {Promise<CategoryRow | undefined>}
   */
  static async update(id, data) {
    if (!id) return undefined;

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

  /**
   * Get all active categories (flat list) — useful for building trees in controller
   * @returns {Promise<CategoryRow[]>}
   */
  static async getActiveTree() {
    return db
      .selectFrom('categories')
      .selectAll()
      .where('is_active', '=', true)
      .orderBy('sort_order', 'asc')
      .orderBy('name', 'asc')
      .execute();
  }

  /**
   * Optional: Check if slug already exists (useful before create/update)
   * @param {string} slug
   * @param {string} [excludeId] — ignore this ID when checking (for updates)
   * @returns {Promise<boolean>}
   */
  static async slugExists(slug, excludeId = null) {
    let query = db
      .selectFrom('categories')
      .select('id')
      .where('slug', '=', slug.trim().toLowerCase());

    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }

    const result = await query.executeTakeFirst();
    return !!result;
  }
}

module.exports = Category;