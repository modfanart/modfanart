/**
 * Password rules for every place a password is chosen: signup, settings → change password.
 *
 * WHY: the only rule used to be "8+ characters", so `NoDigits!!!!!` and `password`
 * were accepted (AUTH-05). Kept in one plain-JS module so the signup form, the settings
 * form and the live checklist under the field cannot drift apart, and so it is testable
 * with node:test.
 *
 * Client-side only: Firebase creates the account, so the matching server-side rule is
 * the Firebase project's password policy (Authentication → Settings → Password policy).
 */

export const PASSWORD_MIN_LENGTH = 8;

/** @type {{ id: string, label: string, test: (password: string) => boolean }[]} */
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  { id: 'upper', label: 'An uppercase letter', test: (password) => /[A-Z]/.test(password) },
  { id: 'lower', label: 'A lowercase letter', test: (password) => /[a-z]/.test(password) },
  { id: 'number', label: 'A number', test: (password) => /[0-9]/.test(password) },
];

/** Rules the password does not satisfy yet, in display order. */
export function unmetPasswordRules(password) {
  const value = typeof password === 'string' ? password : '';
  return PASSWORD_RULES.filter((rule) => !rule.test(value));
}

/** A single sentence describing what is missing, or null when the password is acceptable. */
export function passwordPolicyError(password) {
  const unmet = unmetPasswordRules(password);
  if (unmet.length === 0) return null;
  return `Password needs: ${unmet.map((rule) => rule.label.toLowerCase()).join(', ')}.`;
}
