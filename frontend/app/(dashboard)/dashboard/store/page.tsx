'use client';

import { SellerShell } from '@/components/marketplace/seller/seller-shell';
import { SellerOverview } from '@/components/marketplace/seller/seller-overview';

// One store dashboard for artists, brands and sellers (was three copies under
// /artist/<u>/store, /brand-manager/<b>/store and /seller/<u>/store).
export default function Page() {
  return (
    <SellerShell basePath="/dashboard" title="Store overview">
      <SellerOverview storeBase="/dashboard/store" />
    </SellerShell>
  );
}
