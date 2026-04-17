'use client';

import RoleGuard from '@/components/RoleGuard';
import { Suspense } from 'react';
import AdminDashboardContent from './AdminDashboardContent';

export default function AdminDashboard() {
  return (
    <RoleGuard
      allowedRoles={['Admin']}
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
      <Suspense fallback={<div className="p-6">Loading admin dashboard...</div>}>
        <AdminDashboardContent />
      </Suspense>
    </RoleGuard>
  );
}
