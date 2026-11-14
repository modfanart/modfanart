import { DASHBOARD, dashboardRole } from '@/lib/dashboard-routes';

/**
 * Where a user's dashboard lives, or null if their role has none.
 * Every role now shares the short /dashboard prefix; the username / brand
 * slug segments were removed from dashboard URLs.
 */
export function getBasePath(user: any): string | null {
  const role = dashboardRole(user?.role?.name);
  if (role) return DASHBOARD;
  if ((user?.role?.name || '').toLowerCase() === 'judge') return `${DASHBOARD}/judging`;
  return null;
}
