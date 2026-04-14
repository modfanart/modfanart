'use client';

import { useEffect } from 'react';
import { usePathname, redirect } from 'next/navigation';

import { useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/sidebar';
import DashboardHeader from '@/components/dashboard-header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      redirect('/login');
      return;
    }

    const role = user.role?.name?.toLowerCase();

    // Role protection
    if (role === 'artist' && pathname.startsWith('/brand')) {
      redirect('/');
    }

    if (role === 'brand_manager' && pathname.startsWith('/artist')) {
      redirect('/brand');
    }
  }, [user, loading, pathname]);

  if (loading || !user) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* HEADER */}
      <DashboardHeader />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
