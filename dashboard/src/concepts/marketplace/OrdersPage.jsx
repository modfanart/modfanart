// Marketplace → Orders: every order, with a detail drawer to follow
// fulfilment (status + tracking), cancel unpaid orders, and (re)generate
// seller payouts. Paid orders are refunded in Stripe, not from here.
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Receipt, Truck } from '@phosphor-icons/react';
import { toast } from 'sonner';

import {
  useGetAllOrdersQuery,
  useGetOrderDetailQuery,
  useGetOrderFulfillmentsQuery,
  useUpdateFulfillmentStatusMutation,
  useUpdateFulfillmentTrackingMutation,
  useCancelOrderMutation,
  useGenerateOrderPayoutsMutation,
} from '../../services/api/opsApi';
import { useAuth } from '../../contexts/AuthContext';
import {
  PageShell,
  Panel,
  QueryState,
  Empty,
  Pager,
  DataTable,
  StatusPill,
  StatCard,
  ConfirmDialog,
  Loading,
  ErrorState,
  Field,
  inputClass,
  money,
  dateTime,
  timeAgo,
  errorMessage,
} from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { cn } from '../../lib/utils';

const LIMIT = 50;
const STATUSES = ['pending', 'paid', 'fulfilled', 'disputed', 'refunded', 'failed'];
const FULFILMENT_STATUSES = ['pending', 'in_production', 'shipped', 'delivered', 'failed', 'returned'];

