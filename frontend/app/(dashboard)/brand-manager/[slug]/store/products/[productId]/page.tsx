'use client';

import { useParams } from 'next/navigation';

import { SellerShell, useSellerContext } from '@/components/marketplace/seller/seller-shell';
import { ProductEditor } from '@/components/marketplace/seller/product-editor';

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const { productId } = useParams<{ productId: string }>();
  const basePath = `/brand-manager/${slug}`;
  const ctx = useSellerContext(basePath);

  return (
    <SellerShell basePath={basePath} title="Edit product">
      <ProductEditor id={productId} ctx={ctx} />
    </SellerShell>
  );
}
