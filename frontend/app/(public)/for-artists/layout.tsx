import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// TECH-04: unique title/description per page (page.tsx is a client component
// and cannot export metadata itself).
export const metadata: Metadata = {
  title: 'For Artists — Submit Fan Art & Earn Royalties',
  description: 'Enter official brand contests, license your fan art legally and earn royalties on MOD.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
