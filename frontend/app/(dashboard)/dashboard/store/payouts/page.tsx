'use client';

import { SellerShell } from '@/components/marketplace/seller/seller-shell';
import { SellerPayouts } from '@/components/marketplace/seller/seller-payouts';

export default function Page() {
  return (
    <SellerShell basePath="/dashboard" title="Payouts">
      <SellerPayouts />
    </SellerShell>
  );
}
