// src/modules/artworks/artwork.visibility.js

/**
 * Artwork visibility rules for public, unauthenticated surfaces
 * (gallery / storefront / discovery feeds).
 *
 * Artwork is public only when all three hold:
 *
 *   1. status = 'published'            - the creator released it
 *   2. moderation_status = 'approved'  - set alongside (1) by Artwork.publish
 *   3. a contest entry for it is 'approved' or 'winner' - a brand reviewed it
 *
 * (1) and (2) alone are not a review: Artwork.publish writes both columns on
 * the creator's own say-so, so a contest submission could reach the gallery
 * the moment its author pressed Publish, before any brand had looked at it.
 * (3) is the actual moderation event. 'approved' is what the brand sets in
 * the Monitor page; 'winner' is the licensing step and is kept so selecting
 * winners never hides work that was already approved.
 *
 * Kept in its own module (rather than inline in the controller) for two
 * reasons: the list query and the count query must apply an identical
 * filter or pagination totals disagree with the rows returned, and it
 * carries no db/config dependency so it can be unit tested without a
 * database connection.
 */

/** Contest entry statuses that mean a brand has reviewed and kept the work. */
const GALLERY_ENTRY_STATUSES = ["approved", "winner"];

/**
 * Restrict a Kysely query on `artworks` to publicly visible rows.
 *
 * Column references are table-qualified so this is valid both in the list
 * query (which joins `users`) and in the standalone count query.
 *
 * Note: this deliberately does NOT filter `deleted_at`. Callers already
 * apply that, and soft-deletion is a separate concern from moderation.
 * `contest_entries` has no soft-delete column (entries are hard-deleted), so
 * the EXISTS needs no such predicate either.
 *
 * @template T
 * @param {T} query - Kysely select query builder rooted at `artworks`.
 * @returns {T} The query with public visibility predicates applied.
 */
function applyPublicArtworkFilter(query) {
  return query
    .where("artworks.status", "=", "published")
    .where("artworks.moderation_status", "=", "approved")
    .where(({ exists, selectFrom }) =>
      exists(
        selectFrom("contest_entries")
          .select("contest_entries.id")
          .whereRef("contest_entries.artwork_id", "=", "artworks.id")
          .where("contest_entries.status", "in", GALLERY_ENTRY_STATUSES)
      )
    );
}

module.exports = { applyPublicArtworkFilter, GALLERY_ENTRY_STATUSES };
