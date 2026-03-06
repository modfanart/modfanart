// src/controllers/contest.controller.js
const Contest = require('../models/contest.model');
const ContestCategory = require('../models/contestCategory.model');
const User = require('../models/user.model');
const { db } = require('../config');
const { sql } = require('kysely');
class ContestController {
  // GET /contests (public + filtered)
  static async getContests(req, res) {
    try {
      const { status, visibility = 'public', brandId, limit = 20, offset = 0 } = req.query;

      let query = db
        .selectFrom('contests')
        .selectAll()
        .where('deleted_at', 'is', null)   
        .where('visibility', '=', visibility)
        .orderBy('created_at', 'desc')
        .limit(Number(limit))
        .offset(Number(offset));

      if (status) query = query.where('status', '=', status);
      if (brandId) query = query.where('brand_id', '=', brandId);

      const contests = await query.execute();

      res.json({ contests });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch contests' });
    }
  }

  // GET /contests/:id
  static async getContest(req, res) {
    try {
      const { id } = req.params;
      const contest = await Contest.findById(id);

      if (!contest) {
        return res.status(404).json({ error: 'Contest not found' });
      }

      // Optional: enrich with categories
      const categoryIds = await ContestCategory.getCategoryIdsForContest(id);
      const categories = categoryIds.length > 0
        ? await db.selectFrom('categories').select(['id', 'name', 'slug']).where('id', 'in', categoryIds).execute()
        : [];

      res.json({ ...contest, categories });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch contest' });
    }
  }

