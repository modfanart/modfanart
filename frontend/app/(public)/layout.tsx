import type React from 'react';
import { MainNav } from '@/components/main-nav';
import { SiteFooter } from '@/components/site-footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav />
      <main className="flex-1 bg-white">{children}</main>
      <SiteFooter />
    </>
  );
}
