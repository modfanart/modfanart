// Marketplace → Products: review new listings and manage live ones.
//   pending_review → approve / reject (with a note to the seller)
//   published ↔ suspended, any → archived, archived → draft (per the API)
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, MagnifyingGlass } from '@phosphor-icons/react';
import { toast } from 'sonner';

import {
  useGetAdminProductsQuery,
  useModerateProductMutation,
  useSetProductStatusMutation,
} from '../../services/api/opsApi';
import {
  PageShell,
  Panel,
  QueryState,
  Empty,
  Pager,
  DataTable,
  StatusPill,
  ConfirmDialog,
  inputClass,
  money,
  timeAgo,
  errorMessage,
} from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const LIMIT = 50;
const TABS = ['pending_review', 'published', 'suspended', 'rejected', 'draft', 'archived'];
const MOVES = {
  published: [
    { to: 'suspended', label: 'Suspend', danger: true },
    { to: 'archived', label: 'Archive' },
  ],
  suspended: [
    { to: 'published', label: 'Reinstate' },
    { to: 'archived', label: 'Archive' },
  ],
  draft: [{ to: 'archived', label: 'Archive' }],
  rejected: [{ to: 'archived', label: 'Archive' }],
  archived: [{ to: 'draft', label: 'Restore to draft' }],
};

const priceRange = (p) => {
  if (p.min_price_usd_cents == null) return '–';
  if (p.min_price_usd_cents === p.max_price_usd_cents) return money(p.min_price_usd_cents);
  return `${money(p.min_price_usd_cents)} – ${money(p.max_price_usd_cents)}`;
};

