// Ledger → Disputes: card chargebacks from Stripe. Opening a dispute holds the
// affected seller payouts; winning releases them, losing fails them. These
// records are written by the Stripe webhook; this page is read-only.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scales } from '@phosphor-icons/react';

import { useGetDisputesQuery } from '../../services/api/opsApi';
import { PageShell, Panel, QueryState, Empty, Pager, DataTable, StatusPill, Pill, money, dateTime } from '../../components/workspace/kit';
import { cn } from '../../lib/utils';

const LIMIT = 50;
const TABS = [
  { id: 'open', label: 'Open' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
  { id: '', label: 'All' },
];

export const DisputesPage = () => {
  const [status, setStatus] = useState('open');
  const [offset, setOffset] = useState(0);
  const disputes = useGetDisputesQuery({ status, limit: LIMIT, offset });
  const rows = disputes.data ?? [];

  return (
    <PageShell title="Disputes" subtitle="Card chargebacks and their effect on seller payouts" testId="disputes-page">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Dispute outcome">
        {TABS.map((t) => (
          <button
            key={t.id || 'all'}
            role="tab"
            aria-selected={status === t.id}
            onClick={() => {
              setStatus(t.id);
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

      <Panel description="Respond to disputes in the Stripe dashboard. Outcomes sync here automatically.">
        <QueryState query={disputes} isEmpty={rows.length === 0} empty={<Empty icon={Scales} title="No disputes" />}>
          <DataTable
            rows={rows}
            columns={[
              {
                key: 'id',
                header: 'Dispute',
                cell: (d) => (
                  <div>
                    <p className="font-mono text-xs text-white">{d.stripe_dispute_id}</p>
                    <p className="text-[11px] text-zinc-500">{String(d.reason || '').replace(/_/g, ' ') || '–'}</p>
                  </div>
                ),
              },
              { key: 'amount', header: 'Amount', className: 'text-right tabular-nums', cell: (d) => money(d.amount_cents) },
              {
                key: 'orders',
                header: 'Orders',
                cell: (d) => (
                  <div className="flex flex-wrap gap-1">
                    {(d.orders || []).map((o) => (
                      <Link key={o.id} to={`/storefront/orders?order=${o.id}`} className="font-mono text-xs text-sky-400 hover:underline">
                        {o.order_number}
                      </Link>
                    ))}
                    {!(d.orders || []).length && <span className="text-zinc-500">–</span>}
                  </div>
                ),
              },
              { key: 'stripe', header: 'Stripe status', cell: (d) => <Pill>{String(d.status || '').replace(/_/g, ' ')}</Pill> },
              {
                key: 'outcome',
                header: 'Outcome',
                cell: (d) => (d.outcome ? <StatusPill status={d.outcome === 'won' ? 'won' : 'lost'} /> : <StatusPill status="open" />),
              },
              { key: 'opened', header: 'Opened', className: 'whitespace-nowrap text-xs text-zinc-500', cell: (d) => dateTime(d.created_at) },
            ]}
          />
          <Pager offset={offset} limit={LIMIT} count={rows.length} onChange={setOffset} />
        </QueryState>
      </Panel>
    </PageShell>
  );
};

export default DisputesPage;
