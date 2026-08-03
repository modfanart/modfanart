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
 * Pair each of the user's contests with the slug of the brand that owns it.
 *
 * A manager can hold more than one brand, so the owning brand is looked up per
 * contest rather than defaulting to brands[0] - getting this wrong would build
 * links under the wrong brand. Contests whose brand is unknown or has no slug
 * are dropped, because there is no valid URL for them.
 *
 * Both arguments are optional because they come straight from RTK Query data
 * and auth state, either of which is undefined before the first response.
 *
 * @param {Array<{ id: string, brand_id: string, title: string }> | undefined | null} contests
 * @param {Array<{ id: string, slug?: string | null }> | undefined | null} brands
 * @returns {Array<{ contest: { id: string, brand_id: string, title: string }, brandSlug: string }>}
 */
export function contestsWithBrandSlug(contests, brands) {
  return (contests || []).flatMap((contest) => {
    const brandSlug = (brands || []).find((b) => b.id === contest.brand_id)?.slug;

    return brandSlug ? [{ contest, brandSlug }] : [];
  });
}