export const ProductsPage = () => {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || 'pending_review';
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [action, setAction] = useState(null); // { product, decision } | { product, to }

  const products = useGetAdminProductsQuery({ status, search, limit: LIMIT, offset });
  const [moderate, { isLoading: moderating }] = useModerateProductMutation();
  const [setStatus, { isLoading: moving }] = useSetProductStatusMutation();

  const rows = products.data?.products ?? [];
  const counts = Object.fromEntries((products.data?.counts ?? []).map((c) => [c.status, c.count]));

  const go = (s) => {
    params.set('status', s);
    setParams(params);
    setOffset(0);
  };

  const confirm = async (notes) => {
    const { product } = action;
    try {
      if (action.decision) {
        await moderate({ id: product.id, decision: action.decision, notes: notes || undefined }).unwrap();
        toast.success(`${product.title} ${action.decision}`);
      } else {
        await setStatus({ id: product.id, status: action.to }).unwrap();
        toast.success(`${product.title} → ${action.to}`);
      }
      setAction(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the listing'));
    }
  };

  return (
    <PageShell title="Products" subtitle="Review new listings and manage live ones" testId="products-page">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Listing status">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={status === t}
            onClick={() => go(t)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs capitalize',
              status === t ? 'border-white bg-white text-black' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
            )}
          >
            {t.replace('_', ' ')} <span className="ml-1 tabular-nums opacity-70">{counts[t] ?? 0}</span>
          </button>
        ))}
      </div>

      <Panel>
        <form
          className="mb-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
            setOffset(0);
          }}
        >
          <div className="relative flex-1">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              aria-label="Search products"
              className={`${inputClass} pl-9`}
              placeholder="Search title, seller or brand…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" className="h-9 bg-white text-black hover:bg-zinc-200">
            Search
          </Button>
        </form>

        <QueryState
          query={products}
          isEmpty={rows.length === 0}
          empty={
            <Empty
              icon={Package}
              title={status === 'pending_review' ? 'Review queue is clear' : 'No listings here'}
              description={status === 'pending_review' ? 'New listings appear here when sellers submit them.' : undefined}
            />
          }
        >
          <DataTable
            rows={rows}
            columns={[
              {
                key: 'title',
                header: 'Listing',
                cell: (p) => (
                  <div className="min-w-[12rem]">
                    <Link to={`/storefront/product/${p.id}`} className="font-medium text-white hover:underline">
                      {p.title}
                    </Link>
                    <p className="text-[11px] text-zinc-500">
                      {p.artwork_title ? `Artwork: ${p.artwork_title} · ` : ''}
                      {String(p.base_product_type || '').replace(/_/g, ' ')} · {String(p.fulfillment_type || '').replace(/_/g, ' ')}
                    </p>
                  </div>
                ),
              },
              {
                key: 'seller',
                header: 'Seller',
                cell: (p) => (
                  <div>
                    <p className="text-zinc-200">{p.seller_username || '–'}</p>
                    {p.brand_name && <p className="text-[11px] text-zinc-500">for {p.brand_name}</p>}
                  </div>
                ),
              },
              { key: 'price', header: 'Price', className: 'whitespace-nowrap tabular-nums', cell: priceRange },
              {
                key: 'variants',
                header: 'Variants / sold',
                className: 'tabular-nums text-zinc-400',
                cell: (p) => `${p.variant_count} / ${p.units_sold}`,
              },
              { key: 'status', header: 'Status', cell: (p) => <StatusPill status={p.status} /> },
              {
                key: 'updated',
                header: 'Updated',
                className: 'whitespace-nowrap text-xs text-zinc-500',
                cell: (p) => timeAgo(p.updated_at),
              },
              {
                key: 'actions',
                header: <span className="sr-only">Actions</span>,
                cell: (p) => (
                  <div className="flex justify-end gap-1.5">
                    {p.status === 'pending_review' ? (
                      <>
                        <Button
                          size="sm"
                          className="h-7 bg-emerald-600 text-white hover:bg-emerald-500"
                          onClick={() => setAction({ product: p, decision: 'approved' })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-red-900 text-red-300 hover:bg-red-950"
                          onClick={() => setAction({ product: p, decision: 'rejected' })}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      (MOVES[p.status] || []).map((m) => (
                        <Button
                          key={m.to}
                          size="sm"
                          variant="outline"
                          className={cn(
                            'h-7',
                            m.danger ? 'border-red-900 text-red-300 hover:bg-red-950' : 'border-zinc-700 text-zinc-200'
                          )}
                          onClick={() => setAction({ product: p, to: m.to })}
                        >
                          {m.label}
                        </Button>
                      ))
                    )}
                  </div>
                ),
              },
            ]}
          />
          <Pager offset={offset} limit={LIMIT} total={search ? undefined : counts[status]} count={rows.length} onChange={setOffset} />
        </QueryState>
      </Panel>

      <ConfirmDialog
        open={!!action}
        onOpenChange={(o) => !o && setAction(null)}
        title={
          action?.decision
            ? `${action.decision === 'approved' ? 'Approve' : 'Reject'} “${action.product.title}”?`
            : action
              ? `Move “${action.product.title}” to ${action.to}?`
              : ''
        }
        description={
          action?.decision === 'approved'
            ? 'The listing goes live in the shop.'
            : action?.decision === 'rejected'
              ? 'The seller is told why and can fix and resubmit.'
              : action?.to === 'suspended'
                ? 'The listing is pulled from the shop immediately. Existing orders are unaffected.'
                : undefined
        }
        input={
          action?.decision
            ? {
                label: action.decision === 'rejected' ? 'Reason for the seller (required)' : 'Note (optional)',
                placeholder: action.decision === 'rejected' ? 'e.g. Artwork licence does not cover apparel' : '',
                required: action.decision === 'rejected',
              }
            : undefined
        }
        tone={action?.decision === 'rejected' || action?.to === 'suspended' ? 'danger' : undefined}
        confirmLabel={action?.decision ? (action.decision === 'approved' ? 'Approve' : 'Reject') : 'Confirm'}
        busy={moderating || moving}
        onConfirm={confirm}
      />
    </PageShell>
  );
};

export default ProductsPage;
