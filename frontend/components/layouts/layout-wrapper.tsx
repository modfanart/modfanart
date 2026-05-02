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
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/artist') ||
    pathname?.startsWith('/judge') ||
    pathname?.startsWith('/brand-manager');

  return (
    <div className="flex flex-col flex-1">
      {' '}
      {/* ✅ FIXED */}
      {!isDashboardPath && <MainNav />} {/* ✅ SAFE */}
      {children}
      {!isDashboardPath && <SiteFooter />}
    </div>
  );
}
