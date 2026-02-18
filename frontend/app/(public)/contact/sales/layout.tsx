import type React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Sales | MOD Platform',
  description:
    'Get in touch with our sales team to learn more about MOD Platform and schedule a demo.',
};

export default function ContactSalesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
