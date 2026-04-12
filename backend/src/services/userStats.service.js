// src/services/userStats.service.js
const { db } = require('../config');

class UserStatsService {
  static async getUserStats(userId) {
    const [
      artworks,
      followers,
      following,
      likesReceived,
      viewsReceived,
    ] = await Promise.all([
      db
        .selectFrom('artworks')
        .select(db.fn.count('id').as('count'))
        .where('creator_id', '=', userId)
        .where('deleted_at', 'is', null)
        .executeTakeFirst(),

      db
        .selectFrom('follows')
        .select(db.fn.count('id').as('count'))
        .where('following_id', '=', userId)
        .executeTakeFirst(),

      db
        .selectFrom('follows')
        .select(db.fn.count('id').as('count'))
        .where('follower_id', '=', userId)
        .executeTakeFirst(),

      db
        .selectFrom('artwork_likes as al')
        .innerJoin('artworks as a', 'a.id', 'al.artwork_id')
        .select(db.fn.count('al.id').as('count'))
        .where('a.creator_id', '=', userId)
        .executeTakeFirst(),

      db
        .selectFrom('artworks')
        .select(db.fn.sum('views_count').as('count'))
        .where('creator_id', '=', userId)
        .executeTakeFirst(),
    ]);

    return {
      artworks_count: Number(artworks?.count || 0),
      followers_count: Number(followers?.count || 0),
      following_count: Number(following?.count || 0),
      likes_received: Number(likesReceived?.count || 0),
      views_received: Number(viewsReceived?.count || 0),
    };
  }
}

module.exports = UserStatsService;