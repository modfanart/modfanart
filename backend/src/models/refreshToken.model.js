// src/models/refreshToken.model.js
const { db } = require('../config');
const { sql } = require('kysely');

class RefreshToken {
  static async create(userId, tokenHash, expiresAt) {
    return db
      .insertInto('refresh_tokens')
      .values({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async findActiveByUserId(userId) {
    return db
      .selectFrom('refresh_tokens')
      .selectAll()
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .where('expires_at', '>', sql`NOW()`)
      .orderBy('created_at', 'desc')
      .execute();
  }

  static async revoke(tokenId) {
    return db
      .updateTable('refresh_tokens')
      .set({ revoked_at: sql`NOW()` })
      .where('id', '=', tokenId)
      .execute();
  }

  static async revokeAllForUser(userId) {
    return db
      .updateTable('refresh_tokens')
      .set({ revoked_at: sql`NOW()` })
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute();
  }
}

module.exports = RefreshToken;