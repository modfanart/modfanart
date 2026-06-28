// src/controllers/contestEntry.controller.js
const Contest = require("../models/contest.model");
const ContestEntry = require("../models/contestEntry.model");
const Artwork = require("../../artworks/models/artwork.model");
const { sql } = require("kysely");
const { db } = require("../../../config");

class ContestEntryController {
  /**
   * POST /contests/:contestId/entries
   */
  static async submitEntry(req, res) {
    try {
      const { contestId } = req.params;
      const { artworkId } = req.body;

      const contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ error: "Contest not found" });

      if (contest.status !== "live") {
        return res
          .status(403)
          .json({ error: "Contest is not accepting submissions" });
      }

      const now = new Date();
      if (new Date(contest.submission_end_date) < now) {
        return res.status(403).json({ error: "Submission period has ended" });
      }

      const artwork = await Artwork.findById(artworkId);
      if (!artwork || artwork.creator_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not your artwork or artwork not found" });
      }

      if (!["published", "draft"].includes(artwork.status)) {
        return res.status(403).json({
          error: "Artwork must be published or draft to submit",
        });
      }

      // max entries per user
      const existing = await db
        .selectFrom("contest_entries")
        .select("id")
        .where("contest_id", "=", contestId)
        .where("creator_id", "=", req.user.id)
        .execute();

      if (existing.length >= contest.max_entries_per_user) {
        return res.status(403).json({
          error: `Maximum ${contest.max_entries_per_user} entries allowed`,
        });
      }

      // duplicate check
      const duplicate = await db
        .selectFrom("contest_entries")
        .select("id")
        .where("contest_id", "=", contestId)
        .where("artwork_id", "=", artworkId)
        .executeTakeFirst();

      if (duplicate) {
        return res.status(409).json({
          error: "This artwork is already submitted to this contest",
        });
      }

      const entry = await ContestEntry.create(
        contestId,
        artworkId,
        req.user.id
      );

      res.status(201).json({
        message: "Entry submitted successfully",
        entry,
      });
    } catch (err) {
      console.error("Submit entry error:", err);
      res.status(500).json({ error: "Failed to submit entry" });
    }
  }
/**
 * GET /contests/:contestId/entries
 */
