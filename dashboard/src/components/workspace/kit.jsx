// Shared building blocks for workspace pages (activity logs, RBAC matrix,
// campaigns and marketplace operations). Same dark zinc look as the rest of
// the workspace; keeps loading / empty / error / pagination behaviour
// identical on every page.
import React, { useState } from 'react';
import { WarningCircle, ArrowClockwise, Tray, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Header } from '../layout/Header';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export const PageShell = ({ title, subtitle, actions, children, testId }) => (
  <div className="min-h-screen" data-testid={testId}>
    <Header title={title} subtitle={subtitle} />
    <div className="p-4 sm:p-6 space-y-6">
      {actions && <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>}
      {children}
    </div>
  </div>
);

export const Panel = ({ title, description, right, children, className, bodyClassName }) => (
  <section className={cn('rounded-xl border border-zinc-800 bg-zinc-900', className)}>
    {(title || right) && (
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
          {description && <p className="mt-0.5 text-xs text-zinc-400">{description}</p>}
        </div>
        {right}
      </div>
    )}
    <div className={cn('p-4 sm:p-5', bodyClassName)}>{children}</div>
  </section>
);

const TONES = {
  neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  info: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  danger: 'bg-red-500/10 text-red-300 border-red-500/30',
  brand: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
};

export const Pill = ({ tone = 'neutral', children, className }) => (
  <span
    className={cn(
      'inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize',
      TONES[tone] || TONES.neutral,
      className
    )}
  >
    {children}
  </span>
);

/** Map of status -> tone shared across pages. */
export const STATUS_TONE = {
  // generic
  pending: 'warning', pending_review: 'warning', awaiting_funding: 'warning', open: 'warning',
  on_hold: 'danger', disputed: 'danger', failed: 'danger', rejected: 'danger', suspended: 'danger',
  cancelled: 'neutral', archived: 'neutral', draft: 'neutral', refunded: 'neutral', lost: 'danger',
  paid: 'success', fulfilled: 'success', published: 'success', approved: 'success', active: 'success',
  funded: 'info', live: 'success', judging: 'brand', completed: 'info', won: 'success',
  shipped: 'info', delivered: 'success', processing: 'info',
  interview_scheduled: 'brand', in_production: 'info', returned: 'danger', ok: 'success',
};

export const StatusPill = ({ status }) => (
  <Pill tone={STATUS_TONE[status] || 'neutral'}>{String(status || 'unknown').replace(/_/g, ' ')}</Pill>
);

export const StatCard = ({ label, value, hint, tone }) => (
  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
    <p className="text-xs text-zinc-400">{label}</p>
    <p
      className={cn(
        'mt-1 text-2xl font-semibold tabular-nums text-white',
        tone === 'danger' && 'text-red-300',
        tone === 'warning' && 'text-amber-300',
        tone === 'success' && 'text-emerald-300'
      )}
    >
      {value ?? '–'}
    </p>
    {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
  </div>
);

export const Loading = ({ label = 'Loading…' }) => (
  <div className="flex h-48 items-center justify-center gap-3 text-sm text-zinc-400">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
    {label}
  </div>
);

export const Empty = ({ title = 'Nothing here yet', description, icon: Icon = Tray, children }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-14 text-center">
    <Icon weight="duotone" className="mb-3 h-10 w-10 text-zinc-600" />
    <p className="text-sm font-medium text-zinc-300">{title}</p>
    {description && <p className="mt-1 max-w-md text-xs text-zinc-500">{description}</p>}
    {children && <div className="mt-4">{children}</div>}
  </div>
);

export function errorMessage(error, fallback = 'Something went wrong.') {
  return (
    error?.data?.error ||
    error?.data?.message ||
    (typeof error?.error === 'string' ? error.error : null) ||
    error?.message ||
    fallback
  );
}

export const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-red-900/60 bg-red-950/20 py-12 text-center">
    <WarningCircle weight="duotone" className="mb-3 h-10 w-10 text-red-400" />
    <p className="text-sm font-medium text-red-200">
      {error?.status === 403 ? "Your role doesn't have access to this data." : "Couldn't load this data."}
    </p>
    <p className="mt-1 max-w-md text-xs text-red-300/70">{errorMessage(error)}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 border-zinc-700 text-zinc-200">
        <ArrowClockwise className="mr-2 h-4 w-4" /> Try again
      </Button>
    )}
  </div>
);