 static async createContest(req, res) {
  try {

    // ---------------- AUTH ----------------
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const {
      brand_id,
      title,
      slug: providedSlug,
      description,
      rules,
      prizes,
      start_date,
      submission_end_date,
      visibility = 'public',
      status = 'draft',
      max_entries_per_user = 1,
      entry_requirements,
      judging_criteria,
      categoryIds = []
    } = req.body


    // ---------------- REQUIRED FIELDS ----------------
    if (!brand_id || !title?.trim() || !description?.trim() || !start_date || !submission_end_date) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['brand_id','title','description','start_date','submission_end_date']
      })
    }


    // ---------------- DATE VALIDATION ----------------
    const startDate = new Date(start_date)
    const endDate = new Date(submission_end_date)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' })
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        error: 'submission_end_date must be after start_date'
      })
    }


    // ---------------- BRAND CHECK ----------------
    const brand = await db
      .selectFrom('brands')
      .select(['id'])
      .where('id', '=', brand_id)
      .executeTakeFirst()

    if (!brand) {
      return res.status(404).json({
        error: 'Brand not found'
      })
    }


    // ---------------- SLUG GENERATION ----------------
    let slug = providedSlug?.trim()

    if (!slug) {
      slug = title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }


    // ---------------- SLUG UNIQUENESS ----------------
    let finalSlug = slug
    let counter = 1

    while (true) {

      const existing = await db
        .selectFrom('contests')
        .select('id')
        .where('slug', '=', finalSlug)
        .where('deleted_at', 'is', null)
        .executeTakeFirst()

      if (!existing) break

      finalSlug = `${slug}-${counter}`
      counter++
    }


    // ---------------- VALIDATION ----------------
    if (prizes && !Array.isArray(prizes)) {
      return res.status(400).json({ error: 'prizes must be an array' })
    }

    if (entry_requirements && typeof entry_requirements !== 'object') {
      return res.status(400).json({
        error: 'entry_requirements must be an object'
      })
    }

    if (categoryIds && !Array.isArray(categoryIds)) {
      return res.status(400).json({
        error: 'categoryIds must be an array'
      })
    }


    // ---------------- TRANSACTION ----------------
    const result = await db.transaction().execute(async (trx) => {

      const contest = await trx
        .insertInto('contests')
        .values({

          brand_id: brand.id,

          title: title.trim(),
          slug: finalSlug,
          description: description.trim(),
          rules: rules?.trim() || null,

          start_date: startDate,
          submission_end_date: endDate,

          visibility,
          status,
          max_entries_per_user: Number(max_entries_per_user) || 1,

          judging_criteria: judging_criteria?.trim() || null,

          prizes: prizes ? JSON.stringify(prizes) : null,

          entry_requirements: entry_requirements
            ? JSON.stringify(entry_requirements)
            : null,

          created_at: sql`NOW()`,
          updated_at: sql`NOW()`

        })
        .returningAll()
        .executeTakeFirstOrThrow()


      // ---------------- CATEGORY MAPPING ----------------
      if (categoryIds.length > 0) {

        const categories = await trx
          .selectFrom('categories')
          .select('id')
          .where('id', 'in', categoryIds)
          .execute()

        const validCategoryIds = categories.map(c => c.id)

        const rows = validCategoryIds.map(catId => ({
          contest_id: contest.id,
          category_id: catId
        }))

        if (rows.length > 0) {
          await trx
            .insertInto('contest_categories')
            .values(rows)
            .execute()
        }
      }

      return contest
    })


    // ---------------- RESPONSE ----------------
    return res.status(201).json({
      success: true,
      data: result
    })


  } catch (err) {

    console.error('CREATE CONTEST ERROR:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      body: req.body,
      userId: req.user?.id
    })

    return res.status(500).json({
      error: 'Failed to create contest',
      ...(process.env.NODE_ENV !== 'production' && { detail: err.message })
    })
  }
}
  // PATCH /contests/:id (update status, details, etc.)
  static async updateContest(req, res) {
    try {
      const { id } = req.params;
      const contest = await Contest.findById(id);

      if (!contest) return res.status(404).json({ error: 'Contest not found' });

      if (contest.brand_id !== req.user.id && !req.user.permissions?.['contests.manage']) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updateData = { ...req.body, updated_at: sql`NOW()` };
      delete updateData.id; // prevent overwriting

      const updated = await db
        .updateTable('contests')
        .set(updateData)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst();

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update contest' });
    }
  }

  // DELETE /contests/:id (soft delete or archive)
  static async deleteContest(req, res) {
    try {
      const { id } = req.params;
      const contest = await Contest.findById(id);

      if (!contest) return res.status(404).json({ error: 'Contest not found' });

      if (contest.brand_id !== req.user.id && !req.user.permissions?.['contests.manage']) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await db
        .updateTable('contests')
        .set({ deleted_at: sql`NOW()`, status: 'archived' })
        .where('id', '=', id)
        .execute();

      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete contest' });
    }
  }

    // PATCH /contests/:id/announce-winners (admin/brand)
  static async announceWinners(req, res) {
    try {
      const { id } = req.params;
      const contest = await Contest.findById(id);

      if (!contest) return res.status(404).json({ error: 'Contest not found' });
      if (contest.brand_id !== req.user.id && !req.user.permissions?.['contests.manage']) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      if (contest.status !== 'judging' && contest.status !== 'completed') {
        return res.status(400).json({ error: 'Contest must be in judging or completed state' });
      }

      // Assume winners are already set via judge scores or manual rank assignment
      // Here we just mark as announced
      await db
        .updateTable('contests')
        .set({
          status: 'completed',
          winner_announced: true,
          updated_at: sql`NOW()`,
        })
        .where('id', '=', id)
        .execute();

      // Optional: trigger notifications to winners/creators
      // await Notification.createMany(winnerIds, 'contest_won', ...)

      res.json({ message: 'Winners announced successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to announce winners' });
    }
  }

  // POST /contests/:id/distribute-prizes (admin/brand after announcement)
  static async distributePrizes(req, res) {
    try {
      const { id } = req.params;
      const contest = await Contest.findById(id);

      if (!contest) return res.status(404).json({ error: 'Contest not found' });
      if (!contest.winner_announced) {
        return res.status(400).json({ error: 'Winners must be announced first' });
      }
      if (contest.brand_id !== req.user.id && !req.user.permissions?.['contests.manage']) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Find winning entries
      const winners = await db
        .selectFrom('contest_entries')
        .select(['id', 'creator_id', 'rank'])
        .where('contest_id', '=', id)
        .where('status', '=', 'winner')
        .where('rank', 'is not', null)
        .orderBy('rank', 'asc')
        .execute();

      if (winners.length === 0) {
        return res.status(400).json({ error: 'No winners set for this contest' });
      }

      // Example prize distribution logic (adapt to your prizes jsonb structure)
      const prizes = contest.prizes || [];
      for (const winner of winners) {
        const prize = prizes.find(p => p.rank === winner.rank);
        if (!prize) continue;

        // Create order or payout record
        // Example: create contest_prize order
        await db
          .insertInto('orders')
          .values({
            order_number: `PRZ-${id}-${winner.rank}-${Date.now()}`,
            buyer_id: contest.brand_id,        // brand pays
            seller_id: winner.creator_id,      // creator receives
            source_type: 'contest_prize',
            source_id: winner.id,
            status: 'fulfilled',               // or 'pending' if manual
            currency: 'INR',
            subtotal_cents: prize.amount_inr ? prize.amount_inr * 100 : 0,
            platform_fee_cents: 0,             // adjust logic
            total_cents: prize.amount_inr ? prize.amount_inr * 100 : 0,
            created_at: sql`NOW()`,
            updated_at: sql`NOW()`,
          })
          .execute();

        // Optional: notify winner
        // await Notification.create(winner.creator_id, 'prize_won', ...)
      }

      res.json({ message: 'Prizes distributed successfully', winners_count: winners.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to distribute prizes' });
    }
  }
  /**
 * GET /brands/:brandId/contests/judges
 * Returns all contests of the brand with their assigned judges
 */
static async getAllContestJudgesByBrandId(req, res) {
  try {
    const { brandId } = req.params;
    const { status, visibility = 'public' } = req.query;

    // Authorization: either brand owner or admin
    if (req.user.id !== brandId && !req.user.permissions?.['contests.manage']) {
      const brand = await db
        .selectFrom('brands')
        .select('user_id')
        .where('id', '=', brandId)
        .executeTakeFirst();

      if (!brand || brand.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to view this brand\'s judges' });
      }
    }

    let query = db
      .selectFrom('contests')
      .leftJoin('contest_judges', 'contest_judges.contest_id', 'contests.id')
      .leftJoin('users', 'users.id', 'contest_judges.judge_id')
      .select([
        'contests.id as contest_id',
        'contests.title as contest_title',
        'contests.slug as contest_slug',
        'contests.status',
        'contests.visibility',
        'contests.start_date',
        'contests.submission_end_date',
        'contest_judges.judge_id',
        'users.username as judge_username',
        'users.profile->>\'full_name\' as judge_name',
        'contest_judges.accepted as judge_accepted',
        'contest_judges.created_at as assigned_at',
      ])
      .where('contests.brand_id', '=', brandId)
      .where('contests.deleted_at', 'is', null)
      .where('contests.visibility', '=', visibility)
      .orderBy('contests.created_at', 'desc');

    if (status) {
      query = query.where('contests.status', '=', status);
    }

    const rows = await query.execute();

    // Group by contest
    const contestsMap = new Map();

    for (const row of rows) {
      const contestId = row.contest_id;
      if (!contestsMap.has(contestId)) {
        contestsMap.set(contestId, {
          id: contestId,
          title: row.contest_title,
          slug: row.contest_slug,
          status: row.status,
          visibility: row.visibility,
          start_date: row.start_date,
          submission_end_date: row.submission_end_date,
          judges: [],
        });
      }

      if (row.judge_id) {
        contestsMap.get(contestId).judges.push({
          user_id: row.judge_id,
          username: row.judge_username,
          name: row.judge_name || null,
          accepted: row.judge_accepted,
          assigned_at: row.assigned_at,
        });
      }
    }

    const result = Array.from(contestsMap.values());

    res.json({ contests: result });
  } catch (err) {
    console.error('GET BRAND CONTEST JUDGES ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch contest judges' });
  }
}
/**
 * POST /contests/:id/judges
 * Body: { userId: string }
 */
