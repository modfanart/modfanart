import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Privacy Policy | MOD Platform',
  description: 'Privacy Policy for the MOD Platform fan art licensing service',
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
