// src/models/contestJudge.model.js
const { db } = require('../config'); // ← only db
const { sql } = require('kysely'); // ← ADD THIS LINE

class ContestJudge {
  static async assign(contestId, judgeId, invitedBy) {
    return db
      .insertInto('contest_judges')
      .values({
        contest_id: contestId,
        judge_id: judgeId,
        invited_by: invitedBy,
        accepted: false,
      })
      .onConflict(['contest_id', 'judge_id'])
      .doNothing()
      .returningAll()
      .executeTakeFirst();
  }

  static async acceptInvitation(contestId, judgeId) {
    return db
      .updateTable('contest_judges')
      .set({ accepted: true })
      .where('contest_id', '=', contestId)
      .where('judge_id', '=', judgeId)
      .returningAll()
      .executeTakeFirst();
  }

  static async getJudgesForContest(contestId) {
    return db
      .selectFrom('contest_judges')
      .innerJoin('users', 'users.id', 'contest_judges.judge_id')
      .select([
        'contest_judges.contest_id',
        'contest_judges.judge_id',
        'contest_judges.accepted',
        'contest_judges.invited_by',
        'users.username',
        'users.email',
        'users.avatar_url',
      ])
      .where('contest_judges.contest_id', '=', contestId)
      .execute();
  }

  static async removeJudge(contestId, judgeId) {
    return db
      .deleteFrom('contest_judges')
      .where('contest_id', '=', contestId)
      .where('judge_id', '=', judgeId)
      .execute();
  }
}

module.exports = ContestJudge;
