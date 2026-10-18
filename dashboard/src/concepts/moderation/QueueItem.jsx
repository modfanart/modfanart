import React from 'react';
import {
  ArrowFatLinesUp,
  CaretDown,
  CheckCircle,
  ClockCounterClockwise,
  FilePdf,
  Fingerprint,
  Flag,
  Palette,
  ShieldWarning,
  Trophy,
  XCircle,
} from '@phosphor-icons/react';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible';

import { useGetScreeningRunsQuery } from '../../services/api/screeningApi';

import {
  REVIEW_DECISIONS,
  SCREENING_DECISIONS,
  formatDate,
  formatDateTime,
  formatPercent,
  getApiErrorMessage,
  humanize,
  previewSrc,
} from './format';
import {
  describeReason,
  describeSkipReason,
  isUserReport,
  reasonTone,
} from './reasons';

// ────────────────────────────────────────────────
// Small pieces
// ────────────────────────────────────────────────

const DecisionBadge = ({ decisions, value }) => {
  if (!value) return null;

  const decision = decisions[value];

  return (
    <Badge
      variant="outline"
      className={decision?.className || 'border-zinc-700 text-zinc-400'}
    >
      {decision?.label || humanize(value)}
    </Badge>
  );
};

const TONE_DOT = {
  pass: 'bg-emerald-400',
  warn: 'bg-yellow-400',
  fail: 'bg-red-400',
};

