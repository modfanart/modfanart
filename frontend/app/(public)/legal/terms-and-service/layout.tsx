import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Terms of Service | MOD Platform',
  description: 'Terms of Service for the MOD Platform fan art licensing service',
};

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children;
}
