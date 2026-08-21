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

  /**
   * Create a contest-level self-assign link: not tied to a specific judge
   * yet. The first authenticated user to redeem it claims it — becomes
   * the assigned judge — and can reuse the same link afterward to get
   * straight back into their dashboard.
   */
  static async createSelfAssign(contestId, invitedBy) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    return db.transaction().execute(async (trx) => {
      // Only one outstanding, unclaimed self-assign link per contest —
      // regenerating replaces the old one rather than stacking up copies
      // that all still work.
      await trx
        .updateTable('judge_invite_tokens')
        .set({ used_at: sql`NOW()` })
        .where('contest_id', '=', contestId)
        .where('type', '=', 'self_assign')
        .where('judge_id', 'is', null)
        .where('used_at', 'is', null)
        .execute();

      return trx
        .insertInto('judge_invite_tokens')
        .values({
          token,
          contest_id: contestId,
          judge_id: null,
          type: 'self_assign',
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
   * Create a contest-level "open" link: reusable by multiple different
   * people, each of whom becomes an assigned judge on their own first
   * redemption. Unlike self-assign, judge_id is never set on this row —
   * there's no single owner to lock it to.
   */
  static async createOpen(contestId, invitedBy) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    return db.transaction().execute(async (trx) => {
      // Only one active open link per contest — regenerating retires the
      // old one instead of leaving multiple valid copies floating around.
      await trx
        .updateTable('judge_invite_tokens')
        .set({ used_at: sql`NOW()` })
        .where('contest_id', '=', contestId)
        .where('type', '=', 'open')
        .where('used_at', 'is', null)
        .execute();

      return trx
        .insertInto('judge_invite_tokens')
        .values({
          token,
          contest_id: contestId,
          judge_id: null,
          type: 'open',
          invited_by: invitedBy,
          expires_at: expiresAt,
          created_at: sql`NOW()`,
        })
        .returningAll()
        .executeTakeFirst();
    });
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

  /**
   * Validate an "open" link for redemption. No claiming happens here —
   * the row is never mutated — so the same still-active, unexpired link
   * keeps validating for every distinct redeemer. The controller is
   * responsible for actually assigning the current user as a judge.
   */
  static async redeemOpen(token) {
    const row = await db
      .selectFrom('judge_invite_tokens')
      .selectAll()
      .where('token', '=', token)
      .where('type', '=', 'open')
      .where('used_at', 'is', null)
      .where('expires_at', '>', sql`NOW()`)
      .executeTakeFirst();

    return row ?? null;
  }

  /**
   * Redeem a self-assign link. Two valid outcomes:
   *  - Unclaimed token, still within expiry: this user claims it (atomic
   *    UPDATE ... WHERE judge_id IS NULL means concurrent redeemers can't
   *    both win the claim).
   *  - Already claimed by this same user: a repeat visit, treated as
   *    success so the link keeps working for them going forward.
   * Claimed by a *different* user, expired, or nonexistent all return null
   * — the controller distinguishes those cases for the error response.
   */
  static async redeemSelfAssign(token, redeemingUserId) {
    return db.transaction().execute(async (trx) => {
      const claimed = await trx
        .updateTable('judge_invite_tokens')
        .set({ judge_id: redeemingUserId, used_at: sql`NOW()` })
        .where('token', '=', token)
        .where('type', '=', 'self_assign')
        .where('judge_id', 'is', null)
        .where('expires_at', '>', sql`NOW()`)
        .returningAll()
        .executeTakeFirst();

      if (claimed) {
        return { row: claimed, isNewClaim: true };
      }

      const existing = await trx
        .selectFrom('judge_invite_tokens')
        .selectAll()
        .where('token', '=', token)
        .where('type', '=', 'self_assign')
        .executeTakeFirst();

      if (
        existing &&
        existing.judge_id === redeemingUserId &&
        new Date(existing.expires_at) > new Date()
      ) {
        return { row: existing, isNewClaim: false };
      }

      return null;
    });
  }
}

module.exports = JudgeInviteToken;