const ReasonList = ({ reasons }) => {
  if (!reasons?.length) return null;

  return (
    <ul className="space-y-1">
      {reasons.map((reason, index) => (
        <li
          key={`${reason.code}-${index}`}
          className="flex items-start gap-2 text-sm text-zinc-300"
        >
          <span
            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[reasonTone(reason.code)]}`}
          />
          <span>{describeReason(reason)}</span>
        </li>
      ))}
    </ul>
  );
};

const Detail = ({ label, children }) => (
  <div className="flex items-baseline justify-between gap-3">
    <span className="text-zinc-500">{label}</span>
    <span className="text-right text-zinc-200">{children}</span>
  </div>
);

// ────────────────────────────────────────────────
// Stage details: one box per screening stage
// ────────────────────────────────────────────────

const StageBox = ({ title, icon: Icon, stage, children }) => {
  let body;

  if (!stage) {
    body = <p className="text-zinc-500">Not run</p>;
  } else if (stage.status === 'unavailable') {
    body = (
      <p className="text-red-400">
        Unavailable — {stage.error || 'no error recorded'}
      </p>
    );
  } else if (stage.status === 'skipped') {
    body = (
      <p className="text-zinc-400">
        Skipped: {describeSkipReason(stage.reason)}
      </p>
    );
  } else {
    body = children;
  }

  return (
    <div className="min-w-0 space-y-2 rounded-md border border-zinc-800 bg-zinc-900/50 p-3 text-xs">
      <p className="flex items-center gap-1.5 font-medium text-zinc-300">
        <Icon size={14} weight="duotone" className="text-zinc-500" />
        {title}
      </p>
      <div className="space-y-1">{body}</div>
    </div>
  );
};

const AuthenticityDetails = ({ stage }) => (
  <>
    <Detail label="Verdict">{humanize(stage.verdict)}</Detail>
    <Detail label="Human confidence">
      {formatPercent(stage.humanConfidence)}
    </Detail>
    {stage.generators?.length > 0 && (
      <Detail label="Generators">{stage.generators.join(', ')}</Detail>
    )}
  </>
);

const ContentSafetyDetails = ({ stage }) => {
  const topScores = Object.entries(stage.categoryScores ?? {})
    .filter(([, score]) => typeof score === 'number')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <>
      <Detail label="Flagged">{stage.flagged ? 'Yes' : 'No'}</Detail>
      {topScores.map(([category, score]) => (
        <Detail key={category} label={category}>
          <span className={stage.categories?.[category] ? 'text-red-400' : ''}>
            {formatPercent(score)}
          </span>
        </Detail>
      ))}
    </>
  );
};

const StyleDetails = ({ stage }) => (
  <>
    <Detail label="Style score">{formatPercent(stage.styleScore)}</Detail>
    <Detail label="Brand fit">{formatPercent(stage.brandFitScore)}</Detail>
    <Detail label="IP risk">{formatPercent(stage.ipRisk)}</Detail>
    {stage.violations?.length > 0 && (
      <ul className="list-inside list-disc pt-1 text-zinc-300">
        {stage.violations.map((violation, index) => (
          <li key={index}>{violation}</li>
        ))}
      </ul>
    )}
  </>
);

const StageDetails = ({ item }) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
    <StageBox title="Authenticity" icon={Fingerprint} stage={item.aiornot}>
      {item.aiornot && <AuthenticityDetails stage={item.aiornot} />}
    </StageBox>

    <StageBox
      title="Content safety"
      icon={ShieldWarning}
      stage={item.moderation}
    >
      {item.moderation && <ContentSafetyDetails stage={item.moderation} />}
    </StageBox>

    <StageBox title="Style" icon={Palette} stage={item.style}>
      {item.style && <StyleDetails stage={item.style} />}
    </StageBox>
  </div>
);

const ReportDetails = ({ report }) => (
  <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3 text-sm">
    <p className="text-zinc-500">
      Reported for{' '}
      <span className="font-medium text-zinc-200">
        {humanize(report.violation_type)}
      </span>
    </p>
    {report.description && (
      <p className="mt-1 whitespace-pre-line text-zinc-300">
        {report.description}
      </p>
    )}
  </div>
);

// ────────────────────────────────────────────────
// Screening history (loaded only when expanded)
// ────────────────────────────────────────────────

const RUN_STATUS_CLASSES = {
  running: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
  complete: 'border-zinc-700 text-zinc-400',
  failed: 'border-red-500/20 bg-red-500/10 text-red-400',
};

const RunHistory = ({ artworkId }) => {
  const { data, isLoading, isError, error } =
    useGetScreeningRunsQuery(artworkId);

  if (isLoading) {
    return <p className="text-xs text-zinc-500">Loading history…</p>;
  }

  if (isError) {
    return (
      <p className="text-xs text-red-400">
        {getApiErrorMessage(error, 'Failed to load screening history')}
      </p>
    );
  }

  const runs = data?.runs || [];

  if (!runs.length) {
    return <p className="text-xs text-zinc-500">No screening runs.</p>;
  }

  return (
    <ol className="space-y-3">
      {runs.map(run => (
        <li
          key={run.id}
          className="space-y-2 rounded-md border border-zinc-800 p-3"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-400">
              {formatDateTime(run.started_at || run.created_at)}
            </span>
            <Badge
              variant="outline"
              className={RUN_STATUS_CLASSES[run.status] || ''}
            >
              {humanize(run.status)}
            </Badge>
            <DecisionBadge
              decisions={SCREENING_DECISIONS}
              value={run.decision}
            />
          </div>

          {run.error && <p className="text-xs text-red-400">{run.error}</p>}

          <ReasonList reasons={run.decision_reasons} />
        </li>
      ))}
    </ol>
  );
};

const ScreeningHistory = ({ artworkId }) => (
  <Collapsible>
    <CollapsibleTrigger className="group flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300">
      <ClockCounterClockwise size={14} />
      Screening history
      <CaretDown
        size={12}
        className="transition-transform group-data-[state=open]:rotate-180"
      />
    </CollapsibleTrigger>

    <CollapsibleContent className="pt-3">
      <RunHistory artworkId={artworkId} />
    </CollapsibleContent>
  </Collapsible>
);

// ────────────────────────────────────────────────
// Queue item
// ────────────────────────────────────────────────

const Thumbnail = ({ artwork, onPreview }) => {
  if (!artwork) {
    return (
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900">
        <Flag size={24} weight="duotone" className="text-zinc-600" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPreview(artwork)}
      title="View full size"
      className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-600"
    >
      {previewSrc(artwork) ? (
        <img
          src={previewSrc(artwork)}
          alt={artwork.title || 'Artwork'}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-zinc-500">
          <FilePdf size={28} weight="duotone" />
          <span className="text-xs">PDF</span>
        </span>
      )}
    </button>
  );
};

export const QueueItem = ({ item, onResolve, onPreview }) => {
  const { artwork, contest_entry: contestEntry } = item;
  const report = isUserReport(item) ? item.rule_matches : null;
  const reasons = Array.isArray(item.rule_matches) ? item.rule_matches : [];
  const isOpen = item.status === 'pending';
  const isEscalated = item.decision === 'escalated';

  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Thumbnail artwork={artwork} onPreview={onPreview} />

          <div className="min-w-0 flex-1 space-y-3">
            {/* Who and what */}
            <div className="space-y-1.5">
              <p className="truncate font-medium text-white">
                {artwork?.title ||
                  `${humanize(item.entity_type)} ${String(item.entity_id).slice(0, 8)}`}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                {artwork?.creator?.username && (
                  <span className="text-zinc-400">
                    @{artwork.creator.username}
                  </span>
                )}
                {contestEntry?.contest_title && (
                  <span className="flex items-center gap-1">
                    <Trophy size={12} />
                    {contestEntry.contest_title}
                  </span>
                )}
                <span>Queued {formatDate(item.created_at)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="border-zinc-700 text-zinc-400"
                >
                  {report ? 'User report' : humanize(item.entity_type)}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-700 text-zinc-400"
                >
                  Priority {item.priority ?? 0}
                </Badge>
                <DecisionBadge
                  decisions={SCREENING_DECISIONS}
                  value={item.screening_decision}
                />
                <DecisionBadge
                  decisions={REVIEW_DECISIONS}
                  value={item.decision}
                />
              </div>
            </div>

            {/* Why it is here */}
            {report ? (
              <ReportDetails report={report} />
            ) : (
              <ReasonList reasons={reasons} />
            )}

            {item.screening_run_id && <StageDetails item={item} />}

            {artwork?.id && item.screening_run_id && (
              <ScreeningHistory artworkId={artwork.id} />
            )}
          </div>
        </div>

        {/* Escalation note, or the outcome of a finished review */}
        {(isEscalated || !isOpen) && (
          <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3 text-sm">
            <p className="text-xs text-zinc-500">
              {isOpen ? 'Escalated' : 'Reviewed'}{' '}
              {formatDateTime(item.reviewed_at)}
            </p>
            <p className="mt-1 whitespace-pre-line text-zinc-300">
              {item.notes || 'No notes'}
            </p>
          </div>
        )}

        {isOpen && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-800 pt-4">
            <Button
              size="sm"
              onClick={() => onResolve(item, 'approved')}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              <CheckCircle weight="bold" />
              Approve
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => onResolve(item, 'rejected')}
            >
              <XCircle weight="bold" />
              Reject
            </Button>

            {!isEscalated && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResolve(item, 'escalated')}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <ArrowFatLinesUp weight="bold" />
                Escalate
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueueItem;
