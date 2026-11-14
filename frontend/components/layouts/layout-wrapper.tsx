'use client';

import { usePathname } from 'next/navigation';
import MainNav from './main-nav-new';
import { SiteFooter } from './site-footer';
import { AccountStanding } from './account-standing';

import type React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Pages that render their own chrome (dashboard shell, auth screens).
  const isDashboardPath =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/judge/invite') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/verify-account');

  return (
    <div className="flex flex-col flex-1">
      {' '}
      {/* ✅ FIXED */}
      {!isDashboardPath && <MainNav />} {/* ✅ SAFE */}
      {children}
      {!isDashboardPath && <SiteFooter />}
      {/* Email-verification banner / terms prompt for signed-in users */}
      <AccountStanding />
    </div>
  );
}
