import type { ReactNode } from 'react';

// The site header is fixed and transparent, so storefront pages start below it.
export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <div className="container mx-auto max-w-7xl px-4 pb-16 pt-28 md:px-6">{children}</div>;
}
