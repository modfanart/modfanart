'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, CircleDollarSign, Package, ShoppingBag, Wallet } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/marketplace/status-badge';
import {
  useCreateConnectAccountMutation,
  useGetConnectStatusQuery,
  useGetMyPayoutsQuery,
  useGetMySellerSummaryQuery,
  useGetSellerOrdersQuery,
} from '@/services/api/marketplaceApi';
import { MERCH_STATUS, ORDER_STATUS, formatDate, formatMoney } from '@/lib/marketplace/format';

export function StatTile({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function SellerOverview({ storeBase }: { storeBase: string }) {
  const { data: summary } = useGetMySellerSummaryQuery();
  const { data: orders } = useGetSellerOrdersQuery();
  const { data: payouts } = useGetMyPayoutsQuery();
  const { data: connect } = useGetConnectStatusQuery();
  const [connectAccount, { isLoading: connecting }] = useCreateConnectAccountMutation();

  const pendingNet = (payouts ?? [])
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + p.net_cents, 0);
  const paidNet = (payouts ?? [])
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + p.net_cents, 0);

  const toShip = (orders ?? []).filter(
    (o) => o.status === 'paid' && o.items.some((i) => i.item_type === 'merch_variant')
  );

  const byStatus = summary?.products_by_status ?? {};

  return (
    <div className="space-y-6">
      {connect && !connect.payouts_enabled && (
        <Alert>
          <Wallet className="h-4 w-4" />
          <AlertTitle>Connect a payout account</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            You need a connected Stripe account before earnings can be paid out.
            <Button
              size="sm"
              disabled={connecting}
              onClick={async () => {
                const res = await connectAccount().unwrap().catch(() => null);
                if (res?.url) window.location.href = res.url;
              }}
            >
              {connect.connected ? 'Finish onboarding' : 'Connect Stripe'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Gross sales"
          icon={CircleDollarSign}
          value={formatMoney(summary?.gross_cents ?? 0)}
          hint="Paid orders, before fees (USD)"
        />
        <StatTile label="Units sold" icon={ShoppingBag} value={summary?.units_sold ?? 0} />
        <StatTile
          label="Awaiting shipment"
          icon={Package}
          value={toShip.length}
          hint="Paid orders with merch to ship"
        />
        <StatTile
          label="Pending payouts"
          icon={Wallet}
          value={formatMoney(pendingNet)}
          hint={`${formatMoney(paidNet)} paid out so far`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Products</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`${storeBase}/products`}>
                Manage <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(Object.keys(MERCH_STATUS) as (keyof typeof MERCH_STATUS)[]).map((st) => (
              <div key={st} className="flex items-center justify-between text-sm">
                <StatusBadge map={MERCH_STATUS} status={st} />
                <span className="font-medium">{byStatus[st] ?? 0}</span>
              </div>
            ))}
            <Button className="mt-3 w-full" asChild>
              <Link href={`${storeBase}/products/new`}>Create a product</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`${storeBase}/orders`}>
                All orders <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {orders?.length ? (
              <ul className="divide-y">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <div>
                      <p className="font-medium">{o.order_number}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                    </div>
                    <StatusBadge map={ORDER_STATUS} status={o.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
