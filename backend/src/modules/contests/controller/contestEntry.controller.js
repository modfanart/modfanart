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
 * `contests.brand_id` holds a brands(id), so ownership is a direct match
 * against `user.brands[].id`. This is the same comparison every other contest
 * controller makes (contest, contestJudge and contestJudgeScore all do it), and
 * matching on `brands[].user_id` instead silently denied every brand manager:
 * getEntries then degraded to approved/winner rows, so pending submissions
 * vanished from the dashboard rather than raising an error.
 *
 * Note `frontend/lib/db/schema_new.sql` still declares this column as
 * REFERENCES users(id). That file predates the live schema and is what led the
 * check astray in the first place; do not take it as the source of truth.
 *
 * @param {object | undefined} user req.user, absent for anonymous callers.
 * @param {object} contest Contest row, needs brand_id.
 * @returns {boolean}
 */
function isBrandAuthorized(user, contest) {
  if (!user || !contest) return false;

  return Boolean(
    (user.brands || []).some((brand) => brand.id === contest.brand_id) ||
      user.permissions?.["contests.moderate"] ||
      user.permissions?.["contests.judge"]
  );
}

/**
 * Publish the artwork behind a newly approved entry.
 *
 * The public gallery keys on a brand-approved entry (see
 * artworks/artwork.visibility.js) AND on the artwork being published. The
 * contest submission form creates artwork as a draft and never prompts the
 * artist to publish, so without this step brand approval alone would leave
 * the work invisible. Approval is the review event, so it is what releases
 * the work; Artwork.publish is reused so the row ends up exactly as it would
 * had the creator published it.
 *
 * Only drafts are touched: already-published work is left as is, and
 * archived or rejected artwork is never resurrected by an approval.
 *
 * @param {string} artworkId
 */
async function publishArtworkForApprovedEntry(artworkId) {
  const artwork = await Artwork.findById(artworkId);
  if (artwork && artwork.status === "draft") {
    await Artwork.publish(artwork.id);
  }
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
    const { status, search } = req.query;

    // Clamp pagination at the boundary. Default page size 20; hard cap 100 so a
    // caller can never ask the DB for an unbounded result set.
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);

    // Free-text search over artwork title / creator username. Kysely
    // parameterises the value, but bare %/_ would still act as ILIKE wildcards,
    // so escape them (and cap the length) before building the term.
    const rawSearch =
      typeof search === "string" ? search.trim().slice(0, 100) : "";
    const searchTerm = rawSearch
      ? `%${rawSearch.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`
      : "";

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({
        error: "Contest not found",
      });
    }

    const isAuthorized = isBrandAuthorized(req.user, contest);

    // Contest + visibility + search filters, shared by the count and the rows
    // queries so `total` always matches what the list can actually load.
    const applyScope = (qb) => {
      qb = qb.where("ce.contest_id", "=", contestId);

      if (!isAuthorized) {
        qb = qb.where("ce.status", "in", ["approved", "winner"]);
      } else if (status) {
        qb = qb.where("ce.status", "=", status);
      }

      if (searchTerm) {
        qb = qb.where((eb) =>
          eb.or([
            eb("a.title", "ilike", searchTerm),
            eb("u.username", "ilike", searchTerm),
          ])
        );
      }

      return qb;
    };

    // Base joins. contest_judge_scores is intentionally NOT joined here: it has
    // PRIMARY KEY (entry_id, judge_id), so joining multiplies an entry into one
    // row per judge, which would corrupt both the total and limit/offset paging.
    const baseQuery = () =>
      applyScope(
        db
          .selectFrom("contest_entries as ce")
          .innerJoin("artworks as a", "a.id", "ce.artwork_id")
          .innerJoin("users as u", "u.id", "ce.creator_id")
      );

    const countRow = await baseQuery()
      .select((eb) => eb.fn.countAll().as("total"))
      .executeTakeFirst();
    const total = Number(countRow?.total ?? 0);

    const rows = await baseQuery()
      .select((eb) => [
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

        // Judge score, collapsed to one value per entry via correlated
        // subqueries so the row set stays 1:1 with entries. For a single-judge
        // contest these equal that judge's score/comments; with several judges
        // we surface the top score deterministically.
        eb
          .selectFrom("contest_judge_scores as cjs")
          .whereRef("cjs.entry_id", "=", "ce.id")
          .select((e2) => e2.fn.max("cjs.score").as("v"))
          .as("judge_score"),
        eb
          .selectFrom("contest_judge_scores as cjs")
          .whereRef("cjs.entry_id", "=", "ce.id")
          .orderBy("cjs.score", "desc")
          .select("cjs.comments")
          .limit(1)
          .as("judge_comments"),
      ])
      // ce.id is a stable tiebreaker so entries sharing a created_at cannot
      // straddle a page boundary (which would drop or duplicate a row).
      .orderBy("ce.created_at", "desc")
      .orderBy("ce.id", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    // Category and tags live in join tables, so they cannot come from the
    // select above. Both are fetched for the whole page in one query each and
    // grouped in memory: two extra round trips regardless of page size, rather
    // than the two-per-entry an N+1 would cost. Tags are polymorphic and live
    // in "taggings", not the "artwork_tags" table schema_new.sql describes.
    const artworkIds = rows.map((row) => row.artwork_id);

    const [categoryRows, tagRows] = artworkIds.length
      ? await Promise.all([
          db
            .selectFrom("artwork_categories as ac")
            .innerJoin("categories as c", "c.id", "ac.category_id")
            .select(["ac.artwork_id", "c.id", "c.name", "c.slug"])
            .where("ac.artwork_id", "in", artworkIds)
            .execute(),
          db
            .selectFrom("taggings")
            .innerJoin("tags", "tags.id", "taggings.tag_id")
            .select([
              "taggings.taggable_id as artwork_id",
              "tags.id",
              "tags.name",
              "tags.slug",
            ])
            .where("taggings.taggable_type", "=", "artwork")
            .where("taggings.taggable_id", "in", artworkIds)
            .execute(),
        ])
      : [[], []];

    const groupByArtwork = (list) =>
      list.reduce((acc, { artwork_id, ...rest }) => {
        (acc[artwork_id] ||= []).push(rest);
        return acc;
      }, {});

    const categoriesByArtwork = groupByArtwork(categoryRows);
    const tagsByArtwork = groupByArtwork(tagRows);

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
        categories: categoriesByArtwork[row.artwork_id] || [],
        tags: tagsByArtwork[row.artwork_id] || [],
      },

      creator: {
        id: row.creator_id,
        username: row.creator_username,
        avatar_url: row.creator_avatar,
      },

      judge_score: row.judge_score,
      judge_comments: row.judge_comments,
    }));

    return res.json({ entries, total });
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

      if (status === "approved") {
        await publishArtworkForApprovedEntry(entry.artwork_id);
      }

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
