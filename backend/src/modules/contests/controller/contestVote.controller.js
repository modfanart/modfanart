// src/controllers/contestVote.controller.js
const Contest = require("../models/contest.model");
const ContestEntry = require("../models/contestEntry.model");
const { db } = require("../../../config");
const { sql } = require("kysely");
class ContestVoteController {
  // POST /contests/:contestId/entries/:entryId/vote
  static async vote(req, res) {
    try {
      const { contestId, entryId } = req.params;

      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }

      if (
        contest.status !== "live" ||
        !contest.voting_end_date ||
        new Date(contest.voting_end_date) < new Date()
      ) {
        return res
          .status(403)
          .json({ error: "Voting is not active for this contest" });
      }

      const entry = await db
        .selectFrom("contest_entries")
        .selectAll()
        .where("id", "=", entryId)
        .where("contest_id", "=", contestId)
        .where("status", "=", "approved")
        .executeTakeFirst();

      if (!entry) {
        return res
          .status(404)
          .json({ error: "Entry not found or not approved" });
      }

      if (entry.creator_id === req.user.id) {
        return res
          .status(403)
          .json({ error: "Cannot vote for your own entry" });
      }

      const existingVote = await db
        .selectFrom("contest_votes")
        .select("user_id")
        .where("entry_id", "=", entryId)
        .where("user_id", "=", req.user.id)
        .executeTakeFirst();

      if (existingVote) {
        return res
          .status(403)
          .json({ error: "You have already voted for this entry" });
      }

      const voteWeight = 1;

      await db
        .insertInto("contest_votes")
        .values({
          entry_id: entryId,
          user_id: req.user.id,
          vote_weight: voteWeight,
          created_at: sql`NOW()`,
        })
        .execute();

      return res.json({
        message: "Vote recorded successfully",
        entryId,
      });
    } catch (err) {
      console.error("Vote error:", err);
      return res.status(500).json({ error: "Failed to record vote" });
    }
  }

  // GET /contests/:contestId/leaderboard (public)
  static async getLeaderboard(req, res) {
    try {
      const { contestId } = req.params;

      const entries = await db
        .selectFrom("contest_entries")
        .leftJoin(
          "contest_judge_scores",
          "contest_judge_scores.entry_id",
          "contest_entries.id"
        )
        .select([
          "contest_entries.id",
          "contest_entries.artwork_id",
          "contest_entries.creator_id",
          "contest_entries.status",
          sql`COALESCE(SUM(contest_judge_scores.score), 0)`.as("score"),
        ])
        .where("contest_entries.contest_id", "=", contestId)
        .where("contest_entries.status", "in", ["approved", "winner"])
        .groupBy([
          "contest_entries.id",
          "contest_entries.artwork_id",
          "contest_entries.creator_id",
          "contest_entries.status",
        ])
        .orderBy("score", "desc")
        .execute();
      // Optional: join with artwork/user info
      const enriched = await Promise.all(
        entries.map(async (entry) => {
          const artwork = await db
            .selectFrom("artworks")
            .select(["title", "thumbnail_url"])
            .where("id", "=", entry.artwork_id)
            .executeTakeFirst();

          const creator = await db
            .selectFrom("users")
            .select(["username", "avatar_url"])
            .where("id", "=", entry.creator_id)
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
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  }
}

module.exports = ContestVoteController;
