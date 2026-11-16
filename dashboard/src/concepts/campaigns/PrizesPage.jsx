// Campaigns → Prizes: what brands owe contest winners, and whether it's paid.
// Lifecycle (enforced by the API): awaiting_funding → funded → paid, and
// awaiting_funding | funded → cancelled. Paid needs a payment reference.
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Medal, MagnifyingGlass, X } from '@phosphor-icons/react';
import { toast } from 'sonner';

import {
  useGetPrizesQuery,
  useSetPrizeStatusMutation,
  useDistributePrizesMutation,
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
  inputClass,
  selectClass,
  money,
  dateOnly,
  errorMessage,
} from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';

const LIMIT = 50;

const ACTIONS = {
  awaiting_funding: [
    { to: 'funded', label: 'Mark funded' },
    { to: 'cancelled', label: 'Cancel', danger: true },
  ],
  funded: [
    { to: 'paid', label: 'Mark paid' },
    { to: 'cancelled', label: 'Cancel', danger: true },
  ],
};

export const PrizesPage = () => {
  const { can } = useAuth();
  const canManage = can('prizes.manage');
  const [params, setParams] = useSearchParams();
  const contestId = params.get('contest') || '';

  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [pending, setPending] = useState(null); // { prize, to }

  const prizes = useGetPrizesQuery({ status, search, contest_id: contestId, limit: LIMIT, offset });
  const [setPrizeStatus, { isLoading: saving }] = useSetPrizeStatusMutation();
  const [distribute, { isLoading: distributing }] = useDistributePrizesMutation();

  const rows = prizes.data?.prizes ?? [];
  const totals = Object.fromEntries((prizes.data?.totals ?? []).map((t) => [t.status, t]));

  const apply = async (reference) => {
    try {
      await setPrizeStatus({
        id: pending.prize.id,
        status: pending.to,
        ...(pending.to === 'paid' ? { payment_reference: reference } : {}),
      }).unwrap();
      toast.success(`Prize marked ${pending.to}`);
      setPending(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the prize'));
    }
  };

  const recordWinners = async () => {
    try {
      const r = await distribute(contestId).unwrap();
      toast.success(`Recorded ${r?.prizes_recorded ?? 0} prize(s) for this contest`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not record prizes'));
    }
  };

  return (
    <PageShell title="Prizes" subtitle="Contest prizes brands owe to winners" testId="prizes-page">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Awaiting funding"
          tone="warning"
          value={totals.awaiting_funding?.count ?? 0}
          hint={money(totals.awaiting_funding?.amount_cents ?? 0)}
        />
        <StatCard label="Funded, unpaid" value={totals.funded?.count ?? 0} hint={money(totals.funded?.amount_cents ?? 0)} />
        <StatCard label="Paid" tone="success" value={totals.paid?.count ?? 0} hint={money(totals.paid?.amount_cents ?? 0)} />
        <StatCard label="Cancelled" value={totals.cancelled?.count ?? 0} hint={money(totals.cancelled?.amount_cents ?? 0)} />
      </div>

      <Panel>
        <form
          className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
            setOffset(0);
          }}
        >
          <div className="relative">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              aria-label="Search prizes"
              className={`${inputClass} pl-9`}
              placeholder="Search contest, winner or brand…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            aria-label="Status"
            className={selectClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">All statuses</option>
            <option value="awaiting_funding">Awaiting funding</option>
            <option value="funded">Funded</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button type="submit" size="sm" className="h-9 bg-white text-black hover:bg-zinc-200">
            Search
          </Button>
        </form>

        {contestId && (
          <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
            <span>Showing one contest.</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:text-white"
              onClick={() => {
                params.delete('contest');
                setParams(params);
              }}
            >
              <X className="h-3 w-3" /> Show all
            </button>
            {can('contests.manage') && (
              <Button
                size="sm"
                variant="outline"
                className="ml-auto h-7 border-zinc-700 text-zinc-200"
                disabled={distributing}
                onClick={recordWinners}
                title="Creates a prize record for each ranked winner, using the contest's prize table"
              >
                {distributing ? 'Recording…' : 'Record prizes for winners'}
              </Button>
            )}
          </div>
        )}

        <QueryState
          query={prizes}
          isEmpty={rows.length === 0}
          empty={
            <Empty
              icon={Medal}
              title="No prizes"
              description="Prizes appear once winners are announced and recorded for a contest."
            />
          }
        >
          <DataTable
            rows={rows}
            columns={[
              {
                key: 'contest',
                header: 'Contest',
                cell: (p) => (
                  <div className="min-w-[10rem]">
                    <Link to={`/opportunity/${p.contest_id}`} className="text-white hover:underline">
                      {p.contest_title}
                    </Link>
                    <p className="text-[11px] text-zinc-500">{p.brand_name}</p>
                  </div>
                ),
              },
              { key: 'rank', header: 'Rank', className: 'tabular-nums', cell: (p) => `#${p.rank}` },
              {
                key: 'winner',
                header: 'Winner',
                cell: (p) => (
                  <div>
                    <p className="text-zinc-200">{p.winner_username || '–'}</p>
                    <p className="text-[11px] text-zinc-500">{p.winner_email}</p>
                  </div>
                ),
              },
              {
                key: 'amount',
                header: 'Amount',
                className: 'text-right tabular-nums',
                cell: (p) => (p.prize_type === 'cash' ? money(p.amount_cents, p.currency || 'USD') : p.description || p.prize_type),
              },
              { key: 'status', header: 'Status', cell: (p) => <StatusPill status={p.status} /> },
              {
                key: 'when',
                header: 'Updated',
                className: 'whitespace-nowrap text-xs text-zinc-400',
                cell: (p) =>
                  p.paid_at ? (
                    <span title={p.payment_reference}>Paid {dateOnly(p.paid_at)}</span>
                  ) : p.funded_at ? (
                    `Funded ${dateOnly(p.funded_at)}`
                  ) : (
                    `Created ${dateOnly(p.created_at)}`
                  ),
              },
              {
                key: 'actions',
                header: <span className="sr-only">Actions</span>,
                cell: (p) =>
                  canManage && (
                    <div className="flex justify-end gap-1.5">
                      {(ACTIONS[p.status] || []).map((a) => (
                        <Button
                          key={a.to}
                          size="sm"
                          variant="outline"
                          className={
                            a.danger
                              ? 'h-7 border-red-900 text-red-300 hover:bg-red-950'
                              : 'h-7 border-zinc-700 text-zinc-200'
                          }
                          onClick={() => setPending({ prize: p, to: a.to })}
                        >
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  ),
              },
            ]}
          />
          <Pager offset={offset} limit={LIMIT} count={rows.length} onChange={setOffset} />
        </QueryState>
      </Panel>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={pending ? `Mark ${pending.prize.winner_username || 'winner'}'s prize ${pending.to}?` : ''}
        description={
          pending?.to === 'funded'
            ? 'Confirms the brand has paid this prize into the platform.'
            : pending?.to === 'paid'
              ? 'Confirms the winner has received the prize. Enter the transfer or payment reference.'
              : pending?.to === 'cancelled'
                ? 'The prize will no longer be owed. This cannot be undone.'
                : ''
        }
        input={
          pending?.to === 'paid'
            ? { label: 'Payment reference', placeholder: 'e.g. tr_1Q… or bank reference', required: true }
            : undefined
        }
        tone={pending?.to === 'cancelled' ? 'danger' : undefined}
        confirmLabel={pending ? `Mark ${pending.to}` : 'Confirm'}
        busy={saving}
        onConfirm={apply}
      />
    </PageShell>
  );
};

export default PrizesPage;
