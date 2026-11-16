import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// TECH-04: unique title/description per page (page.tsx is a client component
// and cannot export metadata itself).
export const metadata: Metadata = {
  title: 'For Brands — Run Fan Art Contests & License Fan Creations',
  description: 'Launch fan art campaigns, review compliant submissions and license the best fan creations with MOD.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
