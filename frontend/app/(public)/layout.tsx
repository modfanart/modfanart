import type React from 'react';
import { MainNav } from '@/components/main-nav';
import Navbar from '@/components/main-nav-new';
import { SiteFooter } from '@/components/site-footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">{children}</main>
      <SiteFooter />
    </>
  );
}
