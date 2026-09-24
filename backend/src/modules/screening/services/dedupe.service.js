// Content-hash dedupe.
//
// The cheapest possible screening stage: if these exact bytes have been rejected before, the three
// paid API calls will reach the same verdict, and the more useful signal is that someone is
// resubmitting rejected work. That is a human's call, so a duplicate-of-rejected match short
// circuits the pipeline straight to manual review.
//
// Only exact-byte matches. A one-pixel edit defeats it, which is fine — this is a cost and
// evasion-pattern control, not a perceptual similarity system.
const crypto = require("crypto");

const REJECTED = "rejected";

/**
 * SHA-256 of the uploaded bytes.
 *
 * @param {Buffer} buffer
 * @returns {string} lowercase hex digest
 */
function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Looks for an earlier artwork with the same content hash whose moderation ended in rejection.
 *
 * Excludes the artwork being screened so a rescreen does not match itself, and prefers the most
 * recent match so the reviewer sees the freshest precedent.
 *
 * @param {import('kysely').Kysely<any>} db
 * @param {{sha256: string, excludeArtworkId?: string|null}} params
 * @returns {Promise<{id: string, title: string, creator_id: string, moderation_status: string}|null>}
 */
async function findRejectedDuplicate(db, { sha256, excludeArtworkId = null }) {
  if (!sha256) return null;

  let query = db
    .selectFrom("artworks")
    .select(["id", "title", "creator_id", "moderation_status", "created_at"])
    .where("file_sha256", "=", sha256)
    .where("moderation_status", "=", REJECTED)
    .where("deleted_at", "is", null);

  if (excludeArtworkId) {
    query = query.where("id", "!=", excludeArtworkId);
  }

  const match = await query.orderBy("created_at", "desc").limit(1).executeTakeFirst();

  return match ?? null;
}

/**
 * Records the content hash against an artwork.
 *
 * Written after the row exists rather than inside `Artwork.create` so hashing never blocks the
 * upload response, and a hashing failure costs a dedupe signal rather than the whole submission.
 *
 * @param {import('kysely').Kysely<any>} db
 * @param {string} artworkId
 * @param {string} sha256
 */
async function recordHash(db, artworkId, sha256) {
  if (!sha256) return null;

  return db
    .updateTable("artworks")
    .set({ file_sha256: sha256 })
    .where("id", "=", artworkId)
    .executeTakeFirst();
}

module.exports = { findRejectedDuplicate, hashBuffer, recordHash };
