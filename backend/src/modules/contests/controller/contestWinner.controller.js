// src/controllers/contestWinner.controller.js
//
// Winner selection and the public results link.
//
// Selection is the missing first step of a chain the codebase already has:
// distributePrizes pays entries WHERE status='winner' AND rank IS NOT NULL,
// matching contest.prizes[].rank, and announceWinners gates it - but nothing
// ever wrote those rows. selectWinners writes them.
//
// The share link is deliberately token-keyed, not contest-id-keyed. Standings
// and entry lists are authenticated everywhere else in this module; a public
// route addressable by contest id would quietly undo that. A token only exists
// once the owning brand asks for one.

const crypto = require("crypto");
const { db } = require("../../../config");
const { sql } = require("kysely");

/** Brand that owns the contest, or staff with contests.manage. */
function isAuthorized(user, contest) {
  return (
    (user?.brands || []).some((brand) => brand.id === contest.brand_id) ||
    Boolean(user?.permissions?.["contests.manage"])
  );
}

class ContestWinnerController {
  /**
   * PUT /contest/:contestId/winners
   *
   * Body: { entry_ids: string[] } - ordered, first is rank 1.
   *
   * Replaces the contest's winner selection wholesale: listed entries become
   * status='winner' with rank by position, previously selected entries not in
   * the list return to 'approved' with rank cleared. Sending [] clears the
   * selection entirely, so there is no separate "undo" endpoint to get wrong.
   */
  static async selectWinners(req, res) {
    try {
      const { contestId } = req.params;
      const { entry_ids: entryIds } = req.body || {};

      if (!Array.isArray(entryIds) || entryIds.some((id) => typeof id !== "string")) {
        return res.status(400).json({ error: "entry_ids must be an array of entry ids" });
      }
      if (new Set(entryIds).size !== entryIds.length) {
        return res.status(400).json({ error: "entry_ids contains duplicates" });
      }

      const contest = await db
        .selectFrom("contests")
        .select(["id", "brand_id"])
        .where("id", "=", contestId)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

      if (!contest) return res.status(404).json({ error: "Contest not found" });
      if (!isAuthorized(req.user, contest)) {
        return res.status(403).json({ error: "Not authorized" });
      }

      if (entryIds.length > 0) {
        const entries = await db
          .selectFrom("contest_entries")
          .select(["id", "status"])
          .where("contest_id", "=", contestId)
          .where("id", "in", entryIds)
          .execute();

        const byId = new Map(entries.map((e) => [e.id, e]));
        for (const id of entryIds) {
          const entry = byId.get(id);
          if (!entry) {
            return res
              .status(400)
              .json({ error: `Entry ${id} does not belong to this contest` });
          }
          // Only approved entries (or already-selected winners being kept /
          // reordered) can win. Pending and rejected entries were never part
          // of the judged field, and a selection containing one is a caller
          // bug worth refusing loudly rather than absorbing.
          if (!["approved", "winner"].includes(entry.status)) {
            return res
              .status(400)
              .json({ error: `Entry ${id} is ${entry.status}, not approved` });
          }
        }
      }

      // Both writes or neither: a crash between them would leave two entries
      // holding the same rank, which distributePrizes would then pay twice.
      await db.transaction().execute(async (trx) => {
        let reset = trx
          .updateTable("contest_entries")
          .set({ status: "approved", rank: null, updated_at: sql`NOW()` })
          .where("contest_id", "=", contestId)
          .where("status", "=", "winner");
        if (entryIds.length > 0) reset = reset.where("id", "not in", entryIds);
        await reset.execute();

        for (let i = 0; i < entryIds.length; i++) {
          await trx
            .updateTable("contest_entries")
            .set({ status: "winner", rank: i + 1, updated_at: sql`NOW()` })
            .where("id", "=", entryIds[i])
            .execute();
        }
      });

      const winners = await db
        .selectFrom("contest_entries")
        .select(["id", "rank", "status"])
        .where("contest_id", "=", contestId)
        .where("status", "=", "winner")
        .orderBy("rank", "asc")
        .execute();

      return res.json({ winners });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to select winners" });
    }
  }

  /**
   * POST /contest/:contestId/results-share-link
   *
   * Get-or-create the contest's public results token and hand back the full
   * URL. Idempotent: asking twice returns the same link, so a brand can
   * re-copy it without invalidating what they already sent out.
   */
  static async getResultsShareLink(req, res) {
    try {
      const { contestId } = req.params;

      const contest = await db
        .selectFrom("contests")
        .select(["id", "brand_id", "results_share_token"])
        .where("id", "=", contestId)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

      if (!contest) return res.status(404).json({ error: "Contest not found" });
      if (!isAuthorized(req.user, contest)) {
        return res.status(403).json({ error: "Not authorized" });
      }

      let token = contest.results_share_token;
      if (!token) {
        // 24 random bytes -> 32 url-safe chars; unguessable, and the partial
        // unique index makes an (astronomically unlikely) collision a loud
        // insert error rather than two contests sharing a link.
        token = crypto.randomBytes(24).toString("base64url");
        await db
          .updateTable("contests")
          .set({ results_share_token: token, updated_at: sql`NOW()` })
          .where("id", "=", contestId)
          .execute();
      }

      // Same fallback-with-warning as judge invite emails: FRONTEND_URL is
      // not set on the deployed backend.
      const configured = process.env.FRONTEND_URL?.trim();
      const base = configured
        ? configured.replace(/\/+$/, "")
        : "https://www.modfanofficial.com";
      if (!configured) {
        console.warn(
          "[contests] FRONTEND_URL is not set; falling back to the production origin for the results share link"
        );
      }

      return res.json({ share_url: `${base}/results/${token}` });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create share link" });
    }
  }

  /**
   * GET /public/contest-results/:token - the ONLY unauthenticated read in the
   * contests module, mounted outside the authenticated router.
   *
   * Returns the selected winners and nothing about how they were chosen: no
   * judge scores, no judge identities, no non-winning entries. 404 for an
   * unknown token, and identically for a deleted contest, so the response
   * never confirms whether a guessed token was once valid.
   */
  static async getPublicResults(req, res) {
    try {
      const { token } = req.params;
      if (!token || token.length < 16) {
        return res.status(404).json({ error: "Results not found" });
      }

      const contest = await db
        .selectFrom("contests")
        .select(["id", "title", "hero_image"])
        .where("results_share_token", "=", token)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

      if (!contest) return res.status(404).json({ error: "Results not found" });

      const winners = await db
        .selectFrom("contest_entries as ce")
        .innerJoin("artworks as a", "a.id", "ce.artwork_id")
        .innerJoin("users as u", "u.id", "ce.creator_id")
        .select([
          "ce.id as entry_id",
          "ce.rank",
          // The artist's note to the brand. Published here deliberately: the
          // brand chose to expose it on the shared results (2026-08-21).
          "ce.submission_notes",
          "ce.artwork_id",
          "a.title as artwork_title",
          "a.description as artwork_description",
          "a.thumbnail_url as artwork_thumbnail",
          "a.file_url as artwork_file_url",
          "u.username as creator_username",
        ])
        .where("ce.contest_id", "=", contest.id)
        .where("ce.status", "=", "winner")
        .orderBy("ce.rank", "asc")
        .execute();

      return res.json({
        contest: { title: contest.title, hero_image: contest.hero_image },
        winners,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to load results" });
    }
  }
}

module.exports = ContestWinnerController;
