'use client';

import { useParams } from 'next/navigation';

import { SellerShell } from '@/components/marketplace/seller/seller-shell';
import { SellerOverview } from '@/components/marketplace/seller/seller-overview';

export default function Page() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const basePath = `/seller/${sellerId}`;

  return (
    <SellerShell basePath={basePath} title="Store overview">
      <SellerOverview storeBase={`${basePath}/store`} />
    </SellerShell>
  );
}
