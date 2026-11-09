'use client';

import { useParams } from 'next/navigation';

import { SellerShell, useSellerContext } from '@/components/marketplace/seller/seller-shell';
import { SellerOverview } from '@/components/marketplace/seller/seller-overview';

export default function Page() {
  const { artistId } = useParams<{ artistId: string }>();
  const basePath = `/artist/${artistId}`;
  const ctx = useSellerContext(basePath);

  return (
    <SellerShell basePath={basePath} title="Store overview">
      <SellerOverview storeBase={`${basePath}/store`} />
    </SellerShell>
  );
}
