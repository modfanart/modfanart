import { Badge } from '@/components/ui/badge';
import { DECISION_LABELS, MODERATION_STATUS_LABELS } from '@/lib/screening-reasons';
import type { ModerationStatus, ScreeningDecision } from '@/services/types/screening';

const TONE_CLASSES = {
  pass: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-50',
  fail: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-50',
  warn: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50',
  neutral: 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-50',
};

const DECISION_TONES: Record<ScreeningDecision, keyof typeof TONE_CLASSES> = {
  auto_approved: 'pass',
  auto_rejected: 'fail',
  flagged_manual: 'warn',
};

const STATUS_TONES: Record<ModerationStatus, keyof typeof TONE_CLASSES> = {
  approved: 'pass',
  rejected: 'fail',
  flagged: 'warn',
  pending: 'neutral',
};

/** The automated verdict of one screening run. `null` means the run has not finished. */
export function ScreeningDecisionBadge({ decision }: { decision: ScreeningDecision | null }) {
  return (
    <Badge variant="outline" className={TONE_CLASSES[decision ? DECISION_TONES[decision] : 'neutral']}>
      {decision ? DECISION_LABELS[decision] : 'Screening…'}
    </Badge>
  );
}

/** Where an artwork or entry stands now, after screening and any human review. */
export function ModerationStatusBadge({ status }: { status: ModerationStatus }) {
  return (
    <Badge variant="outline" className={TONE_CLASSES[STATUS_TONES[status] ?? 'neutral']}>
      {MODERATION_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
