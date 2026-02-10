// src/models/brandManager.model.js
const { db, sql } = require('../config');

class BrandManager {
  static async create({ brand_id, user_id, role = 'manager' }) {
    const [record] = await db
      .insertInto('brand_managers')
      .values({
        brand_id,
        user_id,
        role,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .execute();

    return record;
  }

  static async findByUser(userId) {
    return db
      .selectFrom('brand_managers')
      .innerJoin('brands', 'brands.id', 'brand_managers.brand_id')
      .select([
        'brands.id as brand_id',
        'brands.name',
        'brands.slug',
        'brand_managers.role',
      ])
      .where('brand_managers.user_id', '=', userId)
      .where('brands.deleted_at', 'is', null)
      .execute();
  }

  static async hasAccess(brandId, userId, roles = ['owner', 'manager']) {
    return db
      .selectFrom('brand_managers')
      .select('id')
      .where('brand_id', '=', brandId)
      .where('user_id', '=', userId)
      .where('role', 'in', roles)
      .executeTakeFirst();
  }

  static async removeManager(brandId, userId) {
    return db
      .deleteFrom('brand_managers')
      .where('brand_id', '=', brandId)
      .where('user_id', '=', userId)
      .execute();
  }
}

module.exports = BrandManager;
