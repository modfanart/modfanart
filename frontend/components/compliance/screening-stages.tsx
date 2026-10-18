import { formatPercent } from '@/lib/screening-reasons';
import type {
  AuthenticityStage,
  ContentSafetyStage,
  StyleStage,
} from '@/services/types/screening';

const SKIP_REASONS: Record<string, string> = {
  style_disabled: 'Style checks are switched off',
  no_brand_context: 'No brand to check against',
  no_style_guide: 'The brand has not uploaded a style guide',
  duplicate_of_rejected: 'Skipped: identical to a rejected image',
};

const VERDICT_LABELS: Record<string, string> = {
  human: 'Human-made',
  ai: 'AI-generated',
  unknown: 'Inconclusive',
};

interface StageProps {
  aiornot: AuthenticityStage | null;
  moderation: ContentSafetyStage | null;
  style: StyleStage | null;
}

/** What each of the three checks found, one line each, for a reviewer deciding a borderline call. */
export function ScreeningStages({ aiornot, moderation, style }: StageProps) {
  return (
    <dl className="space-y-2 text-sm">
      <StageRow label="Authenticity" stage={aiornot}>
        {aiornot && (
          <>
            {VERDICT_LABELS[aiornot.verdict ?? ''] ?? aiornot.verdict} · human-made confidence{' '}
            {formatPercent(aiornot.humanConfidence)}
            {aiornot.generators?.length ? ` · ${aiornot.generators.join(', ')}` : ''}
          </>
        )}
      </StageRow>

      <StageRow label="Content safety" stage={moderation}>
        {moderation && <ContentSafetySummary stage={moderation} />}
      </StageRow>

      <StageRow label="Style & IP" stage={style}>
        {style && (
          <>
            Style {formatPercent(style.styleScore)} · brand fit {formatPercent(style.brandFitScore)} ·
            IP risk {formatPercent(style.ipRisk)}
            {style.violations?.length ? (
              <ul className="mt-1 list-disc pl-5">
                {style.violations.map((violation) => (
                  <li key={violation}>{violation}</li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </StageRow>
    </dl>
  );
}

function StageRow({
  label,
  stage,
  children,
}: {
  label: string;
  stage: { status: string; error?: string; reason?: string } | null;
  children: React.ReactNode;
}) {
  let body: React.ReactNode = children;

  if (!stage) body = <span className="text-muted-foreground">Not run yet</span>;
  else if (stage.status === 'unavailable')
    body = <span className="text-amber-700">Could not run — {stage.error ?? 'unknown error'}</span>;
  else if (stage.status === 'skipped')
    body = (
      <span className="text-muted-foreground">
        {SKIP_REASONS[stage.reason ?? ''] ?? `Skipped (${stage.reason ?? 'no reason given'})`}
      </span>
    );

  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2">
      <dt className="font-medium">{label}</dt>
      <dd className="text-muted-foreground">{body}</dd>
    </div>
  );
}

/** Highest category scores first; anything under 1% is noise and left out. */
function ContentSafetySummary({ stage }: { stage: ContentSafetyStage }) {
  const top = Object.entries(stage.categoryScores ?? {})
    .filter(([, score]) => score >= 0.01)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (!top.length) return <>No concerns found</>;

  return <>{top.map(([category, score]) => `${category} ${formatPercent(score)}`).join(' · ')}</>;
}
