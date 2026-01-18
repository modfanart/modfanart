// src/models/authToken.model.js
const { db } = require('../config');           // ← only db
const { sql } = require('kysely');             // ← ADD THIS LINE

class AuthToken {
  static async create(userId, type, tokenHash, expiresAt) {
    return db
      .insertInto('auth_tokens')
      .values({
        user_id: userId,
        type,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async findValid(tokenHash, type) {
    return db
      .selectFrom('auth_tokens')
      .selectAll()
      .where('token_hash', '=', tokenHash)
      .where('type', '=', type)
      .where('used_at', 'is', null)
      .where('expires_at', '>', sql`NOW()`)
      .executeTakeFirst();
  }

  static async markAsUsed(id) {
    return db
      .updateTable('auth_tokens')
      .set({ used_at: sql`NOW()` })
      .where('id', '=', id)
      .execute();
  }
}

module.exports = AuthToken;