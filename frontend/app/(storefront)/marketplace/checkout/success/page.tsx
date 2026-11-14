'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { RequireAuth } from '@/components/marketplace/require-auth';
import { useGetMyOrdersQuery } from '@/services/api/marketplaceApi';
import { ORDER_STATUS, formatMoney } from '@/lib/marketplace/format';

function SuccessContent() {
  const params = useSearchParams();
  const ids = (params.get('orders') ?? '').split(',').filter(Boolean);

  // Poll briefly: if Stripe reports "processing", the webhook flips the
  // orders to paid a moment later.
  // Polling used to run forever; stop once every order has left 'pending'
  // (or after ~2 minutes, when the webhook has clearly had its chance).
  const [stopPolling, setStopPolling] = useState(false);
  const { data: orders } = useGetMyOrdersQuery(undefined, {
    pollingInterval: stopPolling ? 0 : 4000,
  });
  const mine = (orders ?? []).filter((o) => ids.includes(o.id));

  // 'failed' is also "not pending" — it must not render as "Order confirmed!".
  const allPaid =
    mine.length > 0 && mine.every((o) => ['paid', 'fulfilled'].includes(o.status));
  const anyFailed = mine.some((o) => o.status === 'failed');
  const settled = mine.length > 0 && mine.every((o) => o.status !== 'pending');

  useEffect(() => {
    if (settled) setStopPolling(true);
  }, [settled]);
  useEffect(() => {
    const t = setTimeout(() => setStopPolling(true), 120_000);
    return () => clearTimeout(t);
  }, []);
  const total = mine.reduce((s, o) => s + o.total_cents, 0);
  const hasLicenses = mine.some((o) => o.items.some((i) => i.item_type === 'license'));
  const hasMerch = mine.some((o) => o.items.some((i) => i.item_type === 'merch_variant'));

  // Visiting this URL without a real, owned order must not show a fake
  // "payment received" confirmation (COM-02).
  if (orders && mine.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">No order to show</h1>
        <p className="mb-8 text-muted-foreground">
          We couldn&apos;t find that order on your account.
        </p>
        <Button asChild>
          <Link href="/marketplace/orders">View my orders</Link>
        </Button>
      </div>
    );
  }

  if (anyFailed) {
    return (
      <div className="mx-auto max-w-lg py-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-destructive">Payment didn&apos;t go through</h1>
        <p className="mb-8 text-muted-foreground">
          Your card wasn&apos;t charged. You can retry from your orders.
        </p>
        <Button asChild>
          <Link href="/marketplace/orders">Go to my orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      {allPaid ? (
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success" />
      ) : (
        <Clock className="mx-auto mb-4 h-16 w-16 text-warning-strong" />
      )}
      <h1 className="mb-2 text-2xl font-bold md:text-3xl">
        {allPaid ? 'Order confirmed!' : 'Payment received — finishing up'}
      </h1>
      <p className="mb-8 text-muted-foreground">
        {allPaid
          ? [
              hasLicenses && 'Your licenses are ready to download from your orders.',
              hasMerch && "We'll email you tracking details once your merch ships.",
            ]
              .filter(Boolean)
              .join(' ') || 'Thank you for your purchase.'
          : "We're confirming your payment with the bank. This page updates automatically."}
      </p>

      {mine.length > 0 && (
        <div className="mb-8 divide-y rounded-lg border text-left">
          {mine.map((o) => (
            <Link
              key={o.id}
              href={`/marketplace/orders/${o.id}`}
              className="flex items-center justify-between gap-3 p-4 hover:bg-muted/40"
            >
              <div>
                <p className="font-medium">{o.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  {o.items.length} item{o.items.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge map={ORDER_STATUS} status={o.status} />
                <span className="font-medium">{formatMoney(o.total_cents)}</span>
              </div>
            </Link>
          ))}
          <div className="flex justify-between p-4 font-semibold">
            <span>Total paid</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/marketplace">Continue shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/marketplace/orders">View my orders</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </RequireAuth>
  );
}
