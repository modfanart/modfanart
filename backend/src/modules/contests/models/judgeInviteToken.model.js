// src/models/judgeInviteToken.model.js
const crypto = require('crypto');
const { db } = require('../../../config');
const { sql } = require('kysely');

const INVITE_EXPIRY_DAYS = 7;

class JudgeInviteToken {
  /**
   * Create a fresh one-time invite token for a judge/contest pair.
   * Any previously-unused token for the same pair is invalidated first,
   * so an old copied-but-unused link can never be redeemed alongside a
   * freshly regenerated one.
   */
  static async create(contestId, judgeId, invitedBy) {
    const token = crypto.randomBytes(32).toString('hex'); // 64-char, unguessable
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    return db.transaction().execute(async (trx) => {
      await trx
        .updateTable('judge_invite_tokens')
        .set({ used_at: sql`NOW()` }) // soft-invalidate, don't delete — keeps an audit trail
        .where('contest_id', '=', contestId)
        .where('judge_id', '=', judgeId)
        .where('used_at', 'is', null)
        .execute();

      return trx
        .insertInto('judge_invite_tokens')
        .values({
          token,
          contest_id: contestId,
          judge_id: judgeId,
          invited_by: invitedBy,
          expires_at: expiresAt,
          created_at: sql`NOW()`,
        })
        .returningAll()
        .executeTakeFirst();
    });
  }

  static async findByToken(token) {
    return db
      .selectFrom('judge_invite_tokens')
      .selectAll()
      .where('token', '=', token)
      .executeTakeFirst();
  }

  /**
   * Atomically redeem a token: only succeeds if it's still unused and
   * unexpired, and the redeeming user matches the invited judge. Returns
   * the row on success, or null if it can't be redeemed (already used,
   * expired, wrong token, or wrong user) — the controller is responsible
   * for turning a null into the right 4xx.
   */
  static async redeem(token, redeemingUserId) {
    const row = await db
      .updateTable('judge_invite_tokens')
      .set({ used_at: sql`NOW()` })
      .where('token', '=', token)
      .where('judge_id', '=', redeemingUserId)
      .where('used_at', 'is', null)
      .where('expires_at', '>', sql`NOW()`)
      .returningAll()
      .executeTakeFirst();

    return row ?? null;
  }
}

module.exports = JudgeInviteToken;