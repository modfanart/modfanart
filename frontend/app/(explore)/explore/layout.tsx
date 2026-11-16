import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// TECH-04: unique title/description per page (page.tsx is a client component
// and cannot export metadata itself).
export const metadata: Metadata = {
  title: 'Explore Contests, Artists & Brands',
  description: 'Discover live fan art contests, featured artists and official brands on MOD.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
