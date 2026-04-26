// src/controllers/contest.controller.js
const { db } = require('../config');
const { sql } = require('kysely');

class ContestController {
  // GET /contests (public + filtered)
  static async getContests(req, res) {
    try {
      const {
        status,
        visibility = 'public',
        brandId,
        limit = 20,
        offset = 0,
      } = req.query;

      let query = db
        .selectFrom('contests')
        .selectAll() // Includes hero_image and gallery
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

      const contest = await db
        .selectFrom('contests')
        .selectAll()
        .where('id', '=', id)
        .where('deleted_at', 'is', null)
        .executeTakeFirst();

      if (!contest) {
        return res.status(404).json({ error: 'Contest not found' });
      }

      // Enrich with categories
      const categoryRows = await db
        .selectFrom('contest_categories')
        .select('category_id')
        .where('contest_id', '=', id)
        .execute();

      const categoryIds = categoryRows.map((r) => r.category_id);

      const categories =
        categoryIds.length > 0
          ? await db
              .selectFrom('categories')
              .select(['id', 'name', 'slug'])
              .where('id', 'in', categoryIds)
              .execute()
          : [];

      res.json({ ...contest, categories });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch contest' });
    }
  }

  // POST /contests - Create New Contest
  static async createContest(req, res) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
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
        hero_image,
        gallery = [],
        categoryIds = [],
      } = req.body;

      // Required fields validation
      if (
        !brand_id ||
        !title?.trim() ||
        !description?.trim() ||
        !start_date ||
        !submission_end_date
      ) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: [
            'brand_id',
            'title',
            'description',
            'start_date',
            'submission_end_date',
          ],
        });
      }

      // Date validation
      const startDate = new Date(start_date);
      const endDate = new Date(submission_end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      if (endDate <= startDate) {
        return res
          .status(400)
          .json({ error: 'submission_end_date must be after start_date' });
      }

      // Brand existence check
      const brand = await db
        .selectFrom('brands')
        .select(['id'])
        .where('id', '=', brand_id)
        .executeTakeFirst();

      if (!brand) return res.status(404).json({ error: 'Brand not found' });

      // Slug generation & uniqueness
      let slug = providedSlug?.trim();
      if (!slug) {
        slug = title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }

      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const existing = await db
          .selectFrom('contests')
          .select('id')
          .where('slug', '=', finalSlug)
          .where('deleted_at', 'is', null)
          .executeTakeFirst();

        if (!existing) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      // Additional validations
      if (prizes && !Array.isArray(prizes)) {
        return res.status(400).json({ error: 'prizes must be an array' });
      }
      if (entry_requirements && typeof entry_requirements !== 'object') {
        return res
          .status(400)
          .json({ error: 'entry_requirements must be an object' });
      }
      if (gallery && !Array.isArray(gallery)) {
        return res.status(400).json({ error: 'gallery must be an array' });
      }
      if (hero_image && typeof hero_image !== 'string') {
        return res
          .status(400)
          .json({ error: 'hero_image must be a string URL' });
      }

      // Transaction
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

            // NEW FIELDS
            hero_image: hero_image?.trim() || null,
            gallery:
              Array.isArray(gallery) && gallery.length > 0
                ? JSON.stringify(gallery)
                : '[]',

            created_at: sql`NOW()`,
            updated_at: sql`NOW()`,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        // Category mapping
        if (categoryIds.length > 0) {
          const validCategories = await trx
            .selectFrom('categories')
            .select('id')
            .where('id', 'in', categoryIds)
            .execute();

          const rows = validCategories.map((cat) => ({
            contest_id: contest.id,
            category_id: cat.id,
          }));

          if (rows.length > 0) {
            await trx.insertInto('contest_categories').values(rows).execute();
          }
        }

        return contest;
      });

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      console.error('CREATE CONTEST ERROR:', err);
      res.status(500).json({
        error: 'Failed to create contest',
        ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
      });
    }
  }

  // PATCH /contests/:id
  static async updateContest(req, res) {
    try {
      const { id } = req.params;

      const existing = await db
        .selectFrom('contests')
        .select(['id'])
        .where('id', '=', id)
        .where('deleted_at', 'is', null)
        .executeTakeFirst();

      if (!existing)
        return res.status(404).json({ error: 'Contest not found' });

      const updateData = { ...req.body, updated_at: sql`NOW()` };
      delete updateData.id;
      delete updateData.created_at;

      if (
        updateData.gallery !== undefined &&
        !Array.isArray(updateData.gallery)
      ) {
        return res.status(400).json({ error: 'gallery must be an array' });
      }

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

  // DELETE /contests/:id (soft delete)
  static async deleteContest(req, res) {
    try {
      const { id } = req.params;

      const contest = await db
        .selectFrom('contests')
        .select(['id', 'brand_id', 'status'])
        .where('id', '=', id)
        .where('deleted_at', 'is', null)
        .executeTakeFirst();

      if (!contest) return res.status(404).json({ error: 'Contest not found' });

      const isAdmin =
        req.user?.role === 'Admin' ||
        req.user?.permissions?.['contests.manage'] === true;
      let isBrandOwner = false;

      if (!isAdmin) {
        const brand = await db
          .selectFrom('brands')
          .select('id')
          .where('id', '=', contest.brand_id)
          .where('user_id', '=', req.user.id)
          .executeTakeFirst();
        isBrandOwner = !!brand;
      }

      if (!isAdmin && !isBrandOwner) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      if (['live', 'judging', 'completed'].includes(contest.status)) {
        return res.status(400).json({ error: 'Cannot delete active contests' });
      }

      await db
        .updateTable('contests')
        .set({
          deleted_at: sql`NOW()`,
          status: 'archived',
          updated_at: sql`NOW()`,
        })
        .where('id', '=', id)
        .execute();

      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete contest' });
    }
  }

  // PATCH /contests/:id/announce-winners
  static async announceWinners(req, res) {
    try {
      const { id } = req.params;
      const contest = await db
        .selectFrom('contests')
        .select(['id', 'brand_id', 'status'])
        .where('id', '=', id)
        .where('deleted_at', 'is', null)
        .executeTakeFirst();

      if (!contest) return res.status(404).json({ error: 'Contest not found' });

      const isAuthorized =
        contest.brand_id === req.user.id ||
        req.user?.permissions?.['contests.manage'];
      if (!isAuthorized)
        return res.status(403).json({ error: 'Not authorized' });

      if (!['judging', 'completed'].includes(contest.status)) {
        return res
          .status(400)
          .json({ error: 'Contest must be in judging or completed state' });
      }

      await db
        .updateTable('contests')
        .set({
          status: 'completed',
          winner_announced: true,
          updated_at: sql`NOW()`,
        })
        .where('id', '=', id)
        .execute();

      res.json({ message: 'Winners announced successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to announce winners' });
    }
  }

  // POST /contests/:id/distribute-prizes
  static async distributePrizes(req, res) {
    try {
      const { id } = req.params;
      const contest = await db
        .selectFrom('contests')
        .selectAll()
        .where('id', '=', id)
        .where('deleted_at', 'is', null)
        .executeTakeFirst();

      if (!contest) return res.status(404).json({ error: 'Contest not found' });

      const isAuthorized =
        contest.brand_id === req.user.id ||
        req.user?.permissions?.['contests.manage'];
      if (!isAuthorized)
        return res.status(403).json({ error: 'Not authorized' });

      if (!contest.winner_announced) {
        return res
          .status(400)
          .json({ error: 'Winners must be announced first' });
      }

      const winners = await db
        .selectFrom('contest_entries')
        .select(['id', 'creator_id', 'rank'])
        .where('contest_id', '=', id)
        .where('status', '=', 'winner')
        .where('rank', 'is not', null)
        .orderBy('rank', 'asc')
        .execute();

      if (winners.length === 0) {
        return res.status(400).json({ error: 'No winners found' });
      }

      const prizes = contest.prizes || [];
      for (const winner of winners) {
        const prize = prizes.find((p) => p.rank === winner.rank);
        if (!prize) continue;

        await db
          .insertInto('orders')
          .values({
            order_number: `PRZ-${id}-${winner.rank}-${Date.now()}`,
            buyer_id: contest.brand_id,
            seller_id: winner.creator_id,
            source_type: 'contest_prize',
            source_id: winner.id,
            status: 'fulfilled',
            currency: 'INR',
            subtotal_cents: (prize.amount_inr || 0) * 100,
            total_cents: (prize.amount_inr || 0) * 100,
            created_at: sql`NOW()`,
            updated_at: sql`NOW()`,
          })
          .execute();
      }

      res.json({
        message: 'Prizes distributed successfully',
        winners_count: winners.length,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to distribute prizes' });
    }
  }

  // GET /brands/:brandId/contests/judges
  static async getAllContestJudgesByBrandId(req, res) {
    try {
      const { brandId } = req.params;
      const { status, visibility = 'public' } = req.query;

      // Authorization (brand owner or admin)
      if (
        req.user.id !== brandId &&
        !req.user?.permissions?.['contests.manage']
      ) {
        const brand = await db
          .selectFrom('brands')
          .select('user_id')
          .where('id', '=', brandId)
          .executeTakeFirst();
        if (!brand || brand.user_id !== req.user.id) {
          return res.status(403).json({ error: 'Not authorized' });
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
          "users.profile->>'full_name' as judge_name",
          'contest_judges.accepted as judge_accepted',
          'contest_judges.created_at as assigned_at',
        ])
        .where('contests.brand_id', '=', brandId)
        .where('contests.deleted_at', 'is', null)
        .where('contests.visibility', '=', visibility)
        .orderBy('contests.created_at', 'desc');

      if (status) query = query.where('contests.status', '=', status);

      const rows = await query.execute();

      const contestsMap = new Map();
      for (const row of rows) {
        if (!contestsMap.has(row.contest_id)) {
          contestsMap.set(row.contest_id, {
            id: row.contest_id,
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
          contestsMap.get(row.contest_id).judges.push({
            user_id: row.judge_id,
            username: row.judge_username,
            name: row.judge_name,
            accepted: row.judge_accepted,
            assigned_at: row.assigned_at,
          });
        }
      }

      res.json({ contests: Array.from(contestsMap.values()) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch judges' });
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
      if (
        contest.brand_id !== req.user.id &&
        !req.user.permissions?.['contests.manage']
      ) {
        return res
          .status(403)
          .json({ error: 'Not authorized to remove judges' });
      }

      // Optional: prevent removal during active judging
      if (contest.status === 'judging') {
        return res.status(400).json({
          error: 'Cannot remove judges while contest is in judging phase',
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
  // GET /contests/by-status
  static async getContestsByStatus(req, res) {
    try {
      const {
        status,
        visibility = 'public',
        brand_id,
        page = 1,
        limit = 20,
        sort = 'start_date',
        order = 'desc',
      } = req.query;

      const validStatuses = [
        'draft',
        'published',
        'live',
        'judging',
        'completed',
        'archived',
      ];
      if (status && !validStatuses.includes(status)) {
        return res
          .status(400)
          .json({
            error: `Invalid status. Allowed: ${validStatuses.join(', ')}`,
          });
      }

      const pageNum = Math.max(1, Number(page));
      const perPage = Math.min(100, Math.max(1, Number(limit)));
      const offset = (pageNum - 1) * perPage;

      const allowedSort = [
        'created_at',
        'start_date',
        'submission_end_date',
        'judging_end_date',
        'updated_at',
      ];
      const sortField = allowedSort.includes(sort) ? sort : 'start_date';
      const sortDir = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

      const contests = await db
        .selectFrom('contests as c')
        .select([
          'c.*', // includes hero_image & gallery
          db
            .selectFrom('contest_entries')
            .whereRef('contest_entries.contest_id', '=', 'c.id')
            .select(db.fn.countAll().as('entry_count'))
            .as('entry_count'),
        ])
        .where('c.deleted_at', 'is', null)
        .where('c.visibility', '=', visibility)
        .$if(status, (qb) => qb.where('c.status', '=', status))
        .$if(brand_id, (qb) => qb.where('c.brand_id', '=', brand_id))
        .orderBy(`c.${sortField}`, sortDir)
        .limit(perPage)
        .offset(offset)
        .execute();

      // Total count
      let countQuery = db
        .selectFrom('contests')
        .select(db.fn.countAll().as('total'))
        .where('deleted_at', 'is', null)
        .where('visibility', '=', visibility);
      if (status) countQuery = countQuery.where('status', '=', status);
      if (brand_id) countQuery = countQuery.where('brand_id', '=', brand_id);

      const { total } = await countQuery.executeTakeFirst();
      const totalCount = Number(total || 0);
      const totalPages = Math.ceil(totalCount / perPage);

      res.json({
        success: true,
        data: contests,
        pagination: {
          page: pageNum,
          limit: perPage,
          total: totalCount,
          totalPages,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch contests by status' });
    }
  }

  // GET my submitted contests
  static async getMySubmittedContests(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: 'Authentication required' });

      const contests = await db
        .selectFrom('contests as c')
        .innerJoin('contest_entries as e', 'e.contest_id', 'c.id')
        .leftJoin('contest_entries as me', (join) =>
          join
            .onRef('me.contest_id', '=', 'c.id')
            .on('me.creator_id', '=', userId)
        )
        .select([
          'c.id',
          'c.title',
          'c.slug',
          'c.description',
          'c.status',
          'c.start_date',
          'c.submission_end_date',
          'c.created_at',
          'c.hero_image',
          'c.gallery',
          db.fn.count('e.id').as('entry_count'),
          'me.id as entry_id',
          'me.status as entry_status',
          'me.rank as entry_rank',
        ])
        .where('e.creator_id', '=', userId)
        .where('c.deleted_at', 'is', null)
        .groupBy([
          'c.id',
          'c.title',
          'c.slug',
          'c.description',
          'c.status',
          'c.start_date',
          'c.submission_end_date',
          'c.created_at',
          'c.hero_image',
          'c.gallery',
          'me.id',
          'me.status',
          'me.rank',
        ])
        .orderBy('c.created_at', 'desc')
        .execute();

      res.json({ success: true, contests });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch your submissions' });
    }
  }
}

module.exports = ContestController;
