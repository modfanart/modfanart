// Human-friendly labels for backend role enums (AUTH-02: the header showed
// the raw "DEFAULT_USER" enum to fans).
const ROLE_LABELS: Record<string, string> = {
  default_user: 'Fan',
  fan: 'Fan',
  artist: 'Artist',
  judge: 'Judge',
  seller: 'Seller',
  brand_owner: 'Brand Owner',
  brand_manager: 'Brand Manager',
  brand_editor: 'Brand Editor',
  brand_member: 'Brand Member',
};

export function formatRoleLabel(role?: string | null): string {
  if (!role) return 'Member';
  const key = role.toLowerCase();
  if (ROLE_LABELS[key]) return ROLE_LABELS[key];
  return key
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
