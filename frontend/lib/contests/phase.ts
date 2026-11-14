// Single place that decides what phase a contest is in and what a visitor can
// do with it. Mirrors the backend rules in contestEntry.controller.submitEntry:
// entries are accepted only when status === 'live' AND
// start_date <= now < submission_end_date.

export type ContestPhase = 'upcoming' | 'open' | 'closed' | 'judging' | 'completed' | 'draft';

export interface ContestLike {
  status: string;
  start_date?: string | null;
  submission_end_date?: string | null;
  winner_announced?: boolean | null;
}

export function getContestPhase(c: ContestLike, now: number = Date.now()): ContestPhase {
  const start = c.start_date ? new Date(c.start_date).getTime() : null;
  const end = c.submission_end_date ? new Date(c.submission_end_date).getTime() : null;

  switch (c.status) {
    case 'draft':
      return 'draft';
    case 'completed':
    case 'archived':
      return 'completed';
    case 'judging':
      return 'judging';
    case 'published':
      return 'upcoming';
    case 'live':
      if (start !== null && start > now) return 'upcoming';
      if (end !== null && end <= now) return 'closed';
      return 'open';
    default:
      return 'closed';
  }
}

export const PHASE_META: Record<
  ContestPhase,
  { label: string; badge: 'success' | 'info' | 'warning' | 'secondary' | 'brand'; cta: string }
> = {
  open: { label: 'Open for entries', badge: 'success', cta: 'View & enter' },
  upcoming: { label: 'Coming soon', badge: 'info', cta: 'View details' },
  closed: { label: 'Entries closed', badge: 'warning', cta: 'View contest' },
  judging: { label: 'Judging', badge: 'brand', cta: 'View contest' },
  completed: { label: 'Winners announced', badge: 'secondary', cta: 'See results' },
  draft: { label: 'Draft', badge: 'secondary', cta: 'View contest' },
};

export function canEnter(c: ContestLike, now?: number): boolean {
  return getContestPhase(c, now) === 'open';
}

/** "3 days left", "Closes today", "Opens in 5 days" — or null. */
export function phaseCountdown(c: ContestLike, now: number = Date.now()): string | null {
  const phase = getContestPhase(c, now);
  const day = 24 * 60 * 60 * 1000;
  if (phase === 'open' && c.submission_end_date) {
    const days = Math.ceil((new Date(c.submission_end_date).getTime() - now) / day);
    return days <= 1 ? 'Closes within 24h' : `${days} days left`;
  }
  if (phase === 'upcoming' && c.start_date) {
    const days = Math.ceil((new Date(c.start_date).getTime() - now) / day);
    if (days > 0) return days === 1 ? 'Opens tomorrow' : `Opens in ${days} days`;
  }
  return null;
}

export function totalPrizeUsd(prizes: Array<{ amount_usd?: number | null }> | null | undefined) {
  return (prizes ?? []).reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0);
}

export function formatPrizePool(prizes: Array<{ amount_usd?: number | null }> | null | undefined) {
  const total = totalPrizeUsd(prizes);
  return total > 0 ? `$${total.toLocaleString('en-US')}` : 'Prizes available';
}
