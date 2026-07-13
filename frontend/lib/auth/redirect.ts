/**
 * Auth redirect helpers.
 *
 * WHY: the login page and the contest submit CTA both need to (a) build a
 * "return here after login" URL and (b) resolve an incoming `?from=` value
 * back to a safe destination. Centralising this keeps the open-redirect guard
 * in one place, so it can't be fixed here and forgotten there.
 */

/** Default landing spot when there is no (safe) return path. */
export const DEFAULT_POST_LOGIN = '/';

/**
 * True only for same-origin, relative paths such as "/foo" or "/foo?x=1".
 *
 * Rejects protocol-relative URLs ("//evil.com"), absolute URLs
 * ("https://evil.com"), backslash tricks ("/\\evil.com") and anything that
 * isn't a path — this is the open-redirect guard, so it fails closed.
 */
export function isSafeRelativePath(path: string | null | undefined): path is string {
  if (!path) return false;
  // Must start with a single "/" not followed by another "/" or a "\".
  return /^\/(?![/\\])/.test(path);
}

/**
 * Build a login URL that returns the user to `target` after they authenticate.
 * Falls back to a bare login path if `target` is not a safe relative path.
 */
export function loginWithReturnTo(target: string | null | undefined, loginPath = '/login'): string {
  return isSafeRelativePath(target)
    ? `${loginPath}?from=${encodeURIComponent(target)}`
    : loginPath;
}

/**
 * Resolve an incoming `?from=` value to a safe post-login destination,
 * falling back to `fallback` (home by default) when it isn't trustworthy.
 */
export function resolvePostLoginRedirect(
  from: string | null | undefined,
  fallback: string = DEFAULT_POST_LOGIN,
): string {
  return isSafeRelativePath(from) ? from : fallback;
}
