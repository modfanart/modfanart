// Directory → Brand requests: companies applying to run contests and sell
// as a verified brand.
//
// Before: approving always failed on the server (the handler called helpers
// that didn't exist), "Reject" had no handler or endpoint, "View Workflow"
// linked to a route that doesn't exist, and every status was listed under a
// "pending requests" count.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Buildings, Globe, EnvelopeSimple, Phone } from '@phosphor-icons/react';
import { toast } from 'sonner';

import {
  useGetBrandRequestsQuery,
  useApproveBrandRequestMutation,
  useRejectBrandRequestMutation,
} from '../../services/api/opsApi';
import {
  PageShell,
  QueryState,
  Empty,
  StatusPill,
  ConfirmDialog,
  dateTime,
  errorMessage,
} from '../../components/workspace/kit';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'interview_scheduled', label: 'Interview' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: '', label: 'All' },
];

const safeUrl = (u) => {
  if (!u) return null;
  const v = /^https?:\/\//i.test(u) ? u : `https://${u}`;
  try {
    const url = new URL(v);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
};

const BrandVerificationRequestsPage = () => {
  const [status, setStatus] = useState('pending');
  const [action, setAction] = useState(null); // { req, kind }
  const requests = useGetBrandRequestsQuery({ status });
  const [approve, { isLoading: approving }] = useApproveBrandRequestMutation();
  const [reject, { isLoading: rejecting }] = useRejectBrandRequestMutation();
  const rows = requests.data ?? [];

  const confirm = async (text) => {
    const { req, kind } = action;
    try {
      if (kind === 'approve') {
        const r = await approve({ id: req.id, notes: text || undefined }).unwrap();
        toast.success(r?.message || `${req.company_name} approved`);
      } else {
        await reject({ id: req.id, notes: text }).unwrap();
        toast.success(`${req.company_name} rejected`);
      }
      setAction(null);
    } catch (err) {
      toast.error(errorMessage(err, kind === 'approve' ? 'Approval failed' : 'Rejection failed'));
    }
  };

  return (
    <PageShell title="Brand requests" subtitle="Companies applying to become verified brands" testId="brand-verification-requests-page">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Request status">
        {TABS.map((t) => (
          <button
            key={t.id || 'all'}
            role="tab"
            aria-selected={status === t.id}
            onClick={() => setStatus(t.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs',
              status === t.id ? 'border-white bg-white text-black' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <QueryState
        query={requests}
        isEmpty={rows.length === 0}
        empty={<Empty icon={Buildings} title={status === 'pending' ? 'No applications waiting' : 'Nothing here'} />}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((req) => {
            const site = safeUrl(req.website);
            const open = req.status === 'pending' || req.status === 'interview_scheduled';
            return (
              <article key={req.id} className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">{req.company_name}</h3>
                    <p className="text-xs text-zinc-500">Applied {dateTime(req.created_at)}</p>
                  </div>
                  <StatusPill status={req.status} />
                </div>

                <dl className="mt-4 space-y-1.5 text-sm">
                  {site && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Globe className="h-4 w-4 shrink-0 text-zinc-500" />
                      <a href={site} target="_blank" rel="noreferrer noopener" className="truncate text-sky-400 hover:underline">
                        {req.website}
                      </a>
                    </div>
                  )}
                  {req.contact_email && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <EnvelopeSimple className="h-4 w-4 shrink-0 text-zinc-500" />
                      <a href={`mailto:${req.contact_email}`} className="truncate hover:underline">
                        {req.contact_email}
                      </a>
                    </div>
                  )}
                  {req.contact_phone && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Phone className="h-4 w-4 shrink-0 text-zinc-500" />
                      {req.contact_phone}
                    </div>
                  )}
                </dl>

                {req.description && <p className="mt-3 line-clamp-4 text-sm text-zinc-400">{req.description}</p>}

                {(req.team_size || req.how_heard) && (
                  <p className="mt-2 text-xs text-zinc-500">
                    {req.team_size && <>Team: {req.team_size}</>}
                    {req.team_size && req.how_heard && ' · '}
                    {req.how_heard && <>Found us via {req.how_heard}</>}
                  </p>
                )}

                {Array.isArray(req.documents) && req.documents.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {req.documents.map((doc, i) => {
                      const href = safeUrl(typeof doc === 'string' ? doc : doc?.url);
                      const name = typeof doc === 'string' ? doc.split('/').pop() : doc?.name || `Document ${i + 1}`;
                      return href ? (
                        <a
                          key={i}
                          href={href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="rounded bg-zinc-800 px-2 py-1 text-xs text-sky-300 hover:bg-zinc-700"
                        >
                          {name}
                        </a>
                      ) : (
                        <span key={i} className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                          {name}
                        </span>
                      );
                    })}
                  </div>
                )}

                {req.notes && (
                  <p className="mt-3 whitespace-pre-line border-l-2 border-zinc-700 pl-3 text-xs text-zinc-400">{req.notes}</p>
                )}

                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  {open && (
                    <>
                      <Button className="flex-1 bg-white text-black hover:bg-zinc-200" onClick={() => setAction({ req, kind: 'approve' })}>
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-900 text-red-300 hover:bg-red-950"
                        onClick={() => setAction({ req, kind: 'reject' })}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  <Link
                    to={`/admin/activity-logs?q=${req.id}`}
                    className="self-center text-xs text-sky-400 hover:underline"
                  >
                    History
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </QueryState>

      <ConfirmDialog
        open={!!action}
        onOpenChange={(o) => !o && setAction(null)}
        title={action ? `${action.kind === 'approve' ? 'Approve' : 'Reject'} ${action.req.company_name}?` : ''}
        description={
          action?.kind === 'approve'
            ? `Creates the brand and makes the applicant's MOD account (${action.req.contact_email}) its owner. They need to have signed up with that email.`
            : 'The applicant is told the reason.'
        }
        input={
          action?.kind === 'approve'
            ? { label: 'Internal note (optional)' }
            : { label: 'Reason', placeholder: 'e.g. Could not verify company registration', required: true }
        }
        tone={action?.kind === 'reject' ? 'danger' : undefined}
        confirmLabel={action?.kind === 'approve' ? 'Approve' : 'Reject'}
        busy={approving || rejecting}
        onConfirm={confirm}
      />
    </PageShell>
  );
};

export default BrandVerificationRequestsPage;
