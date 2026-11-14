// Activity logs: who did what, when, from where, with before/after values.
// Data: GET /api/audit (filters + pagination), /audit/facets, /audit/daily,
// /audit/:id (with old/new values), /audit/export (CSV).
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DownloadSimple, ClockCounterClockwise, X, MagnifyingGlass } from '@phosphor-icons/react';
import { toast } from 'sonner';

import {
  useGetAuditEventsQuery,
  useGetAuditEventQuery,
  useGetAuditFacetsQuery,
  useGetAuditDailyQuery,
  downloadAuditCsv,
} from '../../services/api/opsApi';
import {
  PageShell,
  Panel,
  Pill,
  QueryState,
  Empty,
  Pager,
  DataTable,
  Loading,
  ErrorState,
  inputClass,
  selectClass,
  dateTime,
  timeAgo,
} from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../components/ui/sheet';
import { currentToken } from '../../services/baseQuery';

const LIMIT = 50;
const RANGES = [
  { id: '24h', label: 'Last 24 hours', ms: 864e5 },
  { id: '7d', label: 'Last 7 days', ms: 7 * 864e5 },
  { id: '30d', label: 'Last 30 days', ms: 30 * 864e5 },
  { id: '90d', label: 'Last 90 days', ms: 90 * 864e5 },
  { id: 'all', label: 'All time', ms: null },
];

const verbTone = (action = '') => {
  if (action.endsWith('.denied')) return 'danger';
  if (action.endsWith('.deleted') || action.includes('revoked')) return 'danger';
  if (action.endsWith('.created')) return 'success';
  if (action.includes('permissions') || action.includes('role')) return 'brand';
  return 'info';
};

// Where to go in the workspace for an entity, when there's a page for it.
const entityLink = (type, id) => {
  if (!id) return null;
  return (
    {
      user: `/artist/${id}`,
      brand: `/brand/${id}`,
      contest: `/opportunity/${id}`,
      role: '/team-permissions/roles',
      merch_product: `/storefront/product/${id}`,
      order: `/storefront/orders?order=${id}`,
      payout: '/ledger/payouts',
      contest_prize: '/campaigns/prizes',
      fee_rule: '/ledger/pricing',
      seller: '/storefront/sellers',
    }[type] || null
  );
};

const ActivityChart = ({ data }) => {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex h-16 items-end gap-[3px]" aria-label="Events per day">
      {data.map((d) => (
        <div
          key={d.day}
          title={`${new Date(d.day).toLocaleDateString()}: ${d.count} events`}
          className="flex-1 rounded-sm bg-sky-500/60 hover:bg-sky-400"
          style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
        />
      ))}
    </div>
  );
};

const JsonBlock = ({ label, value }) =>
  value == null ? null : (
    <div>
      <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
      <pre className="max-h-72 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-[11px] leading-relaxed text-zinc-300">
        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );

