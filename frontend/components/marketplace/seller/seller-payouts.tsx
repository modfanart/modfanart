'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/marketplace/status-badge';
import {
  useCreateConnectAccountMutation,
  useGetConnectStatusQuery,
  useGetMyPayoutsQuery,
} from '@/services/api/marketplaceApi';
import { PAYOUT_STATUS, formatDate, formatMoney } from '@/lib/marketplace/format';
import { StatTile } from './seller-overview';
import { CircleDollarSign, Clock, Landmark } from 'lucide-react';

export function SellerPayouts() {
  const { data: payouts, isLoading } = useGetMyPayoutsQuery();
  const { data: connect } = useGetConnectStatusQuery();
  const [connectAccount, { isLoading: connecting }] = useCreateConnectAccountMutation();

  const sum = (status: string, key: 'net_cents' | 'platform_fee_cents') =>
    (payouts ?? []).filter((p) => p.status === status).reduce((s, p) => s + p[key], 0);

  return (
    <div className="space-y-6">
      {connect && !connect.payouts_enabled && (
        <Alert>
          <AlertTitle>Payout account not ready</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            {connect.connected
              ? 'Finish Stripe onboarding so we can send your earnings.'
              : 'Connect a Stripe account to receive your earnings.'}
            <Button
              size="sm"
              disabled={connecting}
              onClick={async () => {
                const res = await connectAccount().unwrap().catch(() => null);
                if (res?.url) window.location.href = res.url;
              }}
            >
              {connect.connected ? 'Continue onboarding' : 'Connect Stripe'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Pending" icon={Clock} value={formatMoney(sum('pending', 'net_cents'), 'INR')} />
        <StatTile label="Paid out" icon={Landmark} value={formatMoney(sum('paid', 'net_cents'), 'INR')} />
        <StatTile
          label="Platform fees"
          icon={CircleDollarSign}
          value={formatMoney(
            sum('pending', 'platform_fee_cents') +
              sum('paid', 'platform_fee_cents'),
            'INR'
          )}
        />
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        Totals add up amounts in each order&apos;s own currency; see rows below for exact figures.
      </p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading payouts…</p>
      ) : !payouts?.length ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          Payouts appear here once an order is completed.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Platform fee</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.created_at)}</TableCell>
                  <TableCell>{formatMoney(p.gross_cents)}</TableCell>
                  <TableCell>−{formatMoney(p.platform_fee_cents)}</TableCell>
                  <TableCell className="font-medium">{formatMoney(p.net_cents)}</TableCell>
                  <TableCell>
                    <StatusBadge map={PAYOUT_STATUS} status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
