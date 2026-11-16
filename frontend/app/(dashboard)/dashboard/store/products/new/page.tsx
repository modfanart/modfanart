'use client';

import { SellerShell, useSellerContext } from '@/components/marketplace/seller/seller-shell';
import { ProductCreateForm } from '@/components/marketplace/seller/product-editor';

export default function Page() {
  const ctx = useSellerContext('/dashboard');

  return (
    <SellerShell basePath="/dashboard" title="New product">
      <ProductCreateForm ctx={ctx} />
    </SellerShell>
  );
}