static async getEntries(req, res) {
  try {
    const { contestId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({
        error: "Contest not found",
      });
    }

    let query = db
      .selectFrom("contest_entries as ce")
      .innerJoin("artworks as a", "a.id", "ce.artwork_id")
      .innerJoin("users as u", "u.id", "ce.creator_id")
      .leftJoin("contest_judge_scores as cjs", "cjs.entry_id", "ce.id")
      .select([
        // Entry
        "ce.id as entry_id",
        "ce.status as entry_status",
        "ce.rank as entry_rank",
        "ce.created_at as entry_created_at",
        "ce.updated_at as entry_updated_at",

        // Artwork
        "a.id as artwork_id",
        "a.title as artwork_title",
        "a.description as artwork_description",
        "a.file_url as artwork_file_url",
        "a.thumbnail_url as artwork_thumbnail_url",
        "a.preview_url as artwork_preview_url",
        "a.slug as artwork_slug",
        "a.status as artwork_status",
        "a.moderation_status",
        "a.views_count",
        "a.favorites_count",
        "a.created_at as artwork_created_at",
        "a.updated_at as artwork_updated_at",

        // Creator
        "u.id as creator_id",
        "u.username as creator_username",
        "u.avatar_url as creator_avatar",

        // Judge Score (null if not judged)
        "cjs.score as judge_score",
        "cjs.comments as judge_comments",
      ])
      .where("ce.contest_id", "=", contestId)
      .orderBy("ce.created_at", "desc")
      .limit(Number(limit))
      .offset(Number(offset));

    const isAuthorized =
      req.user &&
      (contest.brand_id === req.user.id ||
        req.user.permissions?.["contests.moderate"] ||
        req.user.permissions?.["contests.judge"]);

    if (!isAuthorized) {
      query = query.where("ce.status", "in", ["approved", "winner"]);
    } else if (status) {
      query = query.where("ce.status", "=", status);
    }

    const rows = await query.execute();

    const entries = rows.map((row) => ({
      id: row.entry_id,
      status: row.entry_status,
      rank: row.entry_rank,
      created_at: row.entry_created_at,
      updated_at: row.entry_updated_at,

      artwork: {
        id: row.artwork_id,
        title: row.artwork_title,
        description: row.artwork_description,
        file_url: row.artwork_file_url,
        thumbnail_url: row.artwork_thumbnail_url,
        preview_url: row.artwork_preview_url,
        slug: row.artwork_slug,
        status: row.artwork_status,
        moderation_status: row.moderation_status,
        views_count: row.views_count,
        favorites_count: row.favorites_count,
        created_at: row.artwork_created_at,
        updated_at: row.artwork_updated_at,
      },

      creator: {
        id: row.creator_id,
        username: row.creator_username,
        avatar_url: row.creator_avatar,
      },

      judge_score: row.judge_score,
      judge_comments: row.judge_comments,
    }));

    return res.json({ entries });
  } catch (err) {
    console.error("Get entries error:", err);

    return res.status(500).json({
      error: "Failed to fetch contest entries",
    });
  }
}
  /**
   * PATCH /contests/:contestId/entries/:entryId/status
   */
  static async updateEntryStatus(req, res) {
    try {
      const { contestId, entryId } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected", "disqualified"].includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
        });
      }

      const contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ error: "Contest not found" });

      const entry = await db
        .selectFrom("contest_entries")
        .selectAll()
        .where("id", "=", entryId)
        .where("contest_id", "=", contestId)
        .executeTakeFirst();

      if (!entry) return res.status(404).json({ error: "Entry not found" });

      const isAuthorized =
        contest.brand_id === req.user.id ||
        req.user.permissions?.["contests.moderate"] ||
        (await db
          .selectFrom("contest_judges")
          .select("id")
          .where("contest_id", "=", contestId)
          .where("judge_id", "=", req.user.id)
          .where("accepted", "=", true)
          .executeTakeFirst());

      if (!isAuthorized) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await db
        .updateTable("contest_entries")
        .set({
          status,
          updated_at: sql`NOW()`,
        })
        .where("id", "=", entryId)
        .execute();

      res.json({
        message: `Entry ${status} successfully`,
        entryId,
      });
    } catch (err) {
      console.error("Update entry status error:", err);
      res.status(500).json({ error: "Failed to update entry status" });
    }
  }

  /**
   * DELETE entry
   */
  static async deleteEntry(req, res) {
    try {
      const { contestId, entryId } = req.params;

      const entry = await db
        .selectFrom("contest_entries")
        .select(["id", "creator_id"])
        .where("id", "=", entryId)
        .where("contest_id", "=", contestId)
        .executeTakeFirst();

      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }

      if (entry.creator_id !== req.user.id) {
        return res.status(403).json({
          error: "You can only delete your own entries",
        });
      }

      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }

      const now = new Date();
      if (
        contest.status !== "live" ||
        new Date(contest.submission_end_date) < now
      ) {
        return res.status(403).json({
          error: "Cannot delete after submission period",
        });
      }

      await db
        .deleteFrom("contest_entries")
        .where("id", "=", entryId)
        .execute();

      res.json({
        message: "Entry successfully withdrawn",
        entryId,
      });
    } catch (err) {
      console.error("Delete entry error:", err);
      res.status(500).json({ error: "Failed to delete entry" });
    }
  }

  /**
   * GET /me/contest-entries
   */
  static async getAllMyEntries(req, res) {
    try {
      const { status, limit = 20, offset = 0 } = req.query;

      let query = db
        .selectFrom("contest_entries")
        .innerJoin("contests", "contests.id", "contest_entries.contest_id")
        .innerJoin("artworks", "artworks.id", "contest_entries.artwork_id")
        .select([
          "contest_entries.id as entry_id",
          "contest_entries.status as entry_status",

          "contest_entries.created_at as submitted_at",

          "contests.id as contest_id",
          "contests.title as contest_title",
          "contests.status as contest_status",

          "artworks.id as artwork_id",
          "artworks.title as artwork_title",
          "artworks.thumbnail_url",
        ])
        .where("contest_entries.creator_id", "=", req.user.id)
        .orderBy("contest_entries.created_at", "desc");

      if (status) {
        query = query.where("contest_entries.status", "=", status);
      }

      query = query.limit(Number(limit)).offset(Number(offset));

      const entries = await query.execute();

      res.json({
        entries,
        total: entries.length,
      });
    } catch (err) {
      console.error("Get my entries error:", err);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  }
}

module.exports = ContestEntryController;
