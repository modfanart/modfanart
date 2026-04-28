// src/models/artwork.model.js
const { db } = require('../config');
const { sql } = require('kysely');

/** @typedef {import('../db/types').ArtworkRow} ArtworkRow */

class Artwork {
  static table = 'artworks';

  static async findById(id, options = {}) {
    const { includeDeleted = false, withPricing = false } = options;

    let query = db.selectFrom('artworks').selectAll().where('id', '=', id);

    if (!includeDeleted) {
      query = query.where('deleted_at', 'is', null);
    }

    const artwork = await query.executeTakeFirst();

    if (!artwork) return null;

    // Optional: load pricing tiers if requested
    if (withPricing) {
      artwork.pricing_tiers = await db
        .selectFrom('artwork_pricing_tiers')
        .select([
          'id',
          'license_type',
          'price_inr_cents',
          'price_usd_cents',
          'is_active',
        ])
        .where('artwork_id', '=', id)
        .execute();
    }

    return artwork;
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

  static async create(creatorId, data) {
    const now = sql`NOW()`;

    return db
      .insertInto('artworks')
      .values({
        creator_id: creatorId,
        title: data.title,
        description: data.description ?? null,
        file_url: data.file_url,
        thumbnail_url: data.thumbnail_url ?? null,
        source_file_url: data.source_file_url ?? null,
        status: data.status ?? 'draft',
        moderation_status: data.moderation_status ?? 'pending',
        views_count: 0,
        favorites_count: 0,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  static async publish(id) {
    return db
      .updateTable('artworks')
      .set({
        status: 'published',
        moderation_status: 'approved',
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .execute();
  }

  static async softDelete(id) {
    const now = sql`NOW()`;
    return db
      .updateTable('artworks')
      .set({
        deleted_at: now,
        status: 'archived',
        updated_at: now,
      })
      .where('id', '=', id)
      .execute();
  }

  // Optional helper: get with pricing (already good, just renamed for clarity)
  static async findWithPricing(id) {
    return db
      .selectFrom('artworks')
      .leftJoin(
        'artwork_pricing_tiers',
        'artwork_pricing_tiers.artwork_id',
        'artworks.id'
      )
      .select([
        'artworks.*',
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

  // Bonus: simple status update helper
  static async updateStatus(id, newStatus) {
    return db
      .updateTable('artworks')
      .set({
        status: newStatus,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .execute();
  }
}

module.exports = Artwork;
