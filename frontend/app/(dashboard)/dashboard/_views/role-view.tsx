'use client';

// Renders the right view for the signed-in user's role. Sections such as
// /dashboard and /dashboard/opportunities are shared URLs whose content
// differs by role (they used to be separate /artist/<u>/… and
// /brand-manager/<b>/… routes).

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/store/AuthContext';
import { dashboardRole, type DashboardRole } from '@/lib/dashboard-routes';

export function RoleView({
  views,
  otherwise = '/',
}: {
  views: Partial<Record<DashboardRole, ReactNode>>;
  /** Where users with no matching view are sent. */
  otherwise?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const role = dashboardRole(user?.role?.name);
  const view = role ? views[role] : undefined;

  useEffect(() => {
    if (!loading && user && view === undefined) router.replace(otherwise);
  }, [loading, user, view, otherwise, router]);

  if (loading || !user || view === undefined) {
    return <div className="flex h-full items-center justify-center p-12 text-muted-foreground">Loading…</div>;
  }
  return <>{view}</>;
}
