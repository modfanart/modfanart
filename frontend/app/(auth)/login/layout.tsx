import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// TECH-04: unique title/description per page (page.tsx is a client component
// and cannot export metadata itself).
export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your MOD account.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
