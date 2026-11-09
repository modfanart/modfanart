'use client';

import { useParams } from 'next/navigation';

import { SellerShell } from '@/components/marketplace/seller/seller-shell';
import { SellerProducts } from '@/components/marketplace/seller/seller-products';

export default function Page() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const basePath = `/seller/${sellerId}`;

  return (
    <SellerShell basePath={basePath} title="Products">
      <SellerProducts storeBase={`${basePath}/store`} />
    </SellerShell>
  );
}
