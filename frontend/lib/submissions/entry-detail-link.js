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
 * IMPORTANT: despite the name, `contests.brand_id` is a foreign key to
 * users(id), not brands(id) - it holds the owning USER. Matching it against
 * `brands[].id` never succeeds, which left the dashboard grid permanently
 * empty. Ownership is resolved through `brands.user_id`, falling back to the
 * viewer's own id for a contest they own directly.
 *
 * A manager can hold more than one brand, so the owning brand is looked up per
 * contest rather than defaulting to brands[0] - getting this wrong would build
 * links under the wrong brand. Contests with no resolvable brand slug are
 * dropped, because there is no valid URL for them.
 *
 * All arguments are optional because they come straight from RTK Query data
 * and auth state, either of which is undefined before the first response.
 *
 * @param {Array<{ id: string, brand_id: string, title: string }> | undefined | null} contests
 * @param {Array<{ id: string, slug?: string | null, user_id?: string }> | undefined | null} brands
 * @param {string | undefined | null} userId Viewer's user id.
 * @returns {Array<{ contest: { id: string, brand_id: string, title: string }, brandSlug: string }>}
 */
export function contestsWithBrandSlug(contests, brands, userId) {
  const owned = brands || [];

  return (contests || []).flatMap((contest) => {
    const byBrandOwner = owned.find((b) => b.user_id && b.user_id === contest.brand_id);

    // The contest is the viewer's own; any brand of theirs gives a valid URL.
    const byViewer = userId && contest.brand_id === userId ? owned[0] : undefined;

    const brandSlug = (byBrandOwner || byViewer)?.slug;

    return brandSlug ? [{ contest, brandSlug }] : [];
  });
}
