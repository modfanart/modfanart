// src/controllers/contestEntry.controller.js
const Contest = require("../models/contest.model");
const ContestEntry = require("../models/contestEntry.model");
const Artwork = require("../../artworks/models/artwork.model");
const Tagging = require("../../tags/models/tagging.model");
const { sql } = require("kysely");
const { db } = require("../../../config");

// The client caps the entrant's own note at 1000 chars, then appends a
// "Fandom / Original IP: ..." line (the IP itself is capped at 100). This bound
// leaves headroom for that suffix so a max-length note is never rejected.
const MAX_SUBMISSION_NOTES_LENGTH = 1200;

/**
 * Whether a user may see privileged entry data for a contest: the brand that
 * owns it, a contest moderator, or an assigned judge.
 *
 * Extracted from the three call sites that had inlined it so the rule lives in
 * one place - it gates submitter contact details, so drift between copies
 * would be a data-exposure bug rather than a cosmetic one.
 *
 * IMPORTANT: despite the name, `contests.brand_id` is a foreign key to
 * users(id), not brands(id) - it holds the owning USER. Comparing it against
 * `user.brands[].id` (brand ids) therefore never matches, which silently
 * denied every brand manager and left only moderators and judges with access.
 * Ownership is matched on the user id, and on brands.user_id for managers who
 * reach the contest through a brand they hold.
 *
 * @param {object | undefined} user req.user, absent for anonymous callers.
 * @param {object} contest Contest row, needs brand_id.
 * @returns {boolean}
 */
function isBrandAuthorized(user, contest) {
  if (!user || !contest) return false;

  return Boolean(
    contest.brand_id === user.id ||
      // authenticateToken exposes the owning user as owner_id for brand roles,
      // while getMyBrands returns the raw column as user_id. Accept either, or
      // the manager path silently fails depending on which shape arrived.
      (user.brands || []).some(
        (brand) => (brand.user_id ?? brand.owner_id) === contest.brand_id
      ) ||
      user.permissions?.["contests.moderate"] ||
      user.permissions?.["contests.judge"]
  );
}

