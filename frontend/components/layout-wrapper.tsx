'use client';

import type React from 'react';

import { usePathname } from 'next/navigation';
import { MainNav } from '@/components/main-nav';
import { SiteFooter } from '@/components/site-footer';

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
      {!isDashboardPath && <MainNav />}
      <main className="flex-1">{children}</main>
      {!isDashboardPath && <SiteFooter />}
    </div>
  );
}
