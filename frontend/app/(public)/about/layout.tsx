import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// TECH-04: unique title/description per page (page.tsx is a client component
// and cannot export metadata itself).
export const metadata: Metadata = {
  title: 'About MOD',
  description: 'MOD is the official fan art licensing platform connecting artists, fans and brands.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
