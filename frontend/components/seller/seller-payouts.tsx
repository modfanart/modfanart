'use client';

import { format } from 'date-fns';
import { Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useGetMyPayoutsQuery } from '@/services/api/payoutApi';
import type { SellerPayout } from '@/services/mocks/seller.fixtures';

const STATUS_COLOR: Record<SellerPayout['status'], string> = {
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  failed: 'bg-red-100 text-red-800 border-red-300',
};

// Payouts are stored in INR cents (backend PayoutRow), matching the licensing flow.
function formatInr(cents: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cents / 100);
}

export function SellerPayouts() {
  const { data: payouts = [], isLoading } = useGetMyPayoutsQuery();

  const paidNet = payouts
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.net_cents, 0);
  const pendingNet = payouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.net_cents, 0);

  return (
    <div className="flex-1 space-y-6 p-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
        <p className="text-muted-foreground mt-1">Earnings paid out for your sales</p>
      </div>

      {!isLoading && payouts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid out</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatInr(paidNet)}</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatInr(pendingNet)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : payouts.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/30">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground/70" />
          <h3 className="mt-4 text-lg font-medium">No payouts yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Once your sales are settled, payouts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((payout) => (
            <Card key={payout.id} className="border">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{formatInr(payout.net_cents)}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(payout.created_at), 'MMM d, yyyy')} · gross{' '}
                    {formatInr(payout.gross_cents)} · fee {formatInr(payout.platform_fee_cents)}
                  </p>
                </div>
                <Badge className={`${STATUS_COLOR[payout.status]} capitalize`}>
                  {payout.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerPayouts;
