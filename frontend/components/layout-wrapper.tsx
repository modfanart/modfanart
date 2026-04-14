'use client';

import { usePathname } from 'next/navigation';

// import { MainNav } from '@/components/main-nav';
import Navbar from '@/components/main-nav-new';
import { SiteFooter } from '@/components/site-footer';

import type React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Check if the current path is a dashboard path
  const isDashboardPath =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/submissions') ||
    pathname?.startsWith('/license-requests');

  return (
    <div className="flex min-h-screen flex-col">
      {!isDashboardPath && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isDashboardPath && <SiteFooter />}
    </div>
  );
}
