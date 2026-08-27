// src/modules/artworks/artwork.visibility.js

/**
 * Artwork visibility rules for public, unauthenticated surfaces
 * (gallery / storefront / discovery feeds).
 *
 * Artwork is public only when all three hold:
 *
 *   1. status = 'published'            - the creator released it
 *   2. moderation_status = 'approved'  - set alongside (1) by Artwork.publish
 *   3. a contest entry for it is status='winner' AND
 *      licensing_status='finalized'    - selected by the brand, and its
 *                                        licensing agreement completed
 *
 * (1) and (2) alone are not a review: Artwork.publish writes both columns on
 * the creator's own say-so, so a contest submission could reach the gallery
 * the moment its author pressed Publish, before any brand had looked at it.
 * (3) is the real gate, and since the licensing check-in (2026-08-27) brand
 * approval alone no longer publishes: an entry must be a selected winner
 * whose licensing the brand explicitly finalized in the Licensing tab.
 * Selection without finalization keeps the work private - winning a contest
 * and being cleared for commercial use are separate facts.
 *
 * Kept in its own module (rather than inline in the controller) for two
 * reasons: the list query and the count query must apply an identical
 * filter or pagination totals disagree with the rows returned, and it
 * carries no db/config dependency so it can be unit tested without a
 * database connection.
 */

/** The one entry state that makes an artwork public: a selected winner... */
const GALLERY_ENTRY_STATUS = "winner";
/** ...whose licensing agreement the brand has explicitly finalized. */
const GALLERY_LICENSING_STATUS = "finalized";

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
          .where("contest_entries.status", "=", GALLERY_ENTRY_STATUS)
          .where("contest_entries.licensing_status", "=", GALLERY_LICENSING_STATUS)
      )
    );
}

module.exports = {
  applyPublicArtworkFilter,
  GALLERY_ENTRY_STATUS,
  GALLERY_LICENSING_STATUS,
};
