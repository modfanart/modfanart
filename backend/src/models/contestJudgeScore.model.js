// src/models/contestJudgeScore.model.js
const { db } = require('../config');           // ← only db
const { sql } = require('kysely');             // ← ADD THIS LINE

class ContestJudgeScore {
  static async submit(entryId, judgeId, score, comments = null) {
    return db
      .insertInto('contest_judge_scores')
      .values({
        entry_id: entryId,
        judge_id: judgeId,
        score,
        comments,
        created_at: sql`NOW()`,
      })
      .onConflict(['entry_id', 'judge_id'])
      .doUpdateSet({
        score,
        comments,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async getScoresForEntry(entryId) {
    return db
      .selectFrom('contest_judge_scores')
      .selectAll()
      .where('entry_id', '=', entryId)
      .execute();
  }

  static async getAverageJudgeScore(entryId) {
    return db
      .selectFrom('contest_judge_scores')
      .select((eb) => eb.fn.avg('score').as('avg_score'))
      .where('entry_id', '=', entryId)
      .executeTakeFirst()
      .then(r => r?.avg_score ? Number(r.avg_score) : 0);
  }

  static async hasJudgeScored(entryId, judgeId) {
    return db
      .selectFrom('contest_judge_scores')
      .select('entry_id')
      .where('entry_id', '=', entryId)
      .where('judge_id', '=', judgeId)
      .executeTakeFirst()
      .then(Boolean);
  }
}

module.exports = ContestJudgeScore;