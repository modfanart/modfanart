// src/common/policy.js
//
// Account-standing rules shared by the API (GA-05, GA-22).

// Bump when the Terms of Service / Privacy Policy change materially. Users
// who accepted an older version are asked to accept again before they can
// enter contests, vote, sell or buy.
const CURRENT_TERMS_VERSION = process.env.TERMS_VERSION || '2026-11';

/**
 * Why this user may not take part in money- or contest-related actions yet,
 * or null when they can. `code` is stable for the frontend to switch on.
 */
function standingProblem(user) {
  if (!user) return { status: 401, code: 'auth_required', error: 'Sign in to continue' };
  if (!user.email_verified) {
    return {
      status: 403,
      code: 'email_unverified',
      error: 'Verify your email address to continue. Check your inbox or resend the link.',
    };
  }
  if (!user.age_confirmed_at || user.accepted_terms_version !== CURRENT_TERMS_VERSION) {
    return {
      status: 428,
      code: 'terms_required',
      error: 'Please review and accept the current Terms of Service to continue.',
      terms_version: CURRENT_TERMS_VERSION,
    };
  }
  return null;
}

/** Express middleware. Use after authenticateToken. */
function requireGoodStanding(req, res, next) {
  const problem = standingProblem(req.user);
  if (problem) {
    const { status, ...body } = problem;
    return res.status(status).json(body);
  }
  next();
}

module.exports = { CURRENT_TERMS_VERSION, standingProblem, requireGoodStanding };
