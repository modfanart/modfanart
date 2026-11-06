import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TONE_CLASS } from '@/lib/marketplace/format';

type Tone = keyof typeof TONE_CLASS;

export function StatusBadge({
  map,
  status,
  className,
}: {
  map: Record<string, { label: string; tone: Tone }>;
  status: string;
  className?: string;
}) {
  const entry = map[status] ?? { label: status, tone: 'neutral' as Tone };

  return (
    <Badge variant="outline" className={cn('font-medium', TONE_CLASS[entry.tone], className)}>
      {entry.label}
    </Badge>
  );
}
