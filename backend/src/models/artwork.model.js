// src/models/artwork.model.js
const { db } = require('../config');
const { sql } = require('kysely'); // ← This is the correct import

/** @typedef {import('../db/types').ArtworkRow} ArtworkRow */

class Artwork {
  static table = 'artworks';

  static async findById(id, includeDeleted = false) {
    let query = db
      .selectFrom('artworks')
      .selectAll()
      .where('id', '=', id);

    if (!includeDeleted) {
      query = query.where('deleted_at', 'is', null);
    }

    return query.executeTakeFirst();
  }


 static async incrementView(id) {
    return db
      .updateTable('artworks')
      .set({
        views_count: sql`views_count + 1`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .where('status', '=', 'published')
      .where('deleted_at', 'is', null)
      .execute();
  }

  // Also fix other methods using sql`
  static async create(creatorId, data) {
    return db
      .insertInto('artworks')
      .values({
        creator_id: creatorId,
        ...data,
        views_count: 0,
        favorites_count: 0,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async publish(id) {
    return db
      .updateTable('artworks')
      .set({
        status: 'published',
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .execute();
  }

  static async softDelete(id) {
    return db
      .updateTable('artworks')
      .set({
        deleted_at: sql`NOW()`,
        status: 'archived',
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .execute();
  }

  // Example: with pricing tiers
  static async findWithPricing(id) {
    return db
      .selectFrom('artworks')
      .selectAll('artworks')
      .leftJoin('artwork_pricing_tiers', 'artwork_pricing_tiers.artwork_id', 'artworks.id')
      .select([
        'artwork_pricing_tiers.id as pricing_id',
        'artwork_pricing_tiers.license_type',
        'artwork_pricing_tiers.price_inr_cents',
        'artwork_pricing_tiers.price_usd_cents',
        'artwork_pricing_tiers.is_active as pricing_active',
      ])
      .where('artworks.id', '=', id)
      .where('artworks.deleted_at', 'is', null)
      .execute();
  }
}

module.exports = Artwork;