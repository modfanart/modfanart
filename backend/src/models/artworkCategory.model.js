// src/models/artworkCategory.model.js
const { db } = require('../config'); // ← only db
const { sql } = require('kysely'); // ← ADD THIS LINE

class ArtworkCategory {
  static async assign(artworkId, categoryId) {
    return db
      .insertInto('artwork_categories')
      .values({
        artwork_id: artworkId,
        category_id: categoryId,
      })
      .onConflict(['artwork_id', 'category_id'])
      .doNothing()
      .execute();
  }

  static async remove(artworkId, categoryId) {
    return db
      .deleteFrom('artwork_categories')
      .where('artwork_id', '=', artworkId)
      .where('category_id', '=', categoryId)
      .execute();
  }

  static async getCategoryIdsForArtwork(artworkId) {
    return db
      .selectFrom('artwork_categories')
      .select('category_id')
      .where('artwork_id', '=', artworkId)
      .execute()
      .then((rows) => rows.map((r) => r.category_id));
  }
}

module.exports = ArtworkCategory;
