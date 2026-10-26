'use client';

import { useParams } from 'next/navigation';

import { SellerShell, useSellerContext } from '@/components/marketplace/seller/seller-shell';
import { ProductCreateForm } from '@/components/marketplace/seller/product-editor';

export default function Page() {
  const { artistId } = useParams<{ artistId: string }>();
  const basePath = `/artist/${artistId}`;
  const ctx = useSellerContext(basePath);

  return (
    <SellerShell basePath={basePath} title="New product">
      <ProductCreateForm ctx={ctx} />
    </SellerShell>
  );
}
