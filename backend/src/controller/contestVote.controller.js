// src/controllers/contestVote.controller.js
const Contest = require('../models/contest.model');
const ContestEntry = require('../models/contestEntry.model');
const { db } = require('../config');
class ContestVoteController {
  // POST /contests/:contestId/entries/:entryId/vote
  static async vote(req, res) {
    try {
      const { contestId, entryId } = req.params;

      const contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ error: 'Contest not found' });

      if (
        contest.status !== 'live' ||
        !contest.voting_end_date ||
        new Date(contest.voting_end_date) < new Date()
      ) {
        return res
          .status(403)
          .json({ error: 'Voting is not active for this contest' });
      }

      const entry = await db
        .selectFrom('contest_entries')
        .selectAll()
        .where('id', '=', entryId)
        .where('contest_id', '=', contestId)
        .where('status', '=', 'approved')
        .executeTakeFirst();

      if (!entry)
        return res
          .status(404)
          .json({ error: 'Entry not found or not approved' });

      // Prevent self-voting (optional but common)
      if (entry.creator_id === req.user.id) {
        return res
          .status(403)
          .json({ error: 'Cannot vote for your own entry' });
      }

      // Check if user already voted for this entry
      const existingVote = await db
        .selectFrom('contest_votes')
        .select('user_id')
        .where('entry_id', '=', entryId)
        .where('user_id', '=', req.user.id)
        .executeTakeFirst();

      if (existingVote) {
        return res
          .status(403)
          .json({ error: 'You have already voted for this entry' });
      }

      // Future: premium users could have vote_weight > 1
      const voteWeight = 1; // or fetch from user role/premium status

      await db
        .insertInto('contest_votes')
        .values({
          entry_id: entryId,
          user_id: req.user.id,
          vote_weight: voteWeight,
          created_at: sql`NOW()`,
        })
        .execute();

      // Optional: increment public score (denormalized for faster queries)
      await db
        .updateTable('contest_entries')
        .set((eb) => ({
          score_public: eb.ref('score_public').plus(voteWeight),
        }))
        .where('id', '=', entryId)
        .execute();

      res.json({ message: 'Vote recorded successfully', entryId });
    } catch (err) {
      console.error('Vote error:', err);
      res.status(500).json({ error: 'Failed to record vote' });
    }
  }

  // GET /contests/:contestId/leaderboard (public)
  static async getLeaderboard(req, res) {
    try {
      const { contestId } = req.params;

      const entries = await db
        .selectFrom('contest_entries')
        .select([
          'id',
          'artwork_id',
          'creator_id',
          'score_public',
          'rank',
          'status',
        ])
        .where('contest_id', '=', contestId)
        .where('status', 'in', ['approved', 'winner'])
        .orderBy('score_public', 'desc')
        .orderBy('created_at', 'asc') // tiebreaker
        .limit(50) // top 50 or adjust
        .execute();

      // Optional: join with artwork/user info
      const enriched = await Promise.all(
        entries.map(async (entry) => {
          const artwork = await db
            .selectFrom('artworks')
            .select(['title', 'thumbnail_url'])
            .where('id', '=', entry.artwork_id)
            .executeTakeFirst();

          const creator = await db
            .selectFrom('users')
            .select(['username', 'avatar_url'])
            .where('id', '=', entry.creator_id)
            .executeTakeFirst();

          return {
            ...entry,
            artwork_title: artwork?.title,
            artwork_thumbnail: artwork?.thumbnail_url,
            creator_username: creator?.username,
          };
        })
      );

      res.json({ leaderboard: enriched });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }
}

module.exports = ContestVoteController;
