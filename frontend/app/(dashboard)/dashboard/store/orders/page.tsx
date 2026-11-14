'use client';

import { SellerShell } from '@/components/marketplace/seller/seller-shell';
import { SellerOrders } from '@/components/marketplace/seller/seller-orders';

export default function Page() {
  return (
    <SellerShell basePath="/dashboard" title="Orders & shipping">
      <SellerOrders />
    </SellerShell>
  );
}
