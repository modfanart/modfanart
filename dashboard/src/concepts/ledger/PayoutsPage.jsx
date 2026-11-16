// Ledger → Payouts: money owed to sellers per order line.
// Segregation of duties (enforced by the API): payouts.manage prepares and
// fails payouts, payouts.approve marks them paid with a Stripe transfer id.
// Payouts 'on_hold' are frozen by an open chargeback and can't be paid.
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bank, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';

import { useGetPayoutsQuery, useMarkPayoutPaidMutation, useMarkPayoutFailedMutation } from '../../services/api/opsApi';
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
  money,
  dateOnly,
  errorMessage,
} from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const LIMIT = 100;
const TABS = [
  { id: 'pending', label: 'To pay' },
  { id: 'on_hold', label: 'On hold' },
  { id: 'paid', label: 'Paid' },
  { id: 'failed', label: 'Failed' },
  { id: '', label: 'All' },
];

export const PayoutsPage = () => {
  const { can } = useAuth();
  const canApprove = can('payouts.approve');
  const canManage = can('payouts.manage');
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? 'pending';
  const [offset, setOffset] = useState(0);
  const [action, setAction] = useState(null); // { payout, kind: 'paid' | 'failed' }

  const payouts = useGetPayoutsQuery({ status, limit: LIMIT, offset });
  const [markPaid, { isLoading: paying }] = useMarkPayoutPaidMutation();
  const [markFailed, { isLoading: failing }] = useMarkPayoutFailedMutation();
  const rows = payouts.data?.payouts ?? [];

  const sum = rows.reduce((n, p) => n + Number(p.net_cents || 0), 0);
  const noConnect = rows.filter((p) => p.status === 'pending' && !p.seller_stripe_connect_id).length;

  const confirm = async (ref) => {
    try {
      if (action.kind === 'paid') await markPaid({ id: action.payout.id, stripeTransferId: ref }).unwrap();
      else await markFailed({ id: action.payout.id }).unwrap();
      toast.success(`Payout marked ${action.kind}`);
      setAction(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the payout'));
    }
  };

  return (
    <PageShell title="Payouts" subtitle="What sellers are owed, and what's been sent" testId="payouts-page">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Payout status">
        {TABS.map((t) => (
          <button
            key={t.id || 'all'}
            role="tab"
            aria-selected={status === t.id}
            onClick={() => {
              params.set('status', t.id);
              setParams(params);
              setOffset(0);
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label={`Net on this page (${rows.length})`} value={money(sum)} />
        {status === 'pending' && (
          <StatCard
            label="Sellers without Stripe Connect"
            tone={noConnect ? 'warning' : undefined}
            value={noConnect}
            hint="They can't receive a transfer until they connect"
          />
        )}
      </div>

      {!canApprove && canManage && status === 'pending' && (
        <p className="flex items-center gap-2 text-xs text-zinc-400">
          <Warning className="h-4 w-4 text-amber-300" /> Marking payouts paid needs the separate “Approve payouts” permission.
        </p>
      )}

      <Panel>
        <QueryState query={payouts} isEmpty={rows.length === 0} empty={<Empty icon={Bank} title="No payouts here" />}>
          <DataTable
            rows={rows}
            columns={[
              {
                key: 'seller',
                header: 'Seller',
                cell: (p) => (
                  <div>
                    <p className="text-zinc-200">{p.seller_username || '–'}</p>
                    <p className="text-[11px] text-zinc-500">
                      {p.seller_email}
                      {!p.seller_stripe_connect_id && p.status === 'pending' && (
                        <span className="ml-1 text-amber-300">· no Stripe</span>
                      )}
                    </p>
                  </div>
                ),
              },
              {
                key: 'order',
                header: 'Order',
                cell: (p) => (
                  <div>
                    {p.order_number ? (
                      <Link to={`/storefront/orders?order=${p.order_id || ''}`} className="font-mono text-xs text-zinc-300 hover:underline">
                        {p.order_number}
                      </Link>
                    ) : (
                      <span className="text-zinc-500">–</span>
                    )}
                    <p className="line-clamp-1 max-w-[16rem] text-[11px] text-zinc-500">{p.item_description}</p>
                  </div>
                ),
              },
              { key: 'gross', header: 'Gross', className: 'text-right tabular-nums text-zinc-400', cell: (p) => money(p.gross_cents, p.currency) },
              { key: 'fee', header: 'Fee', className: 'text-right tabular-nums text-zinc-400', cell: (p) => money(p.platform_fee_cents, p.currency) },
              { key: 'net', header: 'Net', className: 'text-right font-medium tabular-nums', cell: (p) => money(p.net_cents, p.currency) },
              { key: 'status', header: 'Status', cell: (p) => <StatusPill status={p.status} /> },
              {
                key: 'when',
                header: 'Created',
                className: 'whitespace-nowrap text-xs text-zinc-500',
                cell: (p) => (
                  <span title={p.stripe_transfer_id || undefined}>
                    {dateOnly(p.created_at)}
                    {p.stripe_transfer_id && <span className="block font-mono text-[10px]">{p.stripe_transfer_id}</span>}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: <span className="sr-only">Actions</span>,
                cell: (p) => (
                  <div className="flex justify-end gap-1.5">
                    {p.status === 'pending' && canApprove && (
                      <Button
                        size="sm"
                        className="h-7 bg-emerald-600 text-white hover:bg-emerald-500"
                        onClick={() => setAction({ payout: p, kind: 'paid' })}
                      >
                        Mark paid
                      </Button>
                    )}
                    {['pending', 'on_hold'].includes(p.status) && canManage && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-red-900 text-red-300 hover:bg-red-950"
                        onClick={() => setAction({ payout: p, kind: 'failed' })}
                      >
                        Fail
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
          <Pager offset={offset} limit={LIMIT} count={rows.length} onChange={setOffset} />
        </QueryState>
      </Panel>

      <ConfirmDialog
        open={!!action}
        onOpenChange={(o) => !o && setAction(null)}
        title={
          action
            ? action.kind === 'paid'
              ? `Mark ${money(action.payout.net_cents, action.payout.currency)} to ${action.payout.seller_username} paid?`
              : 'Mark this payout failed?'
            : ''
        }
        description={
          action?.kind === 'paid'
            ? 'Send the transfer in Stripe first, then paste its id here for reconciliation.'
            : 'The seller will not be paid for this line. Use this for refunds or lost disputes.'
        }
        input={action?.kind === 'paid' ? { label: 'Stripe transfer id', placeholder: 'tr_…', required: true } : undefined}
        tone={action?.kind === 'failed' ? 'danger' : undefined}
        confirmLabel={action?.kind === 'paid' ? 'Mark paid' : 'Mark failed'}
        busy={paying || failing}
        onConfirm={confirm}
      />
    </PageShell>
  );
};

export default PayoutsPage;
