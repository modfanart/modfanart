import React, { useState } from 'react';
import {
  ArrowClockwise,
  ArrowSquareOut,
  CheckCircle,
  CircleNotch,
  Clock,
  Flag,
  Timer,
  Warning,
  WarningCircle,
  XCircle,
} from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';

import {
  useGetModerationMetricsQuery,
  useGetModerationQueueQuery,
} from '../../services/api/moderationApi';

import { fullSizeSrc, getApiErrorMessage } from './format';
import { QueueItem } from './QueueItem';
import { ResolveDialog } from './ResolveDialog';
import { ScreeningRulesPanel } from './ScreeningRulesPanel';

const PAGE_SIZE = 20;

const formatCount = value => new Intl.NumberFormat('en-US').format(value || 0);

// Reviews are often settled within the day, and "0 days" reads as no data.
const formatResolution = days => {
  if (typeof days !== 'number') return '—';
  if (days < 1) return `${Math.max(1, Math.round(days * 24))} h`;
  return `${days} days`;
};

// ────────────────────────────────────────────────
// Metrics strip
// ────────────────────────────────────────────────

const MetricTile = ({ label, value, icon: Icon, iconClassName }) => (
  <div className="min-w-0">
    <p className="flex items-center gap-1.5 text-xs text-zinc-500">
      <Icon size={14} weight="duotone" className={iconClassName} />
      <span className="truncate">{label}</span>
    </p>
    <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
      {value}
    </p>
  </div>
);

const MetricGroup = ({ title, children, columns, className = '' }) => (
  <Card className={`bg-zinc-950 border-zinc-800 ${className}`}>
    <CardContent className="p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
        {title}
      </p>
      <div className={`grid gap-4 ${columns}`}>{children}</div>
    </CardContent>
  </Card>
);

