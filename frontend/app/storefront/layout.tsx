import type { ReactNode } from 'react';
import { LayoutWrapper } from '@/components/layouts/layout-wrapper';
export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
