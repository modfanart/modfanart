'use client';

import RoleGuard from '@/components/layouts/RoleGuard';
import { Suspense } from 'react';
import AdminDashboardContent from './AdminDashboardContent';

import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <RoleGuard
      allowedRoles={['Admin']}
      redirectTo="/dashboard"
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-md shadow-lg rounded-2xl">
            <CardContent className="flex flex-col items-center text-center space-y-4 p-6">
              <ShieldAlert className="w-10 h-10 text-muted-foreground" />

              <div>
                <p className="text-lg font-semibold">Checking permissions...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You will be redirected if you don't have access.
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
                <span className="text-sm text-muted-foreground">Loading admin dashboard...</span>
              </CardContent>
            </Card>
          </div>
        }
      >
        <AdminDashboardContent />
      </Suspense>
    </RoleGuard>
  );
}
