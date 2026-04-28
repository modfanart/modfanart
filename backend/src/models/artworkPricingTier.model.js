// src/models/artworkPricingTier.model.js
const { db } = require('../config'); // ← only db
const { sql } = require('kysely'); // ← ADD THIS LINE

class ArtworkPricingTier {
  static async create(artworkId, data) {
    return db
      .insertInto('artwork_pricing_tiers')
      .values({
        artwork_id: artworkId,
        ...data,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async findActiveForArtwork(artworkId) {
    return db
      .selectFrom('artwork_pricing_tiers')
      .selectAll()
      .where('artwork_id', '=', artworkId)
      .where('is_active', '=', true)
      .execute();
  }
}

module.exports = ArtworkPricingTier;
