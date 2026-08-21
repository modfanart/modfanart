// The one place that decides whether the signed-in user gets a link into the
// judge area, and where that link points. Shared by the dashboard sidebar and
// the site-header account dropdown so the two surfaces cannot drift apart —
// they did once: the sidebar learned about per-contest judges while the
// dropdown stayed role-gated, leaving fan-role judges with working judging
// rights and no way to navigate to them.

/**
 * Href into the judge area for this user, or null when no link should show.
 *
 * Judging is granted per contest through contest_judges, never through the
 * account's role, so the decision keys on what the judge endpoints actually
 * returned for this user — not on role. Rules:
 *
 * - Pending invitations count as much as accepted contests: redeeming the
 *   emailed link does not set contest_judges.accepted, only the Accept button
 *   on the judge dashboard does. Keying off accepted contests alone would
 *   hide the link from exactly the people who have not found that button yet.
 * - The JUDGE role is excluded because its dashboard entry points at the same
 *   place already; a second link would be a duplicate.
 * - No username means no link: the judge area lives at /judge/[username] and
 *   username is nullable on the user record, so there is no valid URL to
 *   offer.
 *
 * The contest arrays are optional because they come straight from RTK Query
 * data, which is undefined before the first response.
 *
 * @param {{
 *   username?: string | null | undefined,
 *   roleName?: string | null | undefined,
 *   acceptedContests?: Array<{ id: string }> | null | undefined,
 *   pendingInvitations?: Array<{ id: string }> | null | undefined,
 * }} params
 * @returns {string | null}
 */
export function judgeAreaHref({
  username,
  roleName,
  acceptedContests,
  pendingInvitations,
}) {
  const judgeUsername = username?.trim().toLowerCase();
  if (!judgeUsername) return null;

  if (roleName?.toLowerCase() === 'judge') return null;

  const judgesAnything =
    (acceptedContests?.length ?? 0) > 0 || (pendingInvitations?.length ?? 0) > 0;

  return judgesAnything ? `/judge/${judgeUsername}` : null;
}
