'use client';

import { useState } from 'react';
import { PackagePlus, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { AddressSummary } from '@/components/marketplace/address-form';
import { StatusBadge } from '@/components/marketplace/status-badge';
import {
  getApiErrorMessage,
  useCreateFulfillmentMutation,
  useGetSellerOrdersQuery,
  useUpdateFulfillmentStatusMutation,
  useUpdateFulfillmentTrackingMutation,
  type Fulfillment,
  type FulfillmentStatus,
  type Order,
} from '@/services/api/marketplaceApi';
import {
  FULFILLMENT_STATUS,
  ORDER_STATUS,
  formatDate,
  formatMoney,
  titleCase,
} from '@/lib/marketplace/format';

export function SellerOrders() {
  const { data: orders, isLoading } = useGetSellerOrdersQuery();
  const [filter, setFilter] = useState<'all' | 'to_ship'>('to_ship');

  const needsShipping = (o: Order) =>
    o.items.some(
      (i) =>
        i.item_type === 'merch_variant' &&
        !o.fulfillments.some((f) => f.items?.some((fi) => fi.id === i.id))
    );

  const visible = (orders ?? []).filter((o) => (filter === 'all' ? true : needsShipping(o)));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={filter === 'to_ship' ? 'default' : 'outline'} onClick={() => setFilter('to_ship')}>
          To ship
        </Button>
        <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
          All orders
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading orders…</p>
      ) : !visible.length ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          {filter === 'to_ship' ? 'Nothing waiting to ship. 🎉' : 'No orders yet.'}
        </p>
      ) : (
        visible.map((order) => <SellerOrderCard key={order.id} order={order} />)
      )}
    </div>
  );
}

function SellerOrderCard({ order }: { order: Order }) {
  const { toast } = useToast();
  const [createFulfillment, { isLoading: creating }] = useCreateFulfillmentMutation();
  const [picked, setPicked] = useState<string[]>([]);

  const fail = (err: unknown) =>
    toast({ title: 'Action failed', description: getApiErrorMessage(err), variant: 'destructive' });

  const shippedIds = new Set(order.fulfillments.flatMap((f) => (f.items ?? []).map((i) => i.id)));
  const unshipped = order.items.filter(
    (i) => i.item_type === 'merch_variant' && !shippedIds.has(i.id)
  );
  const earned = order.items.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{order.order_number}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.created_at)} · {order.buyer_username ?? 'Customer'} ·{' '}
            {formatMoney(earned, order.currency)}
          </p>
        </div>
        <StatusBadge map={ORDER_STATUS} status={order.status} />
      </CardHeader>

      <CardContent className="space-y-5">
        <ul className="divide-y rounded-md border text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="font-medium">{i.product_title || i.artwork_title || i.description}</p>
                <p className="text-muted-foreground">
                  {i.item_type === 'license'
                    ? `${titleCase(i.license_type)} license (delivered automatically)`
                    : [i.size, i.color, i.material].filter(Boolean).join(' · ') || i.sku} · Qty{' '}
                  {i.quantity}
                </p>
              </div>
              <span>{formatMoney(i.unit_price_cents * i.quantity, order.currency)}</span>
            </li>
          ))}
        </ul>

        {order.shipping_address && unshipped.length + order.fulfillments.length > 0 && (
          <div className="text-sm">
            <p className="mb-1 font-medium">Ship to</p>
            <AddressSummary address={order.shipping_address} />
          </div>
        )}

        {order.fulfillments.map((f) => (
          <FulfillmentEditor key={f.id} orderId={order.id} fulfillment={f} />
        ))}

        {unshipped.length > 0 && order.status === 'paid' && (
          <div className="space-y-3 rounded-md border bg-muted/30 p-4">
            <p className="text-sm font-medium">Create a shipment</p>
            {unshipped.map((i) => (
              <label key={i.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={picked.includes(i.id)}
                  onCheckedChange={(c) =>
                    setPicked((p) => (c === true ? [...p, i.id] : p.filter((x) => x !== i.id)))
                  }
                />
                {i.product_title || i.description} × {i.quantity}
              </label>
            ))}
            <Button
              size="sm"
              disabled={!picked.length || creating}
              onClick={() =>
                createFulfillment({ orderId: order.id, order_item_ids: picked })
                  .unwrap()
                  .then(() => {
                    setPicked([]);
                    toast({ title: 'Shipment created' });
                  })
                  .catch(fail)
              }
            >
              <PackagePlus className="mr-2 h-4 w-4" /> Create shipment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const STATUS_ORDER: FulfillmentStatus[] = [
  'pending',
  'in_production',
  'shipped',
  'delivered',
  'failed',
  'returned',
];

function FulfillmentEditor({ orderId, fulfillment }: { orderId: string; fulfillment: Fulfillment }) {
  const { toast } = useToast();
  const [setStatus, { isLoading: statusBusy }] = useUpdateFulfillmentStatusMutation();
  const [setTracking, { isLoading: trackingBusy }] = useUpdateFulfillmentTrackingMutation();

  const [carrier, setCarrier] = useState(fulfillment.carrier ?? '');
  const [number, setNumber] = useState(fulfillment.tracking_number ?? '');
  const [url, setUrl] = useState(fulfillment.tracking_url ?? '');

  const fail = (err: unknown) =>
    toast({ title: 'Action failed', description: getApiErrorMessage(err), variant: 'destructive' });

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Shipment</span>
          <StatusBadge map={FULFILLMENT_STATUS} status={fulfillment.status} />
        </div>

        <Select
          value={fulfillment.status}
          disabled={statusBusy}
          onValueChange={(v) =>
            setStatus({ orderId, id: fulfillment.id, status: v as FulfillmentStatus })
              .unwrap()
              .then(() => toast({ title: 'Status updated' }))
              .catch(fail)
          }
        >
          <SelectTrigger className="w-44" aria-label="Shipment status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {FULFILLMENT_STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {fulfillment.items?.map((i) => `${i.description} × ${i.quantity}`).join(', ')}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label className="text-xs">Carrier</Label>
          <Input className="mt-1" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Tracking number</Label>
          <Input className="mt-1" value={number} onChange={(e) => setNumber(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Tracking URL</Label>
          <Input className="mt-1" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        disabled={trackingBusy}
        onClick={() =>
          setTracking({
            orderId,
            id: fulfillment.id,
            carrier,
            tracking_number: number,
            tracking_url: url,
          })
            .unwrap()
            .then(() => toast({ title: 'Tracking saved' }))
            .catch(fail)
        }
      >
        <Save className="mr-2 h-4 w-4" /> Save tracking
      </Button>
    </div>
  );
}
