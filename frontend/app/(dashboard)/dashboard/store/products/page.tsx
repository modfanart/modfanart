'use client';

import { SellerShell } from '@/components/marketplace/seller/seller-shell';
import { SellerProducts } from '@/components/marketplace/seller/seller-products';

export default function Page() {
  return (
    <SellerShell basePath="/dashboard" title="Products">
      <SellerProducts storeBase="/dashboard/store" />
    </SellerShell>
  );
}
