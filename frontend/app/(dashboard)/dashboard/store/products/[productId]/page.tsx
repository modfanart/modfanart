'use client';

import { useParams } from 'next/navigation';

import { SellerShell, useSellerContext } from '@/components/marketplace/seller/seller-shell';
import { ProductEditor } from '@/components/marketplace/seller/product-editor';

export default function Page() {
  const { productId } = useParams<{ productId: string }>();
  const ctx = useSellerContext('/dashboard');

  return (
    <SellerShell basePath="/dashboard" title="Edit product">
      <ProductEditor id={productId} ctx={ctx} />
    </SellerShell>
  );
}
