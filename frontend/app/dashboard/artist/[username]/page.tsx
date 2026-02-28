// app/dashboard/artist/page.tsx
'use client';

import RoleGuard from '@/components/RoleGuard';
import { DashboardShell } from '@/components/dashboard-shell';
import { Suspense } from 'react';
import DashboardContent from './DashboardContent'; // ← extract content to separate component

export default function ArtistDashboardPage() {
  return (
    <RoleGuard
      allowedRoles={['Artist']}
      redirectTo="/dashboard" // or "/unauthorized" or "/"
      fallback={<div className="p-8 text-center">Checking access...</div>}
    >
      <DashboardShell>
        <Suspense fallback={<div className="p-6">Loading artist dashboard...</div>}>
          <DashboardContent />
        </Suspense>
      </DashboardShell>
    </RoleGuard>
  );
}
