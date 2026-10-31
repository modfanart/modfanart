/**
 * Human labels for role names stored in the database.
 *
 * WHY: the header showed the raw enum ("DEFAULT_USER") under a fan's name (AUTH-02).
 * Role names are data (roles table), so unknown ones still render readably instead of
 * as SHOUTY_SNAKE_CASE.
 */

const ROLE_LABELS = {
  default_user: 'Fan',
  plain_user: 'Fan',
  fan: 'Fan',
  artist: 'Artist',
  brand_manager: 'Brand',
  brand_owner: 'Brand',
  brand_editor: 'Brand',
  brand_member: 'Brand',
  judge: 'Judge',
  admin: 'Admin',
  superadmin: 'Admin',
  super_admin: 'Admin',
  developer: 'Developer',
  hr: 'HR',
};

/** "DEFAULT_USER" → "Fan", "BRAND_MANAGER" → "Brand", "SOME_NEW_ROLE" → "Some New Role". */
export function roleLabel(roleName) {
  if (!roleName || typeof roleName !== 'string') return 'Member';

  const key = roleName.trim().toLowerCase();
  if (ROLE_LABELS[key]) return ROLE_LABELS[key];

  return key
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
