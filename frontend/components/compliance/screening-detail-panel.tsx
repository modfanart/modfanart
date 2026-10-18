import { AlertTriangle, CheckCircle2, Info, Loader2, RefreshCw, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { describeReason, type ReasonTone, screeningReasons } from '@/lib/screening-reasons';
import type { ScreeningReason, ScreeningRun } from '@/services/types/screening';

import { ScreeningStages } from './screening-stages';
import { ScreeningDecisionBadge } from './screening-verdict-badge';

const TONE_ICONS: Record<ReasonTone, React.ReactNode> = {
  pass: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />,
  warn: <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />,
  fail: <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />,
  info: <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />,
};

/** The engine's reasons, in the order it weighed them. */
export function ScreeningReasonList({ reasons }: { reasons: ScreeningReason[] }) {
  if (!reasons.length) return null;

  return (
    <ul className="space-y-2">
      {reasons.map((reason, index) => {
        const described = describeReason(reason);

        return (
          <li key={`${reason.code}-${index}`} className="flex gap-2 text-sm">
            {TONE_ICONS[described.tone]}
            <span>
              <span className="font-medium">{described.title}</span>
              {described.detail && (
                <span className="block text-muted-foreground">{described.detail}</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

interface ScreeningDetailPanelProps {
  run: ScreeningRun;
  /** Offered to reviewers who may rescreen; omitted, the button is not shown. */
  onRescreen?: () => void;
  isRescreening?: boolean;
}

/** One screening run as a reviewer needs it: the verdict, why, and what each check found. */
export function ScreeningDetailPanel({ run, onRescreen, isRescreening = false }: ScreeningDetailPanelProps) {
  const reasons = screeningReasons(run.decision_reasons);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>AI screening</CardTitle>
          <ScreeningDecisionBadge decision={run.decision} />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {run.status === 'running' && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Screening in progress…
          </p>
        )}

        {run.status === 'failed' && (
          <p className="text-sm text-red-700">
            Screening failed{run.error ? `: ${run.error}` : ''}. Rescreen it, or decide it by hand.
          </p>
        )}

        <ScreeningReasonList reasons={reasons} />

        <ScreeningStages aiornot={run.aiornot} moderation={run.moderation} style={run.style} />

        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            {run.finished_at
              ? `Screened ${new Date(run.finished_at).toLocaleString()}`
              : `Started ${new Date(run.created_at).toLocaleString()}`}
          </p>

          {onRescreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRescreen}
              disabled={isRescreening || run.status === 'running'}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRescreening ? 'animate-spin' : ''}`} />
              Rescreen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