const EventDetail = ({ id, onClose }) => {
  const q = useGetAuditEventQuery(id, { skip: !id });
  const e = q.data;
  const link = e ? entityLink(e.entity_type, e.entity_id) : null;
  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-zinc-800 bg-zinc-900 text-white sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-white">Event details</SheetTitle>
          <SheetDescription className="text-zinc-400">{e ? dateTime(e.created_at) : ''}</SheetDescription>
        </SheetHeader>
        {q.isLoading ? (
          <Loading />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={q.refetch} />
        ) : e ? (
          <div className="mt-6 space-y-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={verbTone(e.action)}>{e.action}</Pill>
              {e.status_code && (
                <Pill tone={e.status_code >= 400 ? 'danger' : 'success'}>HTTP {e.status_code}</Pill>
              )}
              <Pill>{e.source}</Pill>
            </div>
            {e.summary && <p className="text-zinc-200">{e.summary}</p>}
            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-xs">
              <dt className="text-zinc-500">Actor</dt>
              <dd className="text-zinc-200">
                {e.actor_username || e.actor_email || 'System'}
                {e.actor_role && <span className="ml-2 text-zinc-500">({e.actor_role})</span>}
              </dd>
              <dt className="text-zinc-500">Entity</dt>
              <dd className="break-all text-zinc-200">
                {e.entity_type || '–'}
                {e.entity_id && <span className="ml-1 font-mono text-zinc-400">{e.entity_id}</span>}
                {link && (
                  <Link to={link} className="ml-2 text-sky-400 hover:underline">
                    Open
                  </Link>
                )}
              </dd>
              <dt className="text-zinc-500">IP address</dt>
              <dd className="font-mono text-zinc-300">{e.ip_address || '–'}</dd>
              <dt className="text-zinc-500">User agent</dt>
              <dd className="break-all text-zinc-400">{e.user_agent || '–'}</dd>
              <dt className="text-zinc-500">Event id</dt>
              <dd className="font-mono text-zinc-500">{e.id}</dd>
            </dl>
            <JsonBlock label="Before" value={e.old_values} />
            <JsonBlock label="After / request" value={e.new_values} />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

export const ActivityLogsPage = () => {
  // Deep links such as ?entityType=role&q=<id> pre-fill the filters.
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [search, setSearch] = useState(params.get('q') || '');
  const [entityType, setEntityType] = useState(params.get('entityType') || '');
  const [actorId, setActorId] = useState('');
  const [outcome, setOutcome] = useState('');
  const [range, setRange] = useState('7d');
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);

  const from = useMemo(() => {
    const r = RANGES.find((x) => x.id === range);
    // Rounded to the minute so the query key is stable between renders.
    return r?.ms ? new Date(Math.floor((Date.now() - r.ms) / 60000) * 60000).toISOString() : undefined;
  }, [range]);

  const filters = { q: search, entityType, actorId, outcome, from };
  const events = useGetAuditEventsQuery({ ...filters, limit: LIMIT, offset });
  const facets = useGetAuditFacetsQuery();
  const daily = useGetAuditDailyQuery({ days: 30 });

  const reset = (fn) => (v) => {
    fn(v);
    setOffset(0);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const token = await currentToken();
      await downloadAuditCsv(filters, token);
    } catch (err) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const rows = events.data?.data ?? [];
  const hasFilters = search || entityType || actorId || outcome;

  return (
    <PageShell
      title="Activity logs"
      subtitle="Who did what, and when, across the platform and the workspace"
      testId="activity-logs-page"
    >
      <Panel title="Last 30 days" description="Events per day" bodyClassName="pt-3">
        {daily.isLoading ? <Loading /> : <ActivityChart data={daily.data} />}
      </Panel>

      <Panel
        title="Events"
        right={
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-700 text-zinc-200"
            onClick={exportCsv}
            disabled={exporting}
          >
            <DownloadSimple className="mr-2 h-4 w-4" /> {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        }
      >
        <form
          className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto_auto_auto_auto]"
          onSubmit={(ev) => {
            ev.preventDefault();
            setSearch(q.trim());
            setOffset(0);
          }}
        >
          <div className="relative">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              aria-label="Search activity"
              className={`${inputClass} pl-9`}
              placeholder="Search action, summary, id, username or email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select aria-label="Time range" className={selectClass} value={range} onChange={(e) => reset(setRange)(e.target.value)}>
            {RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <select aria-label="Entity type" className={selectClass} value={entityType} onChange={(e) => reset(setEntityType)(e.target.value)}>
            <option value="">All entities</option>
            {(facets.data?.entity_types ?? []).map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select aria-label="Actor" className={selectClass} value={actorId} onChange={(e) => reset(setActorId)(e.target.value)}>
            <option value="">Everyone</option>
            {(facets.data?.actors ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.username || a.email} ({a.count})
              </option>
            ))}
          </select>
          <select aria-label="Outcome" className={selectClass} value={outcome} onChange={(e) => reset(setOutcome)(e.target.value)}>
            <option value="">Any outcome</option>
            <option value="ok">Succeeded</option>
            <option value="failed">Denied / failed</option>
          </select>
          <Button type="submit" size="sm" className="h-9 bg-white text-black hover:bg-zinc-200">
            Search
          </Button>
        </form>

        {hasFilters && (
          <button
            type="button"
            className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
            onClick={() => {
              setQ('');
              setSearch('');
              setEntityType('');
              setActorId('');
              setOutcome('');
              setOffset(0);
            }}
          >
            <X className="h-3 w-3" /> Clear filters
          </button>
        )}

        <QueryState
          query={events}
          isEmpty={rows.length === 0}
          empty={
            <Empty
              icon={ClockCounterClockwise}
              title="No activity matches"
              description="Staff actions, role changes, approvals, payouts and denied attempts on sensitive endpoints appear here."
            />
          }
        >
          <DataTable
            dense
            rows={rows}
            onRowClick={(r) => setSelected(r.id)}
            columns={[
              {
                key: 'when',
                header: 'When',
                className: 'whitespace-nowrap',
                cell: (r) => (
                  <span title={dateTime(r.created_at)} className="text-zinc-400">
                    {timeAgo(r.created_at)}
                  </span>
                ),
              },
              {
                key: 'actor',
                header: 'Actor',
                cell: (r) => (
                  <div className="min-w-[8rem]">
                    <p className="text-zinc-200">{r.actor_username || r.actor_email || 'System'}</p>
                    {r.actor_role && <p className="text-[11px] text-zinc-500">{r.actor_role}</p>}
                  </div>
                ),
              },
              {
                key: 'action',
                header: 'Action',
                cell: (r) => <Pill tone={verbTone(r.action)}>{r.action}</Pill>,
              },
              {
                key: 'summary',
                header: 'Details',
                cell: (r) => <span className="line-clamp-2 text-zinc-300">{r.summary || '–'}</span>,
              },
              {
                key: 'entity',
                header: 'Entity',
                cell: (r) => (
                  <span className="text-xs text-zinc-400">
                    {r.entity_type?.replace(/_/g, ' ') || '–'}
                  </span>
                ),
              },
              {
                key: 'source',
                header: 'Source',
                cell: (r) => <span className="text-xs text-zinc-500">{r.source}</span>,
              },
            ]}
          />
          <Pager
            offset={offset}
            limit={LIMIT}
            total={events.data?.total}
            count={rows.length}
            onChange={setOffset}
          />
        </QueryState>
      </Panel>

      <EventDetail id={selected} onClose={() => setSelected(null)} />
    </PageShell>
  );
};

export default ActivityLogsPage;
