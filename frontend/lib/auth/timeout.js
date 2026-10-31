/**
 * Deadlines for auth network calls.
 *
 * WHY: a hung request left signup/login on "Creating Account…" / "Signing in…" forever,
 * with no error and no way to retry (AUTH-11). Neither fetch nor the awaited Firebase
 * promises time out on their own in every failure mode, so every auth step gets a deadline
 * and fails with a recognisable error the page can show.
 */

export const AUTH_TIMEOUT_MS = 20000;
export const AUTH_TIMEOUT_CODE = 'auth/timeout';

export function timeoutError(label = 'The request') {
  const error = new Error(`${label} took too long. Check your connection and try again.`);
  error.code = AUTH_TIMEOUT_CODE;
  return error;
}

/**
 * Rejects with an `auth/timeout` error if `promise` has not settled within `ms`.
 * The underlying work is not cancelled (Firebase offers no cancellation); the caller just
 * stops waiting for it.
 */
export function withTimeout(promise, ms = AUTH_TIMEOUT_MS, label) {
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(timeoutError(label)), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

/** fetch() that aborts after `ms` and reports it as an `auth/timeout` error. */
export async function fetchWithTimeout(url, init = {}, ms = AUTH_TIMEOUT_MS, label) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) throw timeoutError(label);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