const Fulfilment = ({ orderId, f, canEdit }) => {
  const [carrier, setCarrier] = useState(f.carrier || '');
  const [tracking, setTracking] = useState(f.tracking_number || '');
  const [url, setUrl] = useState(f.tracking_url || '');
  const [setStatus, { isLoading: s1 }] = useUpdateFulfillmentStatusMutation();
  const [setTrackingInfo, { isLoading: s2 }] = useUpdateFulfillmentTrackingMutation();

  const changeStatus = async (status) => {
    try {
      await setStatus({ orderId, id: f.id, status }).unwrap();
      toast.success(`Fulfilment ${status.replace('_', ' ')}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the fulfilment'));
    }
  };

  const saveTracking = async (e) => {
    e.preventDefault();
    try {
      await setTrackingInfo({ orderId, id: f.id, carrier, tracking_number: tracking, tracking_url: url }).unwrap();
      toast.success('Tracking saved');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save tracking'));
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Truck className="h-4 w-4 text-zinc-400" />
          <StatusPill status={f.status} />
          <span className="text-xs text-zinc-500">{(f.items || []).length} item(s)</span>
        </div>
        {canEdit && (
          <select
            aria-label="Fulfilment status"
            className="h-8 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-xs text-white"
            value={f.status}
            disabled={s1}
            onChange={(e) => changeStatus(e.target.value)}
          >
            {FULFILMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        )}
      </div>
      {f.tracking_url && (
        <a href={f.tracking_url} target="_blank" rel="noreferrer noopener" className="text-xs text-sky-400 hover:underline">
          Track {f.carrier} {f.tracking_number}
        </a>
      )}
      {canEdit && (
        <form onSubmit={saveTracking} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input aria-label="Carrier" className={inputClass} placeholder="Carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
          <input aria-label="Tracking number" className={inputClass} placeholder="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} />
          <Button type="submit" size="sm" variant="outline" className="h-9 border-zinc-700 text-zinc-200" disabled={s2}>
            Save
          </Button>
          <input
            aria-label="Tracking URL"
            className={cn(inputClass, 'sm:col-span-3')}
            placeholder="Tracking URL (https://…)"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </form>
      )}
    </div>
  );
};

const OrderDrawer = ({ id, onClose }) => {
  const { can } = useAuth();
  const detail = useGetOrderDetailQuery(id, { skip: !id });
  const fulfilments = useGetOrderFulfillmentsQuery(id, { skip: !id });
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const [generate, { isLoading: generating }] = useGenerateOrderPayoutsMutation();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const o = detail.data?.order;
  const canFulfil = can('orders.confirm');

  const doCancel = async () => {
    try {
      await cancelOrder(id).unwrap();
      toast.success('Order cancelled and stock released');
      setConfirmCancel(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not cancel the order'));
    }
  };

  const doGenerate = async () => {
    try {
      const r = await generate(id).unwrap();
      const n = r?.payouts?.length ?? r?.created ?? null;
      toast.success(n != null ? `${n} payout(s) ready` : 'Payouts generated');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not generate payouts'));
    }
  };

  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-zinc-800 bg-zinc-900 text-white sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-white">Order {o?.order_number || ''}</SheetTitle>
          <SheetDescription className="text-zinc-400">{o ? dateTime(o.created_at) : ''}</SheetDescription>
        </SheetHeader>
        {detail.isLoading ? (
          <Loading />
        ) : detail.isError ? (
          <ErrorState error={detail.error} onRetry={detail.refetch} />
        ) : o ? (
          <div className="mt-6 space-y-6 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill status={o.status} />
              <span className="text-lg font-semibold tabular-nums">{money(o.total_cents, o.currency)}</span>
              <span className="text-xs text-zinc-500">by {o.buyer_username || 'unknown buyer'}</span>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">Items</p>
              <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
                {(o.items || []).map((i) => (
                  <li key={i.id} className="flex items-center gap-3 px-3 py-2">
                    {i.image_url ? (
                      <img src={i.image_url} alt="" className="h-10 w-10 rounded object-cover" loading="lazy" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-zinc-800" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-zinc-200">
                        {i.merch_product_id ? (
                          <Link to={`/storefront/product/${i.merch_product_id}`} className="hover:underline">
                            {i.product_title || i.description}
                          </Link>
                        ) : (
                          i.artwork_title || i.description || 'Licence'
                        )}
                      </p>
                      <p className="truncate text-[11px] text-zinc-500">
                        {[i.sku, i.size, i.color].filter(Boolean).join(' · ') || i.item_type}
                        {i.seller_username ? ` · sold by ${i.seller_username}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 tabular-nums text-zinc-300">
                      {i.quantity} × {money(i.unit_price_cents, o.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {o.shipping_address && (
              <div>
                <p className="mb-1 text-xs font-medium text-zinc-400">Ship to</p>
                <p className="whitespace-pre-line text-xs text-zinc-300">
                  {[
                    o.shipping_address.full_name || o.shipping_address.name,
                    o.shipping_address.line1,
                    o.shipping_address.line2,
                    [o.shipping_address.city, o.shipping_address.state, o.shipping_address.postal_code].filter(Boolean).join(', '),
                    o.shipping_address.country,
                  ]
                    .filter(Boolean)
                    .join('\n')}
                </p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">Fulfilment</p>
              {fulfilments.isLoading ? (
                <Loading />
              ) : (fulfilments.data?.fulfillments ?? []).length === 0 ? (
                <p className="text-xs text-zinc-500">
                  {o.status === 'paid' ? 'The seller has not started fulfilment yet.' : 'No fulfilments for this order.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {fulfilments.data.fulfillments.map((f) => (
                    <Fulfilment key={`${f.id}-${f.updated_at || f.status}`} orderId={id} f={f} canEdit={canFulfil} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
              {o.status === 'pending' && can('marketplace.manage') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-900 text-red-300 hover:bg-red-950"
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancel unpaid order
                </Button>
              )}
              {['paid', 'fulfilled'].includes(o.status) && can('payouts.manage') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-200"
                  disabled={generating}
                  onClick={doGenerate}
                  title="Creates any missing seller payouts for this order. Safe to repeat."
                >
                  {generating ? 'Generating…' : 'Generate seller payouts'}
                </Button>
              )}
              <Link
                to={`/admin/activity-logs?q=${id}`}
                className="ml-auto self-center text-xs text-sky-400 hover:underline"
              >
                Order history
              </Link>
            </div>
          </div>
        ) : null}

        <ConfirmDialog
          open={confirmCancel}
          onOpenChange={setConfirmCancel}
          title="Cancel this unpaid order?"
          description="The order is marked failed and reserved stock is released."
          tone="danger"
          confirmLabel="Cancel order"
          busy={cancelling}
          onConfirm={doCancel}
        />
      </SheetContent>
    </Sheet>
  );
};

export const OrdersPage = () => {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const openId = params.get('order');
  const [offset, setOffset] = useState(0);

  const orders = useGetAllOrdersQuery({ status, limit: LIMIT, offset });
  const rows = orders.data?.orders ?? [];
  const totals = Object.fromEntries((orders.data?.totals ?? []).map((t) => [t.status, t]));

  const setParam = (k, v) => {
    if (v) params.set(k, v);
    else params.delete(k);
    setParams(params);
  };

  return (
    <PageShell title="Orders" subtitle="Every marketplace order" testId="orders-page">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Awaiting payment" value={totals.pending?.count ?? 0} hint={money(totals.pending?.total_cents ?? 0)} />
        <StatCard
          label="Paid, to fulfil"
          tone={totals.paid?.count ? 'warning' : undefined}
          value={totals.paid?.count ?? 0}
          hint={money(totals.paid?.total_cents ?? 0)}
        />
        <StatCard label="Fulfilled" tone="success" value={totals.fulfilled?.count ?? 0} hint={money(totals.fulfilled?.total_cents ?? 0)} />
        <StatCard
          label="Disputed / refunded"
          tone={totals.disputed?.count ? 'danger' : undefined}
          value={(totals.disputed?.count ?? 0) + (totals.refunded?.count ?? 0)}
        />
      </div>

      <Panel
        right={
          <select
            aria-label="Order status"
            className="h-8 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-xs text-white"
            value={status}
            onChange={(e) => {
              setParam('status', e.target.value);
              setOffset(0);
            }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        }
        title="Orders"
      >
        <QueryState query={orders} isEmpty={rows.length === 0} empty={<Empty icon={Receipt} title="No orders" />}>
          <DataTable
            rows={rows}
            onRowClick={(o) => setParam('order', o.id)}
            columns={[
              {
                key: 'number',
                header: 'Order',
                cell: (o) => <span className="font-mono text-xs text-white">{o.order_number || o.id.slice(0, 8)}</span>,
              },
              {
                key: 'buyer',
                header: 'Buyer',
                cell: (o) => (
                  <div>
                    <p className="text-zinc-200">{o.buyer_username || '–'}</p>
                    <p className="text-[11px] text-zinc-500">{o.buyer_email}</p>
                  </div>
                ),
              },
              {
                key: 'items',
                header: 'Items',
                cell: (o) => (
                  <span className="line-clamp-1 max-w-xs text-zinc-400">
                    {(o.items || []).map((i) => i.product_title || i.artwork_title || i.description).filter(Boolean).join(', ') || '–'}
                  </span>
                ),
              },
              { key: 'total', header: 'Total', className: 'text-right tabular-nums', cell: (o) => money(o.total_cents, o.currency) },
              { key: 'status', header: 'Status', cell: (o) => <StatusPill status={o.status} /> },
              { key: 'when', header: 'Placed', className: 'whitespace-nowrap text-xs text-zinc-500', cell: (o) => timeAgo(o.created_at) },
            ]}
          />
          <Pager
            offset={offset}
            limit={LIMIT}
            total={status ? totals[status]?.count : Object.values(totals).reduce((n, t) => n + t.count, 0)}
            count={rows.length}
            onChange={setOffset}
          />
        </QueryState>
      </Panel>

      <OrderDrawer id={openId} onClose={() => setParam('order', '')} />
    </PageShell>
  );
};

export default OrdersPage;
