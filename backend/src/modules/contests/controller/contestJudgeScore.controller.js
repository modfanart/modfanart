// src/controllers/contestJudgeScore.controller.js
const ContestJudgeScore = require("../models/contestJudgeScore.model");
const ContestEntry = require("../models/contestEntry.model");
const Contest = require("../models/contest.model");
const { sql } = require("kysely");
const { db } = require("../../../config");
class ContestJudgeScoreController {
  /**
   * POST /contests/:contestId/entries/:entryId/score
   * Submit or update a judge's score for an entry
   */
  static async submitScore(req, res) {
    try {
      const { contestId, entryId } = req.params;
      const { score, comments } = req.body;

      // Validate input
      if (typeof score !== "number" || score < 0 || score > 100) {
        return res
          .status(400)
          .json({ error: "Score must be a number between 0 and 100" });
      }

      // Verify the user is an assigned and accepted judge for this contest
      const judgeAssignment = await db
        .selectFrom("contest_judges")
        .selectAll()
        .where("contest_id", "=", contestId)
        .where("judge_id", "=", req.user.id)
        .where("accepted", "=", true)
        .executeTakeFirst();

      if (!judgeAssignment) {
        return res
          .status(403)
          .json({ error: "You are not an assigned judge for this contest" });
      }

      // Verify the entry exists and belongs to this contest
      const entry = await db
        .selectFrom("contest_entries")
        .selectAll()
        .where("id", "=", entryId)
        .where("contest_id", "=", contestId)
        .executeTakeFirst();

      if (!entry) {
        return res
          .status(404)
          .json({ error: "Entry not found in this contest" });
      }

      // Optional: check if contest is in judging phase
      const contest = await Contest.findById(contestId);
      if (contest.status !== "judging") {
        return res
          .status(403)
          .json({ error: "Scoring is only allowed during the judging phase" });
      }

      // Submit / update score (upsert behavior via onConflict)
      await ContestJudgeScore.submit(
        entryId,
        req.user.id,
        score,
        comments || null
      );

      res.status(201).json({
        message: "Score submitted successfully",
        entryId,
        score,
        judgeId: req.user.id,
      });
    } catch (err) {
      console.error("Submit score error:", err);
      res.status(500).json({ error: "Failed to submit score" });
    }
  }

  /**
   * GET /contests/:contestId/my-scores
   *
   * Every score the signed-in judge has recorded on this contest.
   *
   * The judging panel's judge_score column is MAX across all judges, so a
   * judge could not tell their own verdict from a colleague's, nor which
   * entries they had already been through. Working a large field over several
   * sittings that is the difference between finishing and starting again.
   *
   * Needs no authorization beyond being signed in: it is filtered to
   * req.user.id and can only ever return the caller's own rows.
   */
  static async getMyScores(req, res) {
    try {
      const { contestId } = req.params;

      const scores = await db
        .selectFrom("contest_judge_scores as cjs")
        .innerJoin("contest_entries as ce", "ce.id", "cjs.entry_id")
        .select([
          "cjs.entry_id",
          "cjs.judge_id",
          "cjs.score",
          "cjs.comments",
          "cjs.created_at",
        ])
        .where("ce.contest_id", "=", contestId)
        .where("cjs.judge_id", "=", req.user.id)
        .execute();

      // score is numeric, which pg returns as a string. The client compares
      // and renders it as a number.
      res.json({
        scores: scores.map((s) => ({ ...s, score: Number(s.score) })),
      });
    } catch (err) {
      console.error("Get my scores error:", err);
      res.status(500).json({ error: "Failed to fetch your scores" });
    }
  }

  /**
   * GET /contests/:contestId/entries/:entryId/scores
   * Get all judge scores for a specific entry
   * (Restricted: brand owner, admin, or the judges themselves)
   */
  static async getScoresForEntry(req, res) {
    try {
      const { contestId, entryId } = req.params;

      // Verify entry exists and belongs to contest
      const entry = await db
        .selectFrom("contest_entries")
        .selectAll()
        .where("id", "=", entryId)
        .where("contest_id", "=", contestId)
        .executeTakeFirst();

      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }

      const contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ error: "Contest not found" });

      // Authorization: brand owner, admin/moderator, or any assigned judge
      const isAuthorized =
        (req.user.brands || []).some((brand) => brand.id === contest.brand_id) ||
        req.user.permissions?.["contests.view_scores"] ||
        req.user.permissions?.["contests.judge"] ||
        (await db
          .selectFrom("contest_judges")
          .where("contest_id", "=", contestId)
          .where("judge_id", "=", req.user.id)
          .where("accepted", "=", true)
          .executeTakeFirst());

      if (!isAuthorized) {
        return res
          .status(403)
          .json({ error: "Not authorized to view scores for this entry" });
      }

      // Fetch all scores
      const scores = await db
        .selectFrom("contest_judge_scores")
        .innerJoin("users", "users.id", "contest_judge_scores.judge_id")
        .select([
          "contest_judge_scores.entry_id",
          "contest_judge_scores.judge_id",
          "contest_judge_scores.score",
          "contest_judge_scores.comments",
          "contest_judge_scores.created_at",
          "users.username as judge_username",
          "users.avatar_url as judge_avatar",
        ])
        .where("contest_judge_scores.entry_id", "=", entryId)
        .orderBy("contest_judge_scores.created_at", "asc")
        .execute();

      // Optional: calculate average judge score
      const averageScore =
        scores.length > 0
          ? Number(
              (
                scores.reduce((sum, s) => sum + s.score, 0) / scores.length
              ).toFixed(2)
            )
          : null;

      res.json({
        entryId,
        scores,
        averageJudgeScore: averageScore,
        totalJudgesScored: scores.length,
      });
    } catch (err) {
      console.error("Get scores error:", err);
      res.status(500).json({ error: "Failed to fetch entry scores" });
    }
  }
}

module.exports = ContestJudgeScoreController;
