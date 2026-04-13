const { db } = require('../config');
const { sql } = require('kysely'); // ✅ REQUIRED

class UserStatsService {
  static async getUserStats(userId) {
    const result = await db
      .selectFrom('artworks')
      .select((eb) => [
        eb.fn.count('id').as('artworks_count'),

        // ✅ FIXED
        eb.fn.coalesce(
          eb.fn.sum('favorites_count'),
          sql`0`
        ).as('likes_received'),

        // ✅ FIXED
        eb.fn.coalesce(
          eb.fn.sum('views_count'),
          sql`0`
        ).as('views_received'),
      ])
      .where('creator_id', '=', userId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return {
      artworks_count: Number(result?.artworks_count || 0),
      followers_count: 0,
      following_count: 0,
      likes_received: Number(result?.likes_received || 0),
      views_received: Number(result?.views_received || 0),
    };
  }
}

module.exports = UserStatsService;