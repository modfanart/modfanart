/**
 * Username rules, shown up front instead of only after a failed submit (AUTH-10).
 * Mirrors USERNAME_PATTERN in backend/src/modules/auth/controller/auth.controller.js.
 */

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_PATTERN = /^[a-z0-9_]+$/i;
export const USERNAME_HINT = `${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} characters: letters, numbers and underscores. This is your public profile link.`;

/** The form's error for a username, or null when it is acceptable. */
export function usernameError(username) {
  const value = typeof username === 'string' ? username.trim() : '';
  if (value.length < USERNAME_MIN_LENGTH) {
    return `Username must be at least ${USERNAME_MIN_LENGTH} characters.`;
  }
  if (value.length > USERNAME_MAX_LENGTH) {
    return `Username must be at most ${USERNAME_MAX_LENGTH} characters.`;
  }
  if (!USERNAME_PATTERN.test(value)) {
    return 'Only letters, numbers and underscores — no spaces or symbols.';
  }
  return null;
}
