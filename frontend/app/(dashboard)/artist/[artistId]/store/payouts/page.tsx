'use client';

import { useParams } from 'next/navigation';

import { SellerShell, useSellerContext } from '@/components/marketplace/seller/seller-shell';
import { SellerPayouts } from '@/components/marketplace/seller/seller-payouts';

export default function Page() {
  const { artistId } = useParams<{ artistId: string }>();
  const basePath = `/artist/${artistId}`;
  const ctx = useSellerContext(basePath);

  return (
    <SellerShell basePath={basePath} title="Payouts">
      <SellerPayouts />
    </SellerShell>
  );
}
