// src/controllers/contestEntry.controller.js
const Contest = require('../models/contest.model');
const ContestEntry = require('../models/contestEntry.model');
const Artwork = require('../models/artwork.model');
const User = require('../models/user.model');
const { sql } = require('kysely');
const { db } = require('../config');
class ContestEntryController {
  /**
   * POST /contests/:contestId/entries
   * Submit a new entry (creator only)
   */
  static async submitEntry(req, res) {
    try {
      const { contestId } = req.params;
      const { artworkId, submission_notes } = req.body;

      const contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ error: 'Contest not found' });

      if (contest.status !== 'live') {
        return res.status(403).json({ error: 'Contest is not accepting submissions' });
      }

      const now = new Date();
      if (new Date(contest.submission_end_date) < now) {
        return res.status(403).json({ error: 'Submission period has ended' });
      }

      const artwork = await Artwork.findById(artworkId);
      if (!artwork || artwork.creator_id !== req.user.id) {
        return res.status(403).json({ error: 'Not your artwork or artwork not found' });
      }

 // Temporarily relax the check
if (artwork.status !== 'published' && artwork.status !== 'draft') {
  return res.status(403).json({ error: 'Artwork must be published or in draft to submit' });
}
      // Check max entries per user
      const existing = await db
        .selectFrom('contest_entries')
        .select('id')
        .where('contest_id', '=', contestId)
        .where('creator_id', '=', req.user.id)
        .execute();

      if (existing.length >= contest.max_entries_per_user) {
        return res.status(403).json({
          error: `Maximum ${contest.max_entries_per_user} entries allowed per user`,
        });
      }

      // Optional: check if this artwork is already submitted to this contest
      const duplicate = await db
        .selectFrom('contest_entries')
        .select('id')
        .where('contest_id', '=', contestId)
        .where('artwork_id', '=', artworkId)
        .executeTakeFirst();

      if (duplicate) {
        return res.status(409).json({ error: 'This artwork is already submitted to this contest' });
      }

      const entry = await ContestEntry.create(contestId, artworkId, req.user.id, submission_notes || null);

      // Optional: notify brand/moderators of new submission
      // await Notification.create(contest.brand_id, 'new_entry', { contestId, entryId: entry.id });

      res.status(201).json({
        message: 'Entry submitted successfully',
        entry,
      });
    } catch (err) {
      console.error('Submit entry error:', err);
      res.status(500).json({ error: 'Failed to submit entry' });
    }
  }

  /**
   * GET /contests/:contestId/entries
   * List entries for a contest (public view filtered, full for authorized users)
   */
  static async getEntries(req, res) {
    try {
      const { contestId } = req.params;
      const { status, limit = 20, offset = 0 } = req.query;

      const contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ error: 'Contest not found' });

      let query = db
        .selectFrom('contest_entries')
        .innerJoin('artworks', 'artworks.id', 'contest_entries.artwork_id')
        .innerJoin('users', 'users.id', 'contest_entries.creator_id')
        .select([
          'contest_entries.id',
          'contest_entries.status',
          'contest_entries.rank',
          'contest_entries.score_public',
          'contest_entries.submission_notes',
          'contest_entries.created_at',
          'artworks.id as artwork_id',
          'artworks.title',
          'artworks.thumbnail_url',
          'users.username as creator_username',
          'users.avatar_url as creator_avatar',
        ])
        .where('contest_entries.contest_id', '=', contestId)
        .orderBy('contest_entries.score_public', 'desc')
        .orderBy('contest_entries.created_at', 'asc')
        .limit(Number(limit))
        .offset(Number(offset));

      // Public view: only show approved/winner entries
      const isAuthorized =
        req.user &&
        (contest.brand_id === req.user.id ||
          req.user.permissions?.['contests.moderate'] ||
          req.user.permissions?.['contests.judge']);

      if (!isAuthorized) {
        query = query.where('contest_entries.status', 'in', ['approved', 'winner']);
      } else if (status) {
        // Moderators/judges/brands can filter by status
        query = query.where('contest_entries.status', '=', status);
      }

      const entries = await query.execute();

      res.json({ entries });
    } catch (err) {
      console.error('Get entries error:', err);
      res.status(500).json({ error: 'Failed to fetch contest entries' });
    }
  }

  /**
   * PATCH /contests/:contestId/entries/:entryId/status
   * Update entry status (approve / reject / disqualify) — moderator/judge/brand
   */
  static async updateEntryStatus(req, res) {
    try {
      const { contestId, entryId } = req.params;
      const { status, notes } = req.body; // status: 'approved' | 'rejected' | 'disqualified'

      if (!['approved', 'rejected', 'disqualified'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Allowed: approved, rejected, disqualified' });
      }

      const contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ error: 'Contest not found' });

      const entry = await db
        .selectFrom('contest_entries')
        .selectAll()
        .where('id', '=', entryId)
        .where('contest_id', '=', contestId)
        .executeTakeFirst();

      if (!entry) return res.status(404).json({ error: 'Entry not found' });

      // Authorization: brand owner, moderator, or assigned judge
      const isAuthorized =
        contest.brand_id === req.user.id ||
        req.user.permissions?.['contests.moderate'] ||
        (await db
          .selectFrom('contest_judges')
          .where('contest_id', '=', contestId)
          .where('judge_id', '=', req.user.id)
          .where('accepted', '=', true)
          .executeTakeFirst());

      if (!isAuthorized) {
        return res.status(403).json({ error: 'Not authorized to moderate this entry' });
      }

      // Update entry
      await db
        .updateTable('contest_entries')
        .set({
          status,
          moderation_status: status === 'approved' ? 'approved' : 'rejected',
          moderated_by: req.user.id,
          moderated_at: sql`NOW()`,
          updated_at: sql`NOW()`,
          // notes if you add a moderation_notes column later
        })
        .where('id', '=', entryId)
        .execute();

      // Optional: notify creator
      // await Notification.create(entry.creator_id, 'entry_status_updated', {
      //   contestId,
      //   entryId,
      //   status,
      // });

      res.json({
        message: `Entry ${status} successfully`,
        entryId,
        newStatus: status,
      });
    } catch (err) {
      console.error('Update entry status error:', err);
      res.status(500).json({ error: 'Failed to update entry status' });
    }
  }
}

module.exports = ContestEntryController;