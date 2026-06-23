// app/(dashboard)/brand/page.tsx
'use client';

import RoleGuard from '@/components/RoleGuard';
import { DashboardShell } from '@/components/dashboard-shell';
import { Suspense } from 'react';
import DashboardContent from './DashboardContent'; // ← extract content to separate component

export default function BrandDashboard() {
  return (
    <RoleGuard
      allowedRoles={['brand_manager']}
      redirectTo="/dashboard"
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">Checking permissions...</p>
            <p className="text-sm text-muted-foreground mt-2">
              You will be redirected if you don't have access.
            </p>
          </div>
        </div>
      }
    >
      <Suspense fallback={<div className="p-6">Loading artist dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </RoleGuard>
  );
}
