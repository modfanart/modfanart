'use client';

import Link from 'next/link';
import { useGetMyOrdersQuery } from '@/services/api/ordersApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package } from 'lucide-react';
import type { OrderStatus } from '@/services/types/merch';

const statusVariant: Record<
  OrderStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'outline',
  paid: 'default',
  fulfilled: 'secondary',
  refunded: 'destructive',
  disputed: 'destructive',
  failed: 'destructive',
};

export default function MyOrdersPage() {
  const { data, isLoading, isError, refetch } = useGetMyOrdersQuery();
  const orders = data?.orders ?? [];

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Could not load orders. Sign in required.</p>
        <Button onClick={() => refetch()}>Retry</Button>
        <Button asChild variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <Package className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <Button asChild>
          <Link href="/storefront">Browse marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">My orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">
                  {order.order_number || order.id.slice(0, 8)}
                </span>
                <Badge variant={statusVariant[order.status] ?? 'secondary'}>
                  {order.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleString()} ·{' '}
                {order.currency} ·{' '}
                {(order.items?.length ?? 0)} item
                {(order.items?.length ?? 0) === 1 ? '' : 's'}
              </p>
            </div>
            <p className="text-lg font-semibold">
              {new Intl.NumberFormat(
                order.currency === 'INR' ? 'en-IN' : 'en-US',
                { style: 'currency', currency: order.currency || 'USD' }
              ).format(order.total_cents / 100)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
