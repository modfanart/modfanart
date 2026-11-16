// Marketplace → Seller applications: approve, reject or suspend sellers.
// Suspending (or rejecting) pulls the seller's live standalone listings;
// re-approving a suspended seller puts them back (handled by the API).
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Storefront, MagnifyingGlass, CheckCircle, XCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { useGetSellerProfilesQuery, useSetSellerStatusMutation } from '../../services/api/opsApi';
import {
  PageShell,
  Panel,
  QueryState,
  Empty,
  DataTable,
  StatusPill,
  ConfirmDialog,
  inputClass,
  money,
  dateOnly,
  errorMessage,
} from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'suspended', label: 'Suspended' },
  { id: 'rejected', label: 'Rejected' },
  { id: '', label: 'All' },
];

const ACTIONS = {
  pending: [
    { to: 'approved', label: 'Approve' },
    { to: 'rejected', label: 'Reject', danger: true },
  ],
  approved: [{ to: 'suspended', label: 'Suspend', danger: true }],
  suspended: [{ to: 'approved', label: 'Reinstate' }],
  rejected: [{ to: 'approved', label: 'Approve' }],
};

export const SellerApplicationsPage = () => {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? 'pending';
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [action, setAction] = useState(null);

  const sellers = useGetSellerProfilesQuery({ status, search });
  const [setSellerStatus, { isLoading }] = useSetSellerStatusMutation();
  const rows = sellers.data ?? [];

  const confirm = async (notes) => {
    try {
      await setSellerStatus({ id: action.seller.id, status: action.to, notes: notes || undefined }).unwrap();
      toast.success(`${action.seller.display_name || action.seller.username} ${action.to}`);
      setAction(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the seller'));
    }
  };

  return (
    <PageShell title="Seller applications" subtitle="Who can sell on the marketplace" testId="seller-applications-page">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Seller status">
        {TABS.map((t) => (
          <button
            key={t.id || 'all'}
            role="tab"
            aria-selected={status === t.id}
            onClick={() => {
              params.set('status', t.id);
              setParams(params);
            }}
            className={cn(
              'rounded-full border px-3 py-1 text-xs',
              status === t.id ? 'border-white bg-white text-black' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Panel>
        <form
          className="mb-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
          }}
        >
          <div className="relative flex-1">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              aria-label="Search sellers"
              className={`${inputClass} pl-9`}
              placeholder="Search shop name, username or email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" className="h-9 bg-white text-black hover:bg-zinc-200">
            Search
          </Button>
        </form>

        <QueryState
          query={sellers}
          isEmpty={rows.length === 0}
          empty={<Empty icon={Storefront} title={status === 'pending' ? 'No applications waiting' : 'No sellers here'} />}
        >
          <DataTable
            rows={rows}
            columns={[
              {
                key: 'name',
                header: 'Seller',
                cell: (s) => (
                  <div className="min-w-[10rem]">
                    <p className="font-medium text-white">{s.display_name || s.username}</p>
                    <p className="text-[11px] text-zinc-500">
                      @{s.username} · {s.email}
                    </p>
                    {s.notes && <p className="mt-1 text-[11px] italic text-zinc-500">“{s.notes}”</p>}
                  </div>
                ),
              },
              {
                key: 'payouts',
                header: 'Payouts',
                cell: (s) =>
                  s.stripe_connected ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                      <CheckCircle className="h-4 w-4" /> Stripe connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                      <XCircle className="h-4 w-4" /> Not connected
                    </span>
                  ),
              },
              {
                key: 'products',
                header: 'Live / total',
                className: 'tabular-nums text-zinc-300',
                cell: (s) => `${s.products_live} / ${s.products_total}`,
              },
              { key: 'gross', header: 'Sales', className: 'tabular-nums', cell: (s) => money(s.gross_cents) },
              { key: 'status', header: 'Status', cell: (s) => <StatusPill status={s.status} /> },
              {
                key: 'applied',
                header: 'Applied',
                className: 'whitespace-nowrap text-xs text-zinc-500',
                cell: (s) => dateOnly(s.created_at),
              },
              {
                key: 'actions',
                header: <span className="sr-only">Actions</span>,
                cell: (s) => (
                  <div className="flex justify-end gap-1.5">
                    {(ACTIONS[s.status] || []).map((a) => (
                      <Button
                        key={a.to}
                        size="sm"
                        variant="outline"
                        className={cn(
                          'h-7',
                          a.danger ? 'border-red-900 text-red-300 hover:bg-red-950' : 'border-zinc-700 text-zinc-200'
                        )}
                        onClick={() => setAction({ seller: s, to: a.to })}
                      >
                        {a.label}
                      </Button>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </QueryState>
      </Panel>

      <ConfirmDialog
        open={!!action}
        onOpenChange={(o) => !o && setAction(null)}
        title={action ? `${action.to === 'approved' ? 'Approve' : action.to === 'rejected' ? 'Reject' : 'Suspend'} ${action.seller.display_name || action.seller.username}?` : ''}
        description={
          action?.to === 'suspended'
            ? 'Their live listings are pulled from the shop until they are reinstated.'
            : action?.to === 'rejected'
              ? 'They are told why and cannot list products.'
              : 'They can list products for review.'
        }
        input={{
          label: action?.to === 'approved' ? 'Note (optional)' : 'Reason (shown to the seller)',
          required: action?.to !== 'approved',
        }}
        tone={action?.to === 'approved' ? undefined : 'danger'}
        confirmLabel="Confirm"
        busy={isLoading}
        onConfirm={confirm}
      />
    </PageShell>
  );
};

export default SellerApplicationsPage;
