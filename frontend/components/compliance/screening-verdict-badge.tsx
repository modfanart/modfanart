import { Badge } from '@/components/ui/badge';
import type { ScreeningVerdict } from '@/services/types/screening';

interface ScreeningVerdictBadgeProps {
  verdict: ScreeningVerdict;
}

const verdictConfig: Record<
  ScreeningVerdict,
  {
    label: string;
    className: string;
  }
> = {
  approved: {
    label: 'Approved',
    className:
      'border-green-200 bg-green-50 text-green-700 hover:bg-green-50',
  },
  rejected: {
    label: 'Rejected',
    className:
      'border-red-200 bg-red-50 text-red-700 hover:bg-red-50',
  },
  needs_review: {
    label: 'Needs Review',
    className:
      'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50',
  },
  pending: {
    label: 'Pending',
    className:
      'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-50',
  },
};

export function ScreeningVerdictBadge({
  verdict,
}: ScreeningVerdictBadgeProps) {
  const config = verdictConfig[verdict];

  return (
    <Badge
      variant="outline"
      className={config.className}
    >
      {config.label}
    </Badge>
  );
}