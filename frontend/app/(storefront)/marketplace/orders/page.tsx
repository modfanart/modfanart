'use client';

import Link from 'next/link';
import { ChevronRight, PackageOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductImage } from '@/components/marketplace/product-image';
import { RequireAuth } from '@/components/marketplace/require-auth';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { useGetMyOrdersQuery } from '@/services/api/marketplaceApi';
import { ORDER_STATUS, formatDate, formatMoney } from '@/lib/marketplace/format';

function OrdersContent() {
  const { data: orders, isLoading, isError } = useGetMyOrdersQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My orders</h1>
          <p className="text-muted-foreground">Track shipments, download licenses and leave reviews.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/marketplace/addresses">Address book</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : isError ? (
        <p className="text-destructive">We couldn&apos;t load your orders. Please refresh.</p>
      ) : !orders?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <PackageOpen className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No orders yet</p>
          <Button asChild>
            <Link href="/marketplace">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/marketplace/orders/${order.id}`}
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((i) => (
                    <div
                      key={i.id}
                      className="h-14 w-14 overflow-hidden rounded-md border-2 border-background bg-muted"
                    >
                      <ProductImage src={i.image_url} alt={i.product_title || i.artwork_title || 'Item'} />
                    </div>
                  ))}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{order.order_number}</span>
                    <StatusBadge map={ORDER_STATUS} status={order.status} />
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {formatDate(order.created_at)} ·{' '}
                    {order.items
                      .map((i) => i.product_title || i.artwork_title || i.description)
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>

                <span className="font-semibold">{formatMoney(order.total_cents)}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth message="Sign in to see your orders.">
      <OrdersContent />
    </RequireAuth>
  );
}
