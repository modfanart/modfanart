// src/models/contestEntry.model.js
const { db } = require('../../../config');
const { sql } = require('kysely');

class ContestEntry {
  static async create(contestId, artworkId, creatorId) {
    return db
      .insertInto('contest_entries')
      .values({
        contest_id: contestId,
        artwork_id: artworkId,
        creator_id: creatorId,
        status: 'pending',
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async approve(id) {
    return db
      .updateTable('contest_entries')
      .set({
        status: 'approved',
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .execute();
  }

  static async reject(id) {
    return db
      .updateTable('contest_entries')
      .set({
        status: 'rejected',
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .execute();
  }

  static async setWinner(id) {
    return db
      .updateTable('contest_entries')
      .set({
        status: 'winner',
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .execute();
  }

  static async getByContest(contestId) {
    return db
      .selectFrom('contest_entries')
      .selectAll()
      .where('contest_id', '=', contestId)
      .execute();
  }
}

module.exports = ContestEntry;