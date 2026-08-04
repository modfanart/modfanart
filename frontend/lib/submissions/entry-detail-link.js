// Link construction for the brand-manager submission detail view. Extracted
// from pending-entries-review.tsx so the URL shape and the brand-resolution
// rule are unit-testable: the repo's jest setup does not currently run (no
// jest-environment-jsdom), so component-level assertions would not execute.

/**
 * Path to the full detail view for one contest entry.
 *
 * @param {string} brandSlug Slug of the brand that owns the contest.
 * @param {string} contestId
 * @param {string} entryId
 * @returns {string}
 */
export function entryDetailPath(brandSlug, contestId, entryId) {
  return `/brand-manager/${brandSlug}/opportunities/${contestId}/entries/${entryId}`;
}

/**
 * Pair each contest this user owns with the slug of the brand to file it under.
 *
 * `contests.brand_id` holds a brands(id), so the owning brand is a direct
 * lookup in the viewer's brands. Matching on `brands[].user_id` instead left
 * this permanently empty, because `GET /users/me/brands` returns neither
 * `user_id` nor `owner_id` - only id, name, slug and presentation fields.
 *
 * Note `frontend/lib/db/schema_new.sql` still declares the column as
 * REFERENCES users(id). That file predates the live schema and is what led this
 * resolver astray; do not take it as the source of truth.
 *
 * A manager can hold more than one brand, so the owning brand is looked up per
 * contest rather than defaulting to brands[0] - getting this wrong would build
 * links under the wrong brand. Contests with no resolvable brand slug are
 * dropped, because there is no valid URL for them.
 *
 * Both arguments are optional because they come straight from RTK Query data
 * and auth state, either of which is undefined before the first response.
 *
 * @param {Array<{ id: string, brand_id: string, title: string }> | undefined | null} contests
 * @param {Array<{ id: string, slug?: string | null }> | undefined | null} brands
 * @returns {Array<{ contest: { id: string, brand_id: string, title: string }, brandSlug: string }>}
 */
export function contestsWithBrandSlug(contests, brands) {
  const owned = brands || [];

  return (contests || []).flatMap((contest) => {
    const brandSlug = owned.find((b) => b.id === contest.brand_id)?.slug;

    return brandSlug ? [{ contest, brandSlug }] : [];
  });
}
