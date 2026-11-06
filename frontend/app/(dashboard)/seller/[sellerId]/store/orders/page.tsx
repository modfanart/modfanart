'use client';

import { useParams } from 'next/navigation';

import { SellerShell } from '@/components/marketplace/seller/seller-shell';
import { SellerOrders } from '@/components/marketplace/seller/seller-orders';

export default function Page() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const basePath = `/seller/${sellerId}`;

  return (
    <SellerShell basePath={basePath} title="Orders & shipping">
      <SellerOrders />
    </SellerShell>
  );
}
