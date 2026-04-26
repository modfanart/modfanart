// src/models/contestCategory.model.js
const { db } = require('../config'); // ← only db
const { sql } = require('kysely'); // ← ADD THIS LINE

class ContestCategory {
  static async assign(contestId, categoryId) {
    return db
      .insertInto('contest_categories')
      .values({
        contest_id: contestId,
        category_id: categoryId,
      })
      .onConflict(['contest_id', 'category_id'])
      .doNothing()
      .execute();
  }

  static async getCategoryIdsForContest(contestId) {
    return db
      .selectFrom('contest_categories')
      .select('category_id')
      .where('contest_id', '=', contestId)
      .execute()
      .then((rows) => rows.map((r) => r.category_id));
  }
}

module.exports = ContestCategory;