const MetricsStrip = () => {
  const { data, isLoading, isError, error, refetch } =
    useGetModerationMetricsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map(i => (
          <Card key={i} className="bg-zinc-950 border-zinc-800">
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-3 w-24 bg-zinc-800" />
              <Skeleton className="h-8 w-full bg-zinc-900" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <WarningCircle size={18} className="text-red-400" />
            Metrics unavailable —{' '}
            {getApiErrorMessage(error, 'failed to load metrics')}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <ArrowClockwise />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const decisions = data?.screening?.decisions || {};
  const runStatuses = data?.screening?.run_statuses || {};
  const avgDays = data?.average_resolution_time_days;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <MetricGroup title="Review queue" columns="grid-cols-2 sm:grid-cols-5" className="lg:col-span-2">
        <MetricTile
          label="Pending"
          value={formatCount(data?.pending_reports)}
          icon={Clock}
          iconClassName="text-yellow-400"
        />
        <MetricTile
          label="Escalated"
          value={formatCount(data?.escalated_reports)}
          icon={Warning}
          iconClassName="text-orange-400"
        />
        <MetricTile
          label="Resolved"
          value={formatCount(data?.resolved_reports)}
          icon={CheckCircle}
          iconClassName="text-zinc-400"
        />
        <MetricTile
          label="Rejected"
          value={formatCount(data?.rejected_reports)}
          icon={XCircle}
          iconClassName="text-red-400"
        />
        <MetricTile
          label="Avg. resolution"
          value={formatResolution(avgDays)}
          icon={Timer}
          iconClassName="text-zinc-400"
        />
      </MetricGroup>

      <MetricGroup title="Screening decisions" columns="grid-cols-3">
        <MetricTile
          label="Auto-approved"
          value={formatCount(decisions.auto_approved)}
          icon={CheckCircle}
          iconClassName="text-emerald-400"
        />
        <MetricTile
          label="Auto-rejected"
          value={formatCount(decisions.auto_rejected)}
          icon={XCircle}
          iconClassName="text-red-400"
        />
        <MetricTile
          label="Flagged"
          value={formatCount(decisions.flagged_manual)}
          icon={Flag}
          iconClassName="text-yellow-400"
        />
      </MetricGroup>

      <MetricGroup title="Screening runs" columns="grid-cols-3">
        <MetricTile
          label="Running"
          value={formatCount(runStatuses.running)}
          icon={CircleNotch}
          iconClassName="text-sky-400"
        />
        <MetricTile
          label="Complete"
          value={formatCount(runStatuses.complete)}
          icon={CheckCircle}
          iconClassName="text-zinc-400"
        />
        <MetricTile
          label="Failed"
          value={formatCount(runStatuses.failed)}
          icon={Warning}
          iconClassName="text-red-400"
        />
      </MetricGroup>
    </div>
  );
};

// ────────────────────────────────────────────────
// Queue (one per status tab)
// ────────────────────────────────────────────────

const EMPTY_COPY = {
  pending: 'Nothing waiting for review',
  escalated: 'Nothing has been escalated',
  reviewed: 'No reviewed items yet',
};

const QueueList = ({ status, onResolve, onPreview }) => {
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetModerationQueueQuery({ status, limit: PAGE_SIZE, offset });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map(i => (
          <Card key={i} className="bg-zinc-950 border-zinc-800">
            <CardContent className="flex gap-4 p-4">
              <Skeleton className="h-24 w-24 shrink-0 bg-zinc-800" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-48 bg-zinc-800" />
                <Skeleton className="h-3 w-32 bg-zinc-900" />
                <Skeleton className="h-16 w-full bg-zinc-900" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <WarningCircle size={28} weight="duotone" className="text-red-400" />
          <p className="text-sm text-zinc-300">
            {getApiErrorMessage(error, 'Failed to load the review queue')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-zinc-700"
          >
            <ArrowClockwise />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const items = Array.isArray(data) ? data : [];
  const hasNext = items.length === PAGE_SIZE;

  return (
    <div className={`space-y-3 ${isFetching ? 'opacity-70' : ''}`}>
      {items.length ? (
        items.map(item => (
          <QueueItem
            key={item.id}
            item={item}
            onResolve={onResolve}
            onPreview={onPreview}
          />
        ))
      ) : (
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <CheckCircle size={28} weight="duotone" className="text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-300">
              {EMPTY_COPY[status]}
            </p>
          </CardContent>
        </Card>
      )}

      {(offset > 0 || hasNext) && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-zinc-500">
            {items.length
              ? `Showing ${offset + 1}–${offset + items.length}`
              : 'No more items'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0 || isFetching}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="border-zinc-700"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext || isFetching}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="border-zinc-700"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────

const QUEUE_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'reviewed', label: 'Reviewed' },
];

export const ModerationPage = () => {
  const [queueStatus, setQueueStatus] = useState('pending');
  const [resolveTarget, setResolveTarget] = useState(null);
  const [preview, setPreview] = useState(null);

  return (
    <div className="min-h-screen" data-testid="moderation-page">
      <Header
        title="AI Moderation"
        subtitle="Review AI screening flags and set the platform rules"
      />

      <main className="space-y-6 p-4 sm:p-6">
        <MetricsStrip />

        <Tabs defaultValue="queue">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="queue">Review queue</TabsTrigger>
            <TabsTrigger value="rules">Screening rules</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-6 space-y-4">
            <Tabs value={queueStatus} onValueChange={setQueueStatus}>
              <TabsList className="bg-zinc-900 border border-zinc-800">
                {QUEUE_TABS.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Keyed so paging starts over when the tab changes. */}
            <QueueList
              key={queueStatus}
              status={queueStatus}
              onResolve={(item, decision) =>
                setResolveTarget({ item, decision })
              }
              onPreview={setPreview}
            />
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <ScreeningRulesPanel />
          </TabsContent>
        </Tabs>
      </main>

      <ResolveDialog
        target={resolveTarget}
        onClose={() => setResolveTarget(null)}
      />

      {/* Full-size artwork */}
      <Dialog open={!!preview} onOpenChange={open => !open && setPreview(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="pr-6 text-white">
              {preview?.title || 'Artwork'}
            </DialogTitle>
          </DialogHeader>

          {preview && (
            <div className="space-y-3">
              {fullSizeSrc(preview) ? (
                <img
                  src={fullSizeSrc(preview)}
                  alt={preview.title || 'Artwork'}
                  className="max-h-[70vh] w-full rounded-md bg-zinc-950 object-contain"
                />
              ) : (
                <p className="text-sm text-zinc-400">
                  This submission is a PDF with no rendered preview. Open the original to review it.
                </p>
              )}
              <a
                href={preview.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
              >
                <ArrowSquareOut size={16} />
                Open original in a new tab
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModerationPage;
