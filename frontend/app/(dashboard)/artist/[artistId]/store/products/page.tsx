'use client';

import { useParams } from 'next/navigation';

import { SellerShell, useSellerContext } from '@/components/marketplace/seller/seller-shell';
import { SellerProducts } from '@/components/marketplace/seller/seller-products';

export default function Page() {
  const { artistId } = useParams<{ artistId: string }>();
  const basePath = `/artist/${artistId}`;
  const ctx = useSellerContext(basePath);

  return (
    <SellerShell basePath={basePath} title="Products">
      <SellerProducts storeBase={`${basePath}/store`} />
    </SellerShell>
  );
}
