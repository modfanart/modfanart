'use client';

import { useParams } from 'next/navigation';

import { SellerShell, useSellerContext } from '@/components/marketplace/seller/seller-shell';
import { SellerOrders } from '@/components/marketplace/seller/seller-orders';

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const basePath = `/brand-manager/${slug}`;
  const ctx = useSellerContext(basePath);

  return (
    <SellerShell basePath={basePath} title="Orders & shipping">
      <SellerOrders />
    </SellerShell>
  );
}
