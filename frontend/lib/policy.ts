// Must match CURRENT_TERMS_VERSION on the API (backend/src/common/policy.js,
// overridable there with the TERMS_VERSION env var). The API also returns
// the live value as `current_terms_version` on /users/me.
export const TERMS_VERSION = '2026-11';

// AUTH-05 / GA-06: at least 8 characters with upper- and lower-case letters,
// a number and a symbol ("NoDigits!!!!!" used to be accepted).
export const PASSWORD_RULES: { test: (p: string) => boolean; label: string }[] = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p), label: 'Upper- and lower-case letters' },
  { test: (p) => /\d/.test(p), label: 'At least one number' },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'At least one symbol' },
];

export function passwordProblems(p: string): string[] {
  return PASSWORD_RULES.filter((r) => !r.test(p)).map((r) => r.label);
}
