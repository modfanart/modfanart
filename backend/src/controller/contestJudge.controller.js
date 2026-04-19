// src/controllers/contestJudge.controller.js
const Contest = require('../models/contest.model');
const ContestJudge = require('../models/contestJudge.model');
const User = require('../models/user.model');
const { db } = require('../config');
const { sql } = require('kysely');

class ContestJudgeController {

  /**
   * POST /contest/:contestId/judges
   * Assign / Invite a user as judge
   */
/**
 * POST /contest/:contestId/judges
 * Assign / Invite a user as judge
 */
/**
 * POST /contest/:contestId/judges
 * Assign / Invite a user as judge
 */
static async assignJudge(req, res) {
  try {
    const { contestId } = req.params;
    const { judgeId } = req.body;

    if (!judgeId) {
      return res.status(400).json({ error: 'judgeId is required' });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    // === Improved Authorization Logic ===
    const user = req.user;
    const isPlatformAdmin = user?.role === 'Admin';
    const isBrandOwner = contest.brand_id === user?.id;

    // Brand Manager check - more forgiving
    const isBrandManager = user?.role === 'brand_manager' && 
      (user?.brands || []).some(b => 
        b.id === contest.brand_id || 
        String(b.id) === String(contest.brand_id)
      );

    const hasManagePermission = user?.permissions?.['contests.manage'] === true;

    const hasPermission = isPlatformAdmin || isBrandOwner || isBrandManager || hasManagePermission;

    if (!hasPermission) {
      console.log('Authorization failed for user:', {
        userId: user?.id,
        userRole: user?.role,
        contestBrandId: contest.brand_id,
        userBrands: user?.brands?.map(b => b.id)
      });

      return res.status(403).json({ 
        error: 'Not authorized',
        message: 'Only the brand owner, brand manager for this brand, or admin can assign judges'
      });
    }

    // === Rest of the logic ===
    const judge = await User.findById(judgeId);
    if (!judge) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!judge.permissions?.['contests.judge'] && judge.role !== 'Admin') {
      return res.status(400).json({ 
        error: 'User does not have judge permissions' 
      });
    }

    if (['judging', 'completed', 'archived'].includes(contest.status)) {
      return res.status(400).json({
        error: 'Cannot assign judges after contest has entered judging or completed phase'
      });
    }

    // Check if already assigned
    const existing = await db
      .selectFrom('contest_judges')
      .select('judge_id')
      .where('contest_id', '=', contestId)
      .where('judge_id', '=', judgeId)
      .executeTakeFirst();

    if (existing) {
      return res.status(409).json({ 
        error: 'User is already assigned as a judge for this contest' 
      });
    }

    const assignment = await db
      .insertInto('contest_judges')
      .values({
        contest_id: contestId,
        judge_id: judgeId,
        invited_by: user.id,
        accepted: false,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();

    res.status(201).json({
      success: true,
      message: 'Judge invited successfully',
      data: {
        user_id: judgeId,
        judge_id: judgeId,
        username: judge.username,
        name: judge.profile?.full_name || judge.profile?.name || null,
        avatar_url: judge.avatar_url,
        accepted: false,
        assigned_at: assignment.created_at,
      }
    });

  } catch (err) {
    console.error('ASSIGN JUDGE ERROR:', err);
    res.status(500).json({ 
      error: 'Failed to assign judge',
      ...(process.env.NODE_ENV !== 'production' && { 
        detail: err.message,
        code: err.code 
      })
    });
  }
}
  /**
   * GET /contest/:contestId/judges
   * FIXED: Safe access to profile JSONB
   */
/**
 * GET /contest/:contestId/judges
 */
static async getJudges(req, res) {
  try {
    const { contestId } = req.params;

    const judges = await db
      .selectFrom('contest_judges as cj')
      .innerJoin('users as u', 'u.id', 'cj.judge_id')
      .select([
        'cj.judge_id as user_id',
        'u.username',
        sql`COALESCE(
          u.profile->>'full_name',
          u.profile->>'name',
          u.username
        ) as name`,
        'u.avatar_url',
        'cj.accepted',
        'cj.invited_by',
        'cj.created_at as assigned_at',
        'cj.updated_at',           // ← optional
      ])
      .where('cj.contest_id', '=', contestId)
      .orderBy('cj.created_at', 'desc')   // Now safe after adding column
      .execute();

    res.json({ 
      success: true,
      judges 
    });
  } catch (err) {
    console.error('GET JUDGES ERROR:', err);
    res.status(500).json({ 
      error: 'Failed to fetch judges for contest',
      ...(process.env.NODE_ENV !== 'production' && { 
        detail: err.message 
      })
    });
  }
}

  /**
   * PATCH /contest/:contestId/judges/:judgeId/accept
   */
  static async acceptInvitation(req, res) {
    try {
      const { contestId, judgeId } = req.params;

      if (judgeId !== req.user?.id) {
        return res.status(403).json({ error: 'This invitation is not for you' });
      }

      const assignment = await db
        .updateTable('contest_judges')
        .set({ accepted: true })
        .where('contest_id', '=', contestId)
        .where('judge_id', '=', judgeId)
        .where('accepted', '=', false)
        .returningAll()
        .executeTakeFirst();

      if (!assignment) {
        return res.status(404).json({ 
          error: 'Invitation not found or already accepted' 
        });
      }

      res.json({ 
        success: true,
        message: 'Judge invitation accepted successfully' 
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to accept judge invitation' });
    }
  }

  /**
   * DELETE /contest/:contestId/judges/:judgeId
   */
  static async removeJudge(req, res) {
    try {
      const { contestId, judgeId } = req.params;

      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ error: 'Contest not found' });
      }

      const isAdmin = req.user?.role === 'Admin' || 
                     req.user?.permissions?.['contests.manage'] === true;

      if (!isAdmin && contest.brand_id !== req.user?.id) {
        return res.status(403).json({ error: 'Not authorized to remove judges' });
      }

      if (contest.status === 'judging') {
        return res.status(400).json({
          error: 'Cannot remove judges while contest is in judging phase'
        });
      }

      const deleted = await db
        .deleteFrom('contest_judges')
        .where('contest_id', '=', contestId)
        .where('judge_id', '=', judgeId)
        .returning(['judge_id'])
        .executeTakeFirst();

      if (!deleted) {
        return res.status(404).json({ error: 'Judge assignment not found' });
      }

      res.json({ 
        success: true,
        message: 'Judge removed successfully',
        judgeId 
      });

    } catch (err) {
      console.error('REMOVE JUDGE ERROR:', err);
      res.status(500).json({ error: 'Failed to remove judge' });
    }
  }

  /**
   * GET /contest/judge/contests
   */
  static async getAllContestsByJudgeId(req, res) {
    try {
      const judgeId = req.user.id;

      const contests = await db
        .selectFrom('contest_judges as cj')
        .innerJoin('contests as c', 'c.id', 'cj.contest_id')
        .select([
          'c.id',
          'c.title',
          'c.slug',
          'c.description',
          'c.status',
          'c.start_date',
          'c.submission_end_date',
          'c.judging_end_date',
          'c.created_at',
          'c.brand_id',
        ])
        .where('cj.judge_id', '=', judgeId)
        .where('cj.accepted', '=', true)
        .where('c.deleted_at', 'is', null)
        .orderBy('c.created_at', 'desc')
        .execute();

      res.json({
        success: true,
        contests,
      });

    } catch (err) {
      console.error('GET JUDGE CONTESTS ERROR:', err);
      res.status(500).json({ error: 'Failed to fetch assigned contests' });
    }
  }
}

module.exports = ContestJudgeController;