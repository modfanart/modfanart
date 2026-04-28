// src/models/user.model.js
const { db } = require('../config');
const { sql } = require('kysely');

/** @typedef {import('../db/types').UserRow} UserRow */

class User {
  static table = 'users';

  /**
   * @param {string} id
   * @returns {Promise<UserRow | undefined>}
   */
  static async findById(id) {
    return db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
  }

  /**
   * @param {string} email
   * @returns {Promise<UserRow | undefined>}
   */
  static async findByEmail(email) {
    return db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
  }

  /**
   * @param {string} username
   * @returns {Promise<UserRow | undefined>}
   */
  static async findByUsername(username) {
    return db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
  }

  /**
   * @param {Partial<UserRow> & { password_hash?: string }} data
   */
  static async create(data) {
    return db
      .insertInto('users')
      .values({
        ...data,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Soft delete
   * @param {string} id
   */
  static async softDelete(id) {
    return db
      .updateTable('users')
      .set({
        deleted_at: sql`NOW()`,
        updated_at: sql`NOW()`,
        status: 'deactivated',
      })
      .where('id', '=', id)
      .execute();
  }

  /**
   * Update last login
   * @param {string} id
   */
  static async updateLastLogin(id) {
    return db
      .updateTable('users')
      .set({ last_login_at: sql`NOW()` })
      .where('id', '=', id)
      .execute();
  }

  // Add more methods as needed: updateProfile, verifyEmail, changePassword, etc.
}

module.exports = User;