/** Renders loading / error / empty / children for a query result. */
export const QueryState = ({ query, isEmpty, empty, children }) => {
  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (isEmpty) return empty ?? <Empty />;
  return children;
};

export const Pager = ({ offset, limit, total, count, onChange }) => {
  const from = total === 0 || count === 0 ? 0 : offset + 1;
  const to = offset + (count ?? 0);
  const hasMore = total != null ? to < total : count === limit;
  return (
    <div className="flex items-center justify-between gap-3 pt-3 text-xs text-zinc-400">
      <span className="tabular-nums">
        {from}–{to}
        {total != null ? ` of ${total.toLocaleString()}` : ''}
      </span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-zinc-700 text-zinc-200"
          disabled={offset === 0}
          onClick={() => onChange(Math.max(0, offset - limit))}
        >
          <CaretLeft className="h-4 w-4" /> Prev
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-zinc-700 text-zinc-200"
          disabled={!hasMore}
          onClick={() => onChange(offset + limit)}
        >
          Next <CaretRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

/** Simple data table with consistent styling. columns: [{ key, header, cell, className }] */
export const DataTable = ({ columns, rows, rowKey = 'id', onRowClick, dense }) => (
  <div className="overflow-x-auto rounded-lg border border-zinc-800">
    <table className="w-full text-left text-sm">
      <thead className="bg-zinc-950/60 text-xs uppercase tracking-wide text-zinc-500">
        <tr>
          {columns.map((c) => (
            <th key={c.key} scope="col" className={cn('whitespace-nowrap px-3 py-2.5 font-medium', c.className)}>
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800">
        {rows.map((r) => (
          <tr
            key={typeof rowKey === 'function' ? rowKey(r) : r[rowKey]}
            className={cn('text-zinc-200', onRowClick && 'cursor-pointer hover:bg-zinc-800/50')}
            onClick={onRowClick ? () => onRowClick(r) : undefined}
          >
            {columns.map((c) => (
              <td key={c.key} className={cn('px-3', dense ? 'py-2' : 'py-3', 'align-top', c.className)}>
                {c.cell ? c.cell(r) : r[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Confirm dialog with an optional text input (e.g. a reason or reference). */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'default',
  input,
  onConfirm,
  busy,
}) => {
  const [value, setValue] = useState('');
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setValue('');
        onOpenChange(o);
      }}
    >
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription className="text-zinc-400">{description}</DialogDescription>}
        </DialogHeader>
        {input && (
          <div className="space-y-1.5">
            <label htmlFor="confirm-input" className="text-xs text-zinc-400">
              {input.label}
            </label>
            <input
              id="confirm-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={input.placeholder}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" className="text-zinc-300" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={busy || (input?.required && !value.trim())}
            className={tone === 'danger' ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-white text-black hover:bg-zinc-200'}
            onClick={() => onConfirm(value.trim())}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const Field = ({ label, htmlFor, hint, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="text-xs font-medium text-zinc-400">
      {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-zinc-500">{hint}</p>}
  </div>
);

export const inputClass =
  'h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-zinc-500';

export const selectClass =
  'h-9 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-sm text-white outline-none focus:border-zinc-500';

// ── formatting ─────────────────────────────────────────────────────────
export const money = (cents, currency = 'USD') =>
  cents == null
    ? '–'
    : (Number(cents) / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });

export const dateTime = (v) =>
  v ? new Date(v).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '–';

export const dateOnly = (v) => (v ? new Date(v).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '–');

export const timeAgo = (v) => {
  if (!v) return '–';
  const s = Math.round((Date.now() - new Date(v).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return dateOnly(v);
};
