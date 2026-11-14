// Marketplace → Overview: the queues that need someone, at a glance.
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';

import { useGetMarketplaceOverviewQuery } from '../../services/api/opsApi';
import { useAuth } from '../../contexts/AuthContext';
import { PageShell, Panel, QueryState, StatCard, money } from '../../components/workspace/kit';

const Queue = ({ to, label, count, hint, perm, can }) => {
  if (perm && !can(perm)) return null;
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-800 px-4 py-3 hover:border-zinc-600 hover:bg-zinc-800/40"
    >
      <div>
        <p className="text-sm text-white">{label}</p>
        {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-lg font-semibold tabular-nums ${count ? 'text-amber-300' : 'text-zinc-500'}`}>
          {count ?? 0}
        </span>
        <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white" />
      </div>
    </Link>
  );
};

export const MarketplaceOverviewPage = () => {
  const { can } = useAuth();
  const overview = useGetMarketplaceOverviewQuery(undefined, { refetchOnMountOrArgChange: 30 });
  const d = overview.data || {};

  return (
    <PageShell title="Marketplace" subtitle="Listings, sellers, orders and money in the last 30 days" testId="marketplace-overview">
      <QueryState query={overview}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Orders (30 days)" value={d.orders?.last_30d ?? 0} />
          <StatCard label="GMV (30 days)" value={money(d.orders?.gmv_30d_cents ?? 0)} hint="Paid and fulfilled orders" />
          <StatCard
            label="Seller payouts pending"
            tone={d.payouts?.pending ? 'warning' : undefined}
            value={d.payouts?.pending ?? 0}
            hint={money(d.payouts?.pending_cents ?? 0)}
          />
          <StatCard
            label="Prizes outstanding"
            tone={d.prizes?.awaiting_funding ? 'warning' : undefined}
            value={money(d.prizes?.outstanding_cents ?? 0)}
            hint={`${d.prizes?.awaiting_funding ?? 0} awaiting brand funding`}
          />
        </div>

        <Panel title="Needs attention">
          <div className="grid gap-2 md:grid-cols-2">
            <Queue to="/storefront/products?status=pending_review" label="Listings to review" count={d.products?.pending_review} perm="merch.moderate" can={can} />
            <Queue to="/storefront/sellers?status=pending" label="Seller applications" count={d.sellers?.pending} perm="sellers.manage" can={can} />
            <Queue to="/storefront/orders?status=paid" label="Paid orders awaiting fulfilment" count={d.orders?.awaiting_fulfilment} perm={['orders.view_all', 'payouts.manage']} can={can} />
            <Queue to="/ledger/payouts?status=pending" label="Payouts to send" count={d.payouts?.pending} perm={['payouts.view', 'payouts.manage', 'payouts.approve']} can={can} />
            <Queue to="/ledger/payouts?status=on_hold" label="Payouts on hold" hint="Held while a chargeback is open" count={d.payouts?.on_hold} perm={['payouts.view', 'payouts.manage']} can={can} />
            <Queue to="/ledger/disputes" label="Open disputes" count={d.disputes?.open} perm={['disputes.view', 'payouts.manage']} can={can} />
            <Queue to="/campaigns/prizes?status=awaiting_funding" label="Prizes awaiting funding" count={d.prizes?.awaiting_funding} perm={['prizes.manage', 'contests.manage', 'payouts.view']} can={can} />
          </div>
        </Panel>
      </QueryState>
    </PageShell>
  );
};

export default MarketplaceOverviewPage;
