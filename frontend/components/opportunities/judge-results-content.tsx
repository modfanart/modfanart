'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, ExternalLink, Trophy } from 'lucide-react';

import {
  useGetContestQuery,
  useGetLeaderboardQuery,
  type LeaderboardEntry,
} from '@/services/api/contestsApi';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const FINALIST_COUNT = 10;

function FinalistRow({
  entry,
  judgesScoring,
}: {
  entry: LeaderboardEntry;
  judgesScoring: number;
}) {
  // An entry fewer judges reached is not necessarily worse, but its average
  // rests on less evidence, and whoever is reviewing this should be able to
  // see that rather than infer it.
  const partiallyJudged = judgesScoring > 1 && entry.judge_count < judgesScoring;

  return (
    <Card>
      <CardContent className="p-4 flex gap-4 items-center">
        <div className="text-2xl font-bold tabular-nums w-12 shrink-0 text-center text-muted-foreground">
          {entry.rank}
        </div>

        <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0">
          {(entry.artwork_thumbnail || entry.artwork_file_url) && (
            <Image
              src={entry.artwork_thumbnail || entry.artwork_file_url || ''}
              alt={entry.artwork_title || 'Entry'}
              fill
              className="object-cover"
              sizes="80px"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{entry.artwork_title || 'Untitled'}</div>
          <div className="text-sm text-muted-foreground truncate">
            @{entry.creator_username}
          </div>
          {partiallyJudged && (
            <Badge variant="outline" className="mt-1.5 text-amber-600 border-amber-600">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Scored by {entry.judge_count} of {judgesScoring} judges
            </Badge>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="text-xl font-bold tabular-nums">{entry.score_judge}</div>
          <div className="text-xs text-muted-foreground">
            avg of {entry.judge_count} {entry.judge_count === 1 ? 'judge' : 'judges'}
          </div>
        </div>

        {entry.artwork_file_url && (
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <a href={entry.artwork_file_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-4 w-4" />
              View
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Read-only standings for a contest, ranked by judge score.
 *
 * Deliberately has no scoring controls. This is the view the brand sends to a
 * reviewer who is looking over what the judges chose, not participating.
 */
export function JudgeResultsContent({ contestId }: { contestId: string }) {
  const [showAll, setShowAll] = useState(false);

  const { data: contest } = useGetContestQuery(contestId);
  const {
    data,
    isLoading,
    error,
  } = useGetLeaderboardQuery({ contestId });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    const status = (error as { status?: number }).status;
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>
            {status === 403
              ? 'You do not have access to this contest’s standings. Ask the brand to invite you as a judge on this contest.'
              : 'Could not load the standings. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const rows = data?.leaderboard ?? [];
  const judgesScoring = data?.judges_scoring ?? 0;
  const scoredTotal = data?.scored_total ?? 0;
  const approvedTotal = data?.approved_total ?? 0;

  const visible = showAll ? rows : rows.slice(0, FINALIST_COUNT);
  const unscored = Math.max(0, approvedTotal - scoredTotal);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="h-7 w-7" />
          Top {Math.min(FINALIST_COUNT, rows.length) || FINALIST_COUNT} finalists
        </h1>
        {contest && <p className="text-muted-foreground mt-1">{contest.title}</p>}
        <p className="text-sm text-muted-foreground mt-2">
          Ranked by average judge score. {scoredTotal} of {approvedTotal} approved{' '}
          {approvedTotal === 1 ? 'entry has' : 'entries have'} been scored by{' '}
          {judgesScoring} {judgesScoring === 1 ? 'judge' : 'judges'}.
        </p>
      </div>

      {/* Silence here would be worse than a warning. A ranking drawn from an
          unfinished pass looks identical to a finished one. */}
      {unscored > 0 && rows.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Judging is not finished. {unscored} approved{' '}
            {unscored === 1 ? 'entry has' : 'entries have'} no score yet and cannot appear in
            this ranking.
          </AlertDescription>
        </Alert>
      )}

      {rows.length === 0 ? (
        <Alert>
          <AlertDescription>
            No entries have been scored yet, so there are no finalists to show. This fills in
            as the judges work through the submissions.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-3">
            {visible.map((entry) => (
              <FinalistRow key={entry.entry_id} entry={entry} judgesScoring={judgesScoring} />
            ))}
          </div>

          {rows.length > FINALIST_COUNT && (
            <Button variant="outline" onClick={() => setShowAll((v) => !v)}>
              {showAll
                ? `Show top ${FINALIST_COUNT} only`
                : `Show all ${rows.length} scored entries`}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
