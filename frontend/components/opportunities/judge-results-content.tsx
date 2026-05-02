'use client';

import {
  useGetContestQuery,
  useGetContestEntriesQuery,
  useGetLeaderboardQuery,
} from '@/services/api/contestsApi';

import { Card, CardContent } from '@/components/ui/card';

export function JudgeResultsContent({ contestId }: { contestId: string }) {
  const { data: contest } = useGetContestQuery(contestId);
  const { data: entriesData } = useGetContestEntriesQuery({ contestId });
  const { data: leaderboard } = useGetLeaderboardQuery(contestId);

  const entries = entriesData?.entries ?? [];

  if (!contest) return <div>Contest not found</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Judging Results</h1>

      <div className="grid gap-4">
        {entries.map((entry) => {
          const result = leaderboard?.find((l) => l.entry_id === entry.id);

          return (
            <Card key={entry.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{result?.artwork_title || 'Untitled'}</div>
                  <div className="text-sm text-muted-foreground">@{result?.creator_username}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm">Final Rank</div>
                  <div className="text-lg font-bold">{result?.rank ?? '-'}</div>

                  <div className="text-sm mt-2">Judge Score</div>
                  <div className="font-semibold">{result?.score_judge ?? '-'}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
