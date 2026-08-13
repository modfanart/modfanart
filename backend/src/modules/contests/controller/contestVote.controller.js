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

  /**
   * GET /contests/:contestId/leaderboard?limit=10
   *
   * Ranks entries by judge score. It lives beside voting for historical
   * reasons; no part of it reads contest_votes.
   *
   * Ranks on AVG, not SUM. Under SUM an entry two judges both rated 5 (total
   * 10) beat an entry one judge rated 9 (total 9), so the piece the judges
   * thought more of placed lower purely because fewer of them reached it.
   * With judges working independently through a large field that is the
   * normal case, not an edge case. judge_count travels with every row so a
   * thinly covered entry is visible as such rather than silently flattered.
   *
   * Entries nobody scored are excluded rather than ranked at zero. They are
   * not finalists, and padding the tail with them made "top 10" meaningless
   * on a contest where scoring had barely started.
   */
  static async getLeaderboard(req, res) {
    try {
      const { contestId } = req.params;
      const limit = Math.min(
        200,
        Math.max(1, parseInt(req.query.limit, 10) || 200)
      );

      const contest = await db
        .selectFrom("contests")
        .select(["id", "brand_id"])
        .where("id", "=", contestId)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

      if (!contest) return res.status(404).json({ error: "Contest not found" });

      // Standings expose every judge's verdict in aggregate, so they are not
      // public. Same audience as getScoresForEntry: the brand that owns the
      // contest, staff, and the contest's own accepted judges. Dean reviews
      // the finalists through an accepted judge invite, which lands here.
      const isAuthorized =
        (req.user?.brands || []).some((b) => b.id === contest.brand_id) ||
        req.user?.permissions?.["contests.view_scores"] ||
        req.user?.permissions?.["contests.manage"] ||
        (await db
          .selectFrom("contest_judges")
          .select("judge_id")
          .where("contest_id", "=", contestId)
          .where("judge_id", "=", req.user?.id)
          .where("accepted", "=", true)
          .executeTakeFirst());

      if (!isAuthorized) {
        return res
          .status(403)
          .json({ error: "Not authorized to view standings for this contest" });
      }

      // One grouped query with the artwork and creator joined in. The previous
      // version ran two extra queries per entry inside a Promise.all, which on
      // this contest's field would have been ~150 round trips for one page.
      const rows = await db
        .selectFrom("contest_entries as ce")
        .innerJoin("contest_judge_scores as cjs", "cjs.entry_id", "ce.id")
        .innerJoin("artworks as a", "a.id", "ce.artwork_id")
        .innerJoin("users as u", "u.id", "ce.creator_id")
        .select([
          "ce.id as entry_id",
          "ce.artwork_id",
          "ce.creator_id",
          "ce.status",
          "ce.created_at",
          "a.title as artwork_title",
          "a.thumbnail_url as artwork_thumbnail",
          "a.file_url as artwork_file_url",
          "u.username as creator_username",
          "u.avatar_url as creator_avatar",
          sql`AVG(cjs.score)`.as("avg_score"),
          sql`COUNT(DISTINCT cjs.judge_id)`.as("judge_count"),
        ])
        .where("ce.contest_id", "=", contestId)
        .where("ce.status", "in", ["approved", "winner"])
        .groupBy([
          "ce.id",
          "ce.artwork_id",
          "ce.creator_id",
          "ce.status",
          "ce.created_at",
          "a.title",
          "a.thumbnail_url",
          "a.file_url",
          "u.username",
          "u.avatar_url",
        ])
        // Ties break towards the entry more judges actually saw, then towards
        // whoever submitted first, so the order is stable between requests.
        .orderBy(sql`AVG(cjs.score)`, "desc")
        .orderBy(sql`COUNT(DISTINCT cjs.judge_id)`, "desc")
        .orderBy("ce.created_at", "asc")
        .execute();

      // pg hands back numeric as a string and AVG as something like
      // "7.0000000000000000", so every score has to be coerced before it is
      // compared or rendered. There are no type parsers registered.
      let lastScore = null;
      let lastRank = 0;
      const ranked = rows.map((row, index) => {
        const score = Number(Number(row.avg_score).toFixed(2));
        // Competition ranking: equal averages share a rank (1, 2, 2, 4).
        // Two judges scoring out of 10 produce ties constantly.
        const rank = score === lastScore ? lastRank : index + 1;
        lastScore = score;
        lastRank = rank;

        return {
          entry_id: row.entry_id,
          artwork_id: row.artwork_id,
          creator_id: row.creator_id,
          status: row.status,
          rank,
          score_judge: score,
          judge_count: Number(row.judge_count),
          artwork_title: row.artwork_title,
          artwork_thumbnail: row.artwork_thumbnail,
          artwork_file_url: row.artwork_file_url,
          creator_username: row.creator_username,
          creator_avatar: row.creator_avatar,
        };
      });

      const judgesTotal = await db
        .selectFrom("contest_judges")
        .select(sql`COUNT(*)`.as("count"))
        .where("contest_id", "=", contestId)
        .where("accepted", "=", true)
        .executeTakeFirst();

      const approved = await db
        .selectFrom("contest_entries")
        .select(sql`COUNT(*)`.as("count"))
        .where("contest_id", "=", contestId)
        .where("status", "in", ["approved", "winner"])
        .executeTakeFirst();

      res.json({
        leaderboard: ranked.slice(0, limit),
        scored_total: ranked.length,
        approved_total: Number(approved?.count ?? 0),
        judges_total: Number(judgesTotal?.count ?? 0),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  }
}

module.exports = ContestVoteController;
