'use client';

import { useParams } from 'next/navigation';

import { SellerShell } from '@/components/marketplace/seller/seller-shell';
import { SellerPayouts } from '@/components/marketplace/seller/seller-payouts';

export default function Page() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const basePath = `/seller/${sellerId}`;

  return (
    <SellerShell basePath={basePath} title="Payouts">
      <SellerPayouts />
    </SellerShell>
  );
}
