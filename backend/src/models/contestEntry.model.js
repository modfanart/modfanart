// src/models/contestEntry.model.js
const { db } = require('../config'); // ← only db
const { sql } = require('kysely'); // ← ADD THIS LINE

class ContestEntry {
  static async create(contestId, artworkId, creatorId, notes = null) {
    return db
      .insertInto('contest_entries')
      .values({
        contest_id: contestId,
        artwork_id: artworkId,
        creator_id: creatorId,
        submission_notes: notes,
        status: 'pending',
        score_public: 0,
        score_judge: 0,
        moderation_status: 'pending',
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async approve(id, moderatorId) {
    return db
      .updateTable('contest_entries')
      .set({
        status: 'approved',
        moderation_status: 'approved',
        moderated_by: moderatorId,
        moderated_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .execute();
  }

  static async setWinner(id, rank) {
    return db
      .updateTable('contest_entries')
      .set({
        status: 'winner',
        rank,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .execute();
  }
}

module.exports = ContestEntry;
