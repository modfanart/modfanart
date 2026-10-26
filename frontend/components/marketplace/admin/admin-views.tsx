'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ClipboardCheck, CircleDollarSign, Store, Users, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ProductImage } from '@/components/marketplace/product-image';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { StatTile } from '@/components/marketplace/seller/seller-overview';
import {
  getApiErrorMessage,
  useDecideSellerProfileMutation,
  useGenerateOrderPayoutsMutation,
  useGetAdminOrdersQuery,
  useGetAllPayoutsQuery,
  useGetPendingMerchProductsQuery,
  useGetSellerProfilesQuery,
  useMarkPayoutFailedMutation,
  useMarkPayoutPaidMutation,
  useModerateMerchProductMutation,
  type MerchProduct,
  type OrderStatus,
  type PayoutStatus,
  type SellerProfile,
  type SellerStatus,
} from '@/services/api/marketplaceApi';
import {
  FULFILLMENT_LABEL,
  ORDER_STATUS,
  PAYOUT_STATUS,
  SELLER_STATUS,
  formatDate,
  formatMoney,
  formatProductPrice,
  titleCase,
} from '@/lib/marketplace/format';

const ALL = 'all';

// ───────────────────────── overview ─────────────────────────

export function AdminOverview({ root }: { root: string }) {
  const { data: pending } = useGetPendingMerchProductsQuery();
  const { data: sellers } = useGetSellerProfilesQuery({ status: 'pending' });
  const { data: orders } = useGetAdminOrdersQuery({ limit: 1 });
  const { data: payouts } = useGetAllPayoutsQuery({ status: 'pending' });

  const paid = orders?.totals.find((t) => t.status === 'paid');
  const done = orders?.totals.find((t) => t.status === 'fulfilled');
  const revenue = (paid?.total_cents ?? 0) + (done?.total_cents ?? 0);
  const payoutDue = (payouts ?? []).reduce((s, p) => s + p.net_cents, 0);

  const cards = [
    { href: `${root}/moderation`, label: 'Listings to review', value: pending?.length ?? 0, icon: ClipboardCheck },
    { href: `${root}/sellers`, label: 'Seller applications', value: sellers?.length ?? 0, icon: Users },
    { href: `${root}/payouts`, label: 'Payouts due', value: formatMoney(payoutDue), icon: CircleDollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="block transition-transform hover:-translate-y-0.5">
            <StatTile label={c.label} value={c.value} icon={c.icon} />
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders by status</CardTitle>
          <CardDescription>
            Combined paid + completed volume: {formatMoney(revenue)} (mixed currencies shown as-is)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders?.totals.length ? (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {orders.totals.map((t) => (
                <div key={t.status} className="rounded-md border p-3">
                  <StatusBadge map={ORDER_STATUS} status={t.status} />
                  <p className="mt-2 text-2xl font-bold">{t.count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ───────────────────────── moderation ─────────────────────────

export function ModerationQueue() {
  const { toast } = useToast();
  const { data: products, isLoading } = useGetPendingMerchProductsQuery();
  const [moderate, { isLoading: busy }] = useModerateMerchProductMutation();

  const [target, setTarget] = useState<{ product: MerchProduct; decision: 'approved' | 'rejected' } | null>(null);
  const [notes, setNotes] = useState('');

  const confirm = async () => {
    if (!target) return;
    try {
      await moderate({ id: target.product.id, decision: target.decision, notes: notes || undefined }).unwrap();
      toast({ title: target.decision === 'approved' ? 'Listing published' : 'Listing rejected' });
      setTarget(null);
      setNotes('');
    } catch (err) {
      toast({ title: 'Action failed', description: getApiErrorMessage(err), variant: 'destructive' });
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading queue…</p>;

  return (
    <div className="space-y-4">
      {!products?.length ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          The queue is empty — nothing to review.
        </p>
      ) : (
        products.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-md border">
                <ProductImage src={p.image_url} alt={p.title} />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {titleCase(p.base_product_type)} · {FULFILLMENT_LABEL[p.fulfillment_type]} ·{' '}
                  {p.variant_count} variant{p.variant_count === 1 ? '' : 's'} ·{' '}
                  {formatProductPrice(p, 'INR')}
                </p>
                <p className="text-sm">
                  Seller: <span className="font-medium">{p.brand_name || p.seller_name}</span>
                  {p.artwork_title && <> · Artwork: {p.artwork_title}</>}
                  {p.license_id && <> · Third-party licensed artwork</>}
                </p>
                {p.description && <p className="line-clamp-3 text-sm text-muted-foreground">{p.description}</p>}
                <p className="text-xs text-muted-foreground">Submitted {formatDate(p.updated_at)}</p>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <Button size="sm" onClick={() => setTarget({ product: p, decision: 'approved' })}>
                  <Check className="mr-1 h-4 w-4" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => setTarget({ product: p, decision: 'rejected' })}>
                  <X className="mr-1 h-4 w-4" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {target?.decision === 'approved' ? 'Approve' : 'Reject'} “{target?.product.title}”?
            </DialogTitle>
            <DialogDescription>
              {target?.decision === 'approved'
                ? 'It becomes visible and purchasable on the marketplace immediately.'
                : 'The seller can edit and resubmit. Add a note explaining why.'}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={3}
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button disabled={busy} onClick={confirm} variant={target?.decision === 'rejected' ? 'destructive' : 'default'}>
            {busy ? 'Saving…' : 'Confirm'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ───────────────────────── sellers ─────────────────────────

export function SellerApprovals() {
  const { toast } = useToast();
  const [status, setStatus] = useState<SellerStatus | typeof ALL>('pending');
  const { data: profiles, isLoading } = useGetSellerProfilesQuery(
    status === ALL ? undefined : { status }
  );
  const [decide, { isLoading: busy }] = useDecideSellerProfileMutation();

  const act = (p: SellerProfile, next: Exclude<SellerStatus, 'pending'>) => {
    const notes =
      next === 'approved' ? undefined : (window.prompt(`Note for the seller (${next}):`) ?? undefined);

    decide({ id: p.id, status: next, notes })
      .unwrap()
      .then(() => toast({ title: `Seller ${next}` }))
      .catch((err) =>
        toast({ title: 'Action failed', description: getApiErrorMessage(err), variant: 'destructive' })
      );
  };

  return (
    <div className="space-y-4">
      <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <SelectTrigger className="w-48" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All sellers</SelectItem>
          {(Object.keys(SELLER_STATUS) as SellerStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {SELLER_STATUS[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !profiles?.length ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">No sellers here.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payout ready</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.display_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.username}
                    <br />
                    {p.email}
                  </TableCell>
                  <TableCell>
                    <StatusBadge map={SELLER_STATUS} status={p.status} />
                  </TableCell>
                  <TableCell>{p.payout_ready ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{formatDate(p.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {p.status !== 'approved' && (
                        <Button size="sm" disabled={busy} onClick={() => act(p, 'approved')}>
                          Approve
                        </Button>
                      )}
                      {p.status === 'pending' && (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => act(p, 'rejected')}>
                          Reject
                        </Button>
                      )}
                      {p.status === 'approved' && (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => act(p, 'suspended')}>
                          Suspend
                        </Button>
                      )}
                    </div>
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

// ───────────────────────── orders ─────────────────────────

export function AdminOrders() {
  const { toast } = useToast();
  const [status, setStatus] = useState<OrderStatus | typeof ALL>(ALL);
  const { data, isLoading } = useGetAdminOrdersQuery({
    ...(status === ALL ? {} : { status }),
    limit: 100,
  });
  const [generate, { isLoading: generating }] = useGenerateOrderPayoutsMutation();

  return (
    <div className="space-y-4">
      <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <SelectTrigger className="w-48" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {ORDER_STATUS[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !data?.orders.length ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">No orders.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.order_number}</TableCell>
                  <TableCell className="text-sm">
                    {o.buyer_username}
                    <br />
                    <span className="text-muted-foreground">{o.buyer_email}</span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {o.items.map((i) => i.product_title || i.artwork_title || i.description).join(', ')}
                  </TableCell>
                  <TableCell>{formatMoney(o.total_cents, o.currency)}</TableCell>
                  <TableCell>
                    <StatusBadge map={ORDER_STATUS} status={o.status} />
                  </TableCell>
                  <TableCell>{formatDate(o.created_at)}</TableCell>
                  <TableCell>
                    {['paid', 'fulfilled'].includes(o.status) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={generating}
                        title="Create any missing seller payouts for this order"
                        onClick={() =>
                          generate(o.id)
                            .unwrap()
                            .then(() => toast({ title: 'Payouts generated' }))
                            .catch((err) =>
                              toast({
                                title: 'Action failed',
                                description: getApiErrorMessage(err),
                                variant: 'destructive',
                              })
                            )
                        }
                      >
                        Generate payouts
                      </Button>
                    )}
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

// ───────────────────────── payouts ─────────────────────────

export function AdminPayouts() {
  const { toast } = useToast();
  const [status, setStatus] = useState<PayoutStatus | typeof ALL>('pending');
  const { data: payouts, isLoading } = useGetAllPayoutsQuery(status === ALL ? undefined : { status });
  const [markPaid, { isLoading: paying }] = useMarkPayoutPaidMutation();
  const [markFailed] = useMarkPayoutFailedMutation();

  const fail = (err: unknown) =>
    toast({ title: 'Action failed', description: getApiErrorMessage(err), variant: 'destructive' });

  return (
    <div className="space-y-4">
      <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <SelectTrigger className="w-48" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All payouts</SelectItem>
          {(Object.keys(PAYOUT_STATUS) as PayoutStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {PAYOUT_STATUS[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !payouts?.length ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">No payouts.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p) => {
                const cur = p.currency ?? 'INR';

                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className="font-medium">{p.seller_username}</span>
                      <br />
                      <span className="text-xs text-muted-foreground">{p.seller_email}</span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {p.order_number}
                      <br />
                      <span className="text-xs text-muted-foreground">{p.item_description}</span>
                    </TableCell>
                    <TableCell>{formatMoney(p.gross_cents, cur)}</TableCell>
                    <TableCell>{formatMoney(p.platform_fee_cents, cur)}</TableCell>
                    <TableCell className="font-medium">{formatMoney(p.net_cents, cur)}</TableCell>
                    <TableCell className="text-xs">
                      {p.seller_stripe_connect_id ? 'Connected' : <span className="text-destructive">Not connected</span>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge map={PAYOUT_STATUS} status={p.status} />
                    </TableCell>
                    <TableCell>
                      {p.status === 'pending' && (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            disabled={paying}
                            onClick={() => {
                              const ref = window.prompt('Stripe transfer ID (e.g. tr_…):');
                              if (!ref) return;
                              markPaid({ id: p.id, stripe_transfer_id: ref })
                                .unwrap()
                                .then(() => toast({ title: 'Marked as paid' }))
                                .catch(fail);
                            }}
                          >
                            Mark paid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markFailed(p.id).unwrap().catch(fail)}
                          >
                            Failed
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
