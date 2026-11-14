'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Award, Clock, Trophy, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { useGetContestsQuery, type Contest } from '@/services/api/contestsApi';
import isApiError from '@/lib/isApiError';
import { cn } from '@/lib/utils';
import {
  type ContestPhase,
  PHASE_META,
  formatPrizePool,
  getContestPhase,
  phaseCountdown,
} from '@/lib/contests/phase';
import { contestHref } from '@/lib/links';

type Tab = 'all' | 'open' | 'upcoming' | 'past';

const TABS: { key: Tab; label: string; phases: ContestPhase[] | null }[] = [
  { key: 'all', label: 'All contests', phases: null },
  { key: 'open', label: 'Open now', phases: ['open'] },
  { key: 'upcoming', label: 'Upcoming', phases: ['upcoming'] },
  { key: 'past', label: 'Judging & past', phases: ['closed', 'judging', 'completed'] },
];

// Open first, then upcoming, then the rest; within a group, soonest deadline first.
const PHASE_ORDER: Record<ContestPhase, number> = {
  open: 0,
  upcoming: 1,
  closed: 2,
  judging: 3,
  completed: 4,
  draft: 5,
};

export default function OpportunitiesPage() {
  // The API caps limit at 100 and already hides drafts/private contests for
  // the public. `activeOnly` was sent before but the API never supported it,
  // and the "Upcoming" tab was hard-wired to an empty list.
  const {
    data: contestsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetContestsQuery({ limit: 100 });

  const [activeTab, setActiveTab] = useState<Tab>('all');

  const contests = useMemo<Array<Contest & { phase: ContestPhase }>>(() => {
    const now = Date.now();
    const list: Contest[] = contestsResponse?.contests ?? [];
    return list
      .map((c: Contest) => ({ ...c, phase: getContestPhase(c, now) }))
      .filter((c) => c.phase !== 'draft')
      .sort((a, b) => {
        const byPhase = PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase];
        if (byPhase) return byPhase;
        return (
          new Date(a.submission_end_date).getTime() - new Date(b.submission_end_date).getTime()
        );
      });
  }, [contestsResponse]);

  const counts = useMemo(() => {
    const out: Record<Tab, number> = { all: contests.length, open: 0, upcoming: 0, past: 0 };
    for (const t of TABS) {
      if (t.phases) out[t.key] = contests.filter((c) => t.phases!.includes(c.phase)).length;
    }
    return out;
  }, [contests]);

  const tab = TABS.find((t) => t.key === activeTab)!;
  const filteredContests = tab.phases
    ? contests.filter((c) => tab.phases!.includes(c.phase))
    : contests;

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="container py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-card border rounded-2xl shadow-sm p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </aside>
          <div className="lg:col-span-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (isError) {
    return (
      <div className="container py-20 text-center space-y-4">
        <p className="text-lg text-muted-foreground">Failed to load contests</p>
        {isApiError(error) && error.data?.message && (
          <p className="text-sm text-muted-foreground">{error.data.message}</p>
        )}
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Retrying…' : 'Try again'}
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 lg:py-14">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Opportunities</h1>
        <p className="text-muted-foreground mt-2">
          Enter official brand contests, get your fan art licensed and win prizes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ---------------- FILTERS ---------------- */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24">
            <div
              role="tablist"
              aria-label="Filter contests"
              className="bg-card border rounded-2xl shadow-sm p-3 space-y-1"
            >
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 rounded-xl text-left font-medium transition-colors',
                    activeTab === t.key
                      ? 'bg-primary-subtle text-primary'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent'
                  )}
                >
                  <span>{t.label}</span>
                  <span className="text-xs tabular-nums">{counts[t.key]}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ---------------- CONTEST GRID ---------------- */}
        <div className="lg:col-span-9">
          {filteredContests.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-24 text-center text-muted-foreground">
              {activeTab === 'open'
                ? 'No contests are open for entries right now. Check the upcoming ones!'
                : activeTab === 'upcoming'
                  ? 'No upcoming contests announced yet.'
                  : 'No contests to show here yet.'}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContests.map((contest) => {
                const meta = PHASE_META[contest.phase];
                const countdown = phaseCountdown(contest);
                const href = contestHref(contest);

                return (
                  <Card
                    key={contest.id}
                    className="group overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link href={href} className="relative block h-48 overflow-hidden" tabIndex={-1}>
                      {contest.hero_image ? (
                        <Image
                          src={contest.hero_image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/80 to-primary" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="flex items-center gap-1 text-xs opacity-80">
                          <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> Prize pool
                        </p>
                        <p className="text-xl font-bold tracking-tight">
                          {formatPrizePool(contest.prizes)}
                        </p>
                      </div>

                      <Badge variant={meta.badge} className="absolute top-4 right-4">
                        {meta.label}
                      </Badge>
                    </Link>

                    <CardHeader className="pb-3">
                      {contest.brand_name && (
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {contest.brand_name}
                        </p>
                      )}
                      <CardTitle className="line-clamp-2 text-lg leading-tight">
                        <Link href={href} className="hover:text-primary">
                          {contest.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {contest.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" aria-hidden="true" />
                          Max {contest.max_entries_per_user || 1}{' '}
                          {(contest.max_entries_per_user || 1) === 1 ? 'entry' : 'entries'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Award className="h-4 w-4" aria-hidden="true" />
                          {contest.prizes?.length || 0} prizes
                        </span>
                        {countdown && (
                          <span className="flex w-full items-center gap-1.5 font-medium text-foreground">
                            <Clock className="h-4 w-4" aria-hidden="true" />
                            {countdown}
                          </span>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2">
                      <Button
                        asChild
                        className="w-full"
                        variant={contest.phase === 'open' ? 'default' : 'outline'}
                      >
                        <Link href={href}>{meta.cta}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
