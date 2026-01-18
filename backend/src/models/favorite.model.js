// src/models/favorite.model.js
const { db } = require('../config');           // ← only db
const { sql } = require('kysely');             // ← ADD THIS LINE

class Favorite {
  static async toggle(userId, favoritableType, favoritableId) {
    const exists = await db
      .selectFrom('favorites')
      .select('user_id')
      .where('user_id', '=', userId)
      .where('favoritable_type', '=', favoritableType)
      .where('favoritable_id', '=', favoritableId)
      .executeTakeFirst();

    if (exists) {
      // remove
      return db
        .deleteFrom('favorites')
        .where('user_id', '=', userId)
        .where('favoritable_type', '=', favoritableType)
        .where('favoritable_id', '=', favoritableId)
        .execute();
    } else {
      // add
      return db
        .insertInto('favorites')
        .values({
          user_id: userId,
          favoritable_type: favoritableType,
          favoritable_id: favoritableId,
          created_at: sql`NOW()`,
        })
        .execute();
    }
  }

  static async isFavorited(userId, favoritableType, favoritableId) {
    return db
      .selectFrom('favorites')
      .select('user_id')
      .where('user_id', '=', userId)
      .where('favoritable_type', '=', favoritableType)
      .where('favoritable_id', '=', favoritableId)
      .executeTakeFirst()
      .then(Boolean);
  }

  static async getFavoritesForUser(userId, type = null, limit = 20, offset = 0) {
    let q = db
      .selectFrom('favorites')
      .selectAll()
      .where('user_id', '=', userId);

    if (type) {
      q = q.where('favoritable_type', '=', type);
    }

    return q
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();
  }
}

module.exports = Favorite;