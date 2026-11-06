'use client';

import { format } from 'date-fns';
import { ClipboardList } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useGetSellerOrdersQuery } from '@/services/api/sellerApi';
import type { Order } from '@/services/api/orderApi';

const STATUS_COLOR: Record<Order['status'], string> = {
  pending: 'bg-slate-100 text-slate-700 border-slate-300',
  paid: 'bg-blue-100 text-blue-800 border-blue-300',
  fulfilled: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  refunded: 'bg-amber-100 text-amber-800 border-amber-300',
  disputed: 'bg-red-100 text-red-800 border-red-300',
  failed: 'bg-red-100 text-red-800 border-red-300',
};

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format(
    cents / 100
  );
}

export function SellerOrders() {
  const { data: orders = [], isLoading } = useGetSellerOrdersQuery();

  return (
    <div className="flex-1 space-y-6 p-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1">Orders placed for your products</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/30">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/70" />
          <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            When customers buy your merch, their orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="border">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">Order #{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {formatMoney(order.total_cents, order.currency)}
                  </span>
                  <Badge className={`${STATUS_COLOR[order.status]} capitalize`}>
                    {order.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerOrders;
