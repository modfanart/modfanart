import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScreeningVerdictBadge } from './screening-verdict-badge';
import type { ScreeningRun } from '@/services/types/screening';

interface ScreeningDetailPanelProps {
  screening: ScreeningRun;
}

const severityStyles = {
  low: 'text-muted-foreground',
  medium: 'text-amber-600',
  high: 'text-red-600',
};

export function ScreeningDetailPanel({
  screening,
}: ScreeningDetailPanelProps) {
  const {
    verdict,
    reasons,
    needsHumanReview,
    createdAt,
    completedAt,
  } = screening;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>AI Screening</CardTitle>

          <ScreeningVerdictBadge verdict={verdict} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-medium">Human Review</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {needsHumanReview ? 'Required' : 'Not required'}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Screening Reasons</p>

          {reasons.length > 0 ? (
            <div className="mt-2 space-y-3">
              {reasons.map((reason, index) => (
                <div
                  key={`${reason.code}-${index}`}
                  className="rounded-md border p-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium">
                      {formatReasonCode(reason.code)}
                    </p>

                    {reason.severity && (
                      <span
                        className={`text-xs font-medium capitalize ${
                          severityStyles[reason.severity]
                        }`}
                      >
                        {reason.severity}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {reason.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              No screening issues were reported.
            </p>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Screened {formatDate(completedAt ?? createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatReasonCode(code: string) {
  return code
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}