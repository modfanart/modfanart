// app/dashboard/layout.tsx
'use client';

import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/store/AuthContext'; // or your auth hook
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      redirect('/login');
      return;
    }

    const role = user.role?.name?.toLowerCase();

    const currentPath = window.location.pathname;

    // Artist trying to access brand dashboard
    if (role === 'Artist' && currentPath.startsWith('/dashboard/brand')) {
      redirect('/dashboard'); // or '/dashboard/artist'
    }

    // Brand manager trying to access artist dashboard
    if (
      (role === 'brand_manager' || role === 'brand_manager') &&
      currentPath.startsWith('/dashboard/artist')
    ) {
      redirect('/dashboard/brand'); // or specific brand page
    }
  }, [user, loading]);

  // Only basic auth guard here — no strict role restriction
  return (
    <div className="dashboard-layout min-h-screen bg-background">
      {/* Common header / top nav if any */}

      {/* Render children — the actual page will handle role-specific UI */}
      {children}
    </div>
  );
}
