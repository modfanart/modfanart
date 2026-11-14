'use client';

import RoleGuard from '@/components/layouts/RoleGuard';
import { Suspense } from 'react';
import JudgeDashboardContent from './JudgeDashboardContent';

import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Gavel } from 'lucide-react';

export default function JudgeDashboard() {
  return (
    // Deliberately not gated on the JUDGE role. Judging is granted per contest
    // through the contest_judges table, and users.role_id holds a single role,
    // so a brand owner assigned as a judge does not have (and must not be
    // given) the JUDGE role. Gating on it locked legitimately assigned judges
    // out of their own dashboard and bounced them to /dashboard, which is not a
    // real route -- (dashboard) is a route group -- so every denial became a
    // 404. JudgeDashboardContent loads the contests this user actually judges
    // and shows an empty state when there are none.
    <RoleGuard
      redirectTo="/"
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-md shadow-lg rounded-2xl">
            <CardContent className="flex flex-col items-center text-center space-y-4 p-6">
              <Gavel className="w-10 h-10 text-muted-foreground" />

              <div>
                <p className="text-lg font-semibold">Verifying judge access...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirecting if you don’t have permission.
                </p>
              </div>

              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="p-6 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-md rounded-2xl">
              <CardContent className="flex items-center justify-center gap-3 p-6">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading judge dashboard...</span>
              </CardContent>
            </Card>
          </div>
        }
      >
        <JudgeDashboardContent />
      </Suspense>
    </RoleGuard>
  );
}
