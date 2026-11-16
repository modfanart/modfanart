'use client';

import { useAuth } from '@/store/AuthContext';
import { useActiveBrand } from '@/hooks/use-active-brand';
import { SellerShell } from '@/components/marketplace/seller/seller-shell';
import { SellerOverview } from '@/components/marketplace/seller/seller-overview';
import { RoleView } from './_views/role-view';
import ArtistOverview from './_views/artist/overview/page';
import BrandOverview from './_views/brand/overview/page';
import BrandPending from './_views/brand/pending/page';

// /dashboard — the home of every role's dashboard.
export default function DashboardHome() {
  const { user } = useAuth();
  const { brand } = useActiveBrand();
  const isJudgeOnly = (user?.role?.name || '').toLowerCase() === 'judge';

  return (
    <RoleView
      otherwise={isJudgeOnly ? '/dashboard/judging' : '/'}
      views={{
        artist: <ArtistOverview />,
        // No verified brand yet -> verification status (BRD-02/03/04).
        brand: brand ? <BrandOverview /> : <BrandPending />,
        seller: (
          <SellerShell basePath="/dashboard" title="Store overview">
            <SellerOverview storeBase="/dashboard/store" />
          </SellerShell>
        ),
      }}
    />
  );
}
