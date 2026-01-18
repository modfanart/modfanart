// src/controllers/contest.controller.js
const Contest = require('../models/contest.model');
const ContestCategory = require('../models/contestCategory.model');
const User = require('../models/user.model');
const { db } = require('../config');
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

  // POST /contests (brand creates contest)
  static async createContest(req, res) {
    try {
      if (!req.user.permissions?.['contests.create']) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Brands typically create contests
      if (req.user.role_id !== (await db.selectFrom('roles').select('id').where('name', '=', 'brand').executeTakeFirst())?.id) {
        return res.status(403).json({ error: 'Only brands can create contests' });
      }

      const {
        title, slug, description, rules, prizes, start_date, submission_end_date,
        visibility = 'public', max_entries_per_user = 1, entry_requirements, judging_criteria,
        categoryIds = [],
      } = req.body;

      if (!title || !slug || !description || !start_date || !submission_end_date) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      const contest = await Contest.create(req.user.id, {
        title,
        slug,
        description,
        rules,
        prizes: prizes || null,
        start_date,
        submission_end_date,
        visibility,
        max_entries_per_user,
        entry_requirements: entry_requirements || null,
        judging_criteria: judging_criteria || null,
        status: 'draft',
      });

      // Assign categories if provided
      for (const catId of categoryIds) {
        await ContestCategory.assign(contest.id, catId);
      }

      res.status(201).json(contest);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create contest' });
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
}

module.exports = ContestController;