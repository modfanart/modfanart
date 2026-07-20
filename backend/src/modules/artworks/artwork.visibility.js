// src/modules/artworks/artwork.visibility.js

/**
 * Artwork visibility rules for public, unauthenticated surfaces
 * (gallery / storefront / discovery feeds).
 *
 * Artwork is only public once it is both published by its creator AND
 * approved by moderation. Uploads start as status='draft' /
 * moderation_status='pending', so without this filter every unreviewed
 * submission is served to the public feed.
 *
 * Kept in its own module (rather than inline in the controller) for two
 * reasons: the list query and the count query must apply an identical
 * filter or pagination totals disagree with the rows returned, and it
 * carries no db/config dependency so it can be unit tested without a
 * database connection.
 */

/**
 * Restrict a Kysely query on `artworks` to publicly visible rows.
 *
 * Column references are table-qualified so this is valid both in the list
 * query (which joins `users`) and in the standalone count query.
 *
 * Note: this deliberately does NOT filter `deleted_at`. Callers already
 * apply that, and soft-deletion is a separate concern from moderation.
 *
 * @template T
 * @param {T} query - Kysely select query builder rooted at `artworks`.
 * @returns {T} The query with public visibility predicates applied.
 */
function applyPublicArtworkFilter(query) {
  return query
    .where("artworks.status", "=", "published")
    .where("artworks.moderation_status", "=", "approved");
}

module.exports = { applyPublicArtworkFilter };
