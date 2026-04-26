'use client';

import { usePathname } from 'next/navigation';
import { MainNav } from './main-nav';
import { SiteFooter } from './site-footer';

import type React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

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
