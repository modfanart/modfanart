'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layouts/sidebar';
import DashboardHeader from '@/components/dashboard/dashboard-header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =========================================================
     AUTH + ROLE GUARD
  ========================================================= */
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const role = user.role?.name?.toLowerCase();

    if (role === 'artist' && pathname.startsWith('/brand')) {
      router.replace('/');
    }

    if (role === 'brand_manager' && pathname.startsWith('/artist')) {
      router.replace('/brand');
    }
  }, [user, loading, pathname, router]);

  /* =========================================================
     ESC KEY CLOSE (MOBILE UX)
  ========================================================= */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  /* =========================================================
     LOCK BODY SCROLL WHEN OPEN
  ========================================================= */
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [sidebarOpen]);

  if (loading || !user) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* HEADER */}
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        {/* MOBILE SIDEBAR (ALWAYS MOUNTED FOR ANIMATION) */}
        <div className="lg:hidden">
          {/* BACKDROP */}
          <div
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
              sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* DRAWER */}
          <div
            className={`fixed top-0 left-0 h-full w-72 bg-background z-50 shadow-lg transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
