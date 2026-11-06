// Role helpers shared by the marketplace dashboards. Backend role names are
// upper-case (ARTIST, BRAND_OWNER, ADMIN…); the rest of the frontend
// lower-cases them.
export const ADMIN_ROLES = ['admin', 'super_admin', 'superadmin', 'developer'];
export const BRAND_ROLES = ['brand_manager', 'brand_owner'];

export function normalizeRole(name?: string | null): string {
  return (name || '').toLowerCase();
}

export function isAdminRole(name?: string | null): boolean {
  return ADMIN_ROLES.includes(normalizeRole(name));
}

export function isBrandRole(name?: string | null): boolean {
  return BRAND_ROLES.includes(normalizeRole(name));
}
