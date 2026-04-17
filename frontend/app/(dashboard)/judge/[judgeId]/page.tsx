'use client';

import RoleGuard from '@/components/RoleGuard';
import { Suspense } from 'react';
import JudgeDashboardContent from './JudgeDashboardContent';
export default function JudgeDashboard() {
  return (
    <RoleGuard
      allowedRoles={['judge']}
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
      <Suspense fallback={<div className="p-6">Loading judge dashboard...</div>}>
        <JudgeDashboardContent />
      </Suspense>
    </RoleGuard>
  );
}