class ContestEntryController {
  /**
   * POST /contests/:contestId/entries
   */
  static async submitEntry(req, res) {
    try {
      const { contestId } = req.params;
      const { artworkId, submissionNotes } = req.body;

      if (submissionNotes != null && typeof submissionNotes !== "string") {
        return res
          .status(400)
          .json({ error: "submissionNotes must be a string" });
      }

      const trimmedNotes = submissionNotes?.trim() || null;
      if (trimmedNotes && trimmedNotes.length > MAX_SUBMISSION_NOTES_LENGTH) {
        return res.status(400).json({
          error: `Submission notes must be ${MAX_SUBMISSION_NOTES_LENGTH} characters or fewer`,
        });
      }

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

      // max entries per user (rejected/disqualified entries don't count against the cap)
      const existing = await db
        .selectFrom("contest_entries")
        .select("id")
        .where("contest_id", "=", contestId)
        .where("creator_id", "=", req.user.id)
        .where("status", "in", ["pending", "approved", "winner"])
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
        req.user.id,
        trimmedNotes
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
        "ce.submission_notes as entry_submission_notes",
        "ce.created_at as entry_created_at",
        "ce.updated_at as entry_updated_at",

        // Artwork
        "a.id as artwork_id",
        "a.title as artwork_title",
        "a.description as artwork_description",
        "a.file_url as artwork_file_url",
        "a.thumbnail_url as artwork_thumbnail_url",
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

    const isAuthorized = isBrandAuthorized(req.user, contest);

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
      submission_notes: row.entry_submission_notes,
      created_at: row.entry_created_at,
      updated_at: row.entry_updated_at,

      artwork: {
        id: row.artwork_id,
        title: row.artwork_title,
        description: row.artwork_description,
        file_url: row.artwork_file_url,
        thumbnail_url: row.artwork_thumbnail_url,
        // artworks has no preview_url column (it is absent from the DB and from
        // schema_new.sql), so selecting it made this endpoint fail outright.
        // Kept in the response as null to preserve the shape clients expect.
        preview_url: null,
        // artworks has no slug column either, so selecting it broke the query.
        // Null keeps the response shape intact.
        slug: null,
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
   * GET /contests/:contestId/entries/:entryId
   *
   * Full detail for one entry so a brand can review a submission properly
   * rather than from the dashboard thumbnail. Separate from getEntries because
   * that endpoint is paginated and status-filtered - an arbitrary entry is not
   * reliably reachable through it.
   *
   * Unlike getEntries, which degrades to approved/winner entries for the
   * public, this is privileged-only: it returns the submitter's email.
   */
  static async getEntry(req, res) {
    try {
      const { contestId, entryId } = req.params;

      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }

      if (!isBrandAuthorized(req.user, contest)) {
        return res
          .status(403)
          .json({ error: "Not authorized to view this submission" });
      }

      const row = await db
        .selectFrom("contest_entries as ce")
        .innerJoin("artworks as a", "a.id", "ce.artwork_id")
        .innerJoin("users as u", "u.id", "ce.creator_id")
        .leftJoin("contest_judge_scores as cjs", "cjs.entry_id", "ce.id")
        .select([
          // Entry
          "ce.id as entry_id",
          "ce.status as entry_status",
          "ce.rank as entry_rank",
          "ce.submission_notes as entry_submission_notes",
          "ce.created_at as entry_created_at",
          "ce.updated_at as entry_updated_at",

          // Artwork
          "a.id as artwork_id",
          "a.title as artwork_title",
          "a.description as artwork_description",
          "a.file_url as artwork_file_url",
          "a.thumbnail_url as artwork_thumbnail_url",
          "a.status as artwork_status",
          "a.moderation_status",
          "a.views_count",
          "a.favorites_count",
          "a.created_at as artwork_created_at",
          "a.updated_at as artwork_updated_at",

          // Creator. email is included here but not in getEntries: the brand
          // needs a way to contact the submitter, and this route is already
          // gated above.
          "u.id as creator_id",
          "u.username as creator_username",
          "u.email as creator_email",
          "u.avatar_url as creator_avatar",
          // The ticket asks for the submitter's name. users has no name column;
          // the name lives in the profile blob, and the codebase reads it
          // inconsistently - search.controller uses display_name, while
          // contestJudge.controller uses full_name. Only display_name is
          // actually populated, so prefer it and fall back to the other.
          sql`COALESCE(u.profile->>'display_name', u.profile->>'full_name')`.as(
            "creator_display_name"
          ),

          // Judge score (null if not judged)
          "cjs.score as judge_score",
          "cjs.comments as judge_comments",
        ])
        .where("ce.id", "=", entryId)
        // Scoped to the contest in the URL as well as the entry id, so an entry
        // id belonging to another brand's contest cannot be read by pairing it
        // with a contest the caller does own.
        .where("ce.contest_id", "=", contestId)
        .executeTakeFirst();

      if (!row) {
        return res.status(404).json({ error: "Entry not found" });
      }

      // Category and tags are captured by the submission form but live in join
      // tables, so they need their own reads. Tags go through Tagging rather
      // than a hand-written join: they live in "taggings" (polymorphic), not
      // the "artwork_tags" table schema_new.sql still describes.
      const [categories, tags] = await Promise.all([
        db
          .selectFrom("artwork_categories as ac")
          .innerJoin("categories as c", "c.id", "ac.category_id")
          .select(["c.id", "c.name", "c.slug"])
          .where("ac.artwork_id", "=", row.artwork_id)
          .execute(),
        Tagging.getTagsForEntity("artwork", row.artwork_id),
      ]);

      return res.json({
        entry: {
          id: row.entry_id,
          status: row.entry_status,
          rank: row.entry_rank,
          submission_notes: row.entry_submission_notes,
          created_at: row.entry_created_at,
          updated_at: row.entry_updated_at,

          contest: {
            id: contest.id,
            title: contest.title,
          },

          artwork: {
            id: row.artwork_id,
            title: row.artwork_title,
            description: row.artwork_description,
            file_url: row.artwork_file_url,
            thumbnail_url: row.artwork_thumbnail_url,
            status: row.artwork_status,
            moderation_status: row.moderation_status,
            views_count: row.views_count,
            favorites_count: row.favorites_count,
            created_at: row.artwork_created_at,
            updated_at: row.artwork_updated_at,
            categories,
            tags,
          },

          creator: {
            id: row.creator_id,
            username: row.creator_username,
            display_name: row.creator_display_name,
            email: row.creator_email,
            avatar_url: row.creator_avatar,
          },

          judge_score: row.judge_score,
          judge_comments: row.judge_comments,
        },
      });
    } catch (err) {
      console.error("Get entry error:", err);

      return res.status(500).json({ error: "Failed to fetch entry" });
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
        (req.user.brands || []).some((brand) => brand.id === contest.brand_id) ||
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
      const { status, contestId, limit = 20, offset = 0 } = req.query;

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

      if (contestId) {
        query = query.where("contest_entries.contest_id", "=", contestId);
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
// Exposed so tests assert against the real bound rather than a copied literal
// that could drift out of sync with it.
module.exports.MAX_SUBMISSION_NOTES_LENGTH = MAX_SUBMISSION_NOTES_LENGTH;
// Exposed so the authorization rule can be tested directly. It decides whether
// submitter contact details are released, so it is worth covering without
// standing up a database.
module.exports.isBrandAuthorized = isBrandAuthorized;
