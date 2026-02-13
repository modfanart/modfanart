import { LayoutWrapper } from '@/components/layout-wrapper';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Profile | MOD Platform',
  description: 'Profile for the MOD Platform fan art licensing service',
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
