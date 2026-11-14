// Single source of truth for the dashboard URL scheme.
//
// Before: /artist/<username>/my-artworks/new, /brand-manager/<brand>/opportunities/create,
//         /seller/<username>/store/products, /judge/<username>/contest/<id>/review-queue
// After:  /dashboard/artworks/new, /dashboard/opportunities/new,
//         /dashboard/store/products, /dashboard/judging/<id>/review-queue
//
// Who you are (and which brand you're managing) comes from the session, so
// it no longer needs to be in the URL. Old URLs redirect (next.config.js).

export const DASHBOARD = '/dashboard';

export type DashboardRole = 'artist' | 'brand' | 'seller';

export function dashboardRole(roleName?: string | null): DashboardRole | null {
  const r = (roleName || '').toLowerCase();
  if (r === 'artist') return 'artist';
  if (r === 'brand_manager' || r === 'brand_owner' || r === 'brand_editor' || r === 'brand_member')
    return 'brand';
  if (r === 'seller') return 'seller';
  return null;
}

/**
 * Which roles may open a dashboard section (first path segment after
 * /dashboard). Missing = any signed-in user (e.g. judging, which is granted
 * per contest rather than by role).
 */
export const SECTION_ROLES: Record<string, DashboardRole[]> = {
  '': ['artist', 'brand', 'seller'],
  artworks: ['artist'],
  analytics: ['artist'],
  earnings: ['artist'],
  history: ['artist'],
  licensing: ['artist', 'brand'],
  opportunities: ['artist', 'brand'],
  store: ['artist', 'brand', 'seller'],
  content: ['brand'],
  profile: ['brand'],
  settings: ['brand'],
  storefront: ['brand'],
  submissions: ['brand'],
};

export function canOpenDashboardPath(pathname: string, roleName?: string | null): boolean {
  if (!pathname.startsWith(DASHBOARD)) return true;
  const section = pathname.slice(DASHBOARD.length).split('/')[1] ?? '';
  if (section === 'judging') return true;
  const allowed = SECTION_ROLES[section];
  if (!allowed) return true; // unknown section: let Next render its 404
  const role = dashboardRole(roleName);
  // Brand-only deep pages under /opportunities (new, [id]/edit, …).
  if (section === 'opportunities' && pathname.split('/').length > 3) return role === 'brand';
  return !!role && allowed.includes(role);
}