static async assignUserAsJudgeByContestId(req, res) {
  try {
    const { id: contestId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const contest = await db
      .selectFrom('contests')
      .select(['id', 'brand_id', 'status'])
      .where('id', '=', contestId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    // Authorization
    const isBrandOwner = contest.brand_id === req.user.id;
    const isAdmin = req.user.permissions?.['contests.manage'] === true;

    if (!isBrandOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to assign judges' });
    }

    // Cannot add judges after judging has started (optional strict policy)
    if (['judging', 'completed', 'archived'].includes(contest.status)) {
      return res.status(400).json({
        error: 'Cannot assign judges after contest has entered judging or completed phase'
      });
    }

    // Check if user exists
    const userExists = await db
      .selectFrom('users')
      .select('id')
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a judge
    const alreadyJudge = await db
      .selectFrom('contest_judges')
      .select('judge_id')
      .where('contest_id', '=', contestId)
      .where('judge_id', '=', userId)
      .executeTakeFirst();

    if (alreadyJudge) {
      return res.status(409).json({ error: 'User is already assigned as judge' });
    }

    // Insert
    await db
      .insertInto('contest_judges')
      .values({
        contest_id: contestId,
        judge_id: userId,
        invited_by: req.user.id,
        accepted: false,           // usually starts as pending invitation
        created_at: sql`NOW()`,
      })
      .execute();

    // Optional: create notification
    // await Notification.create(userId, 'contest_judge_invited', { contest_id: contestId });

    res.status(201).json({ message: 'Judge assigned successfully' });
  } catch (err) {
    console.error('ASSIGN JUDGE ERROR:', err);
    res.status(500).json({ error: 'Failed to assign judge' });
  }
}
/**
 * DELETE /contests/:id/judges/:userId
 */
static async removeUserAsJudgeByContestId(req, res) {
  try {
    const { id: contestId, userId } = req.params;

    const contest = await db
      .selectFrom('contests')
      .select(['id', 'brand_id', 'status'])
      .where('id', '=', contestId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    // Authorization
    if (contest.brand_id !== req.user.id && !req.user.permissions?.['contests.manage']) {
      return res.status(403).json({ error: 'Not authorized to remove judges' });
    }

    // Optional: prevent removal during active judging
    if (contest.status === 'judging') {
      return res.status(400).json({
        error: 'Cannot remove judges while contest is in judging phase'
      });
    }

    const deleted = await db
      .deleteFrom('contest_judges')
      .where('contest_id', '=', contestId)
      .where('judge_id', '=', userId)
      .returningAll()
      .executeTakeFirst();

    if (!deleted) {
      return res.status(404).json({ error: 'Judge assignment not found' });
    }

    // Optional: delete existing scores by this judge (if desired)
    // await db.deleteFrom('contest_judge_scores').where('entry_id', 'in', ...).where('judge_id', '=', userId)

    // Optional: notify user
    // await Notification.create(userId, 'contest_judge_removed', { ... })

    res.status(200).json({ message: 'Judge removed successfully' });
  } catch (err) {
    console.error('REMOVE JUDGE ERROR:', err);
    res.status(500).json({ error: 'Failed to remove judge' });
  }
}
}

module.exports = ContestController;