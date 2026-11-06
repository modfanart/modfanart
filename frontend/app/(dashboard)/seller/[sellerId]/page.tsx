'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';

import RoleGuard from '@/components/layouts/RoleGuard';
import { SellerShell } from '@/components/marketplace/seller/seller-shell';
import { SellerOverview } from '@/components/marketplace/seller/seller-overview';

import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Store } from 'lucide-react';

export default function SellerPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const basePath = `/seller/${encodeURIComponent(sellerId)}`;

  return (
    <RoleGuard
      allowedRoles={['SELLER']}
      redirectTo="/"
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-md shadow-lg rounded-2xl">
            <CardContent className="flex flex-col items-center text-center space-y-4 p-6">
              <Store className="w-10 h-10 text-muted-foreground" />

              <div>
                <p className="text-lg font-semibold">
                  Verifying seller access...
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirecting if you don’t have permission.
                </p>
              </div>

              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="w-full max-w-md shadow-md rounded-2xl">
              <CardContent className="flex items-center justify-center gap-3 p-6">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading seller dashboard...
                </span>
              </CardContent>
            </Card>
          </div>
        }
      >
        <SellerShell basePath={basePath} title="Store overview">
          <SellerOverview storeBase={`${basePath}/store`} />
        </SellerShell>
      </Suspense>
    </RoleGuard>
  );
}