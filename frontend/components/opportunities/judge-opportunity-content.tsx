'use client';

import { useState } from 'react';
import {
  useGetContestQuery,
  useGetContestEntriesQuery,
  useSubmitJudgeScoreMutation,
} from '@/services/api/contestsApi';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function JudgeOpportunityContent({ contestId }: { contestId: string }) {
  const { toast } = useToast();

  const { data: contest, isLoading: contestLoading } = useGetContestQuery(contestId);

  const {
    data: entriesData,
    isLoading: entriesLoading,
    isError,
  } = useGetContestEntriesQuery({
    contestId,
    status: 'approved',
  });

  const [submitScore, { isLoading: isSubmitting }] = useSubmitJudgeScoreMutation();

  const [score, setScore] = useState<number>(0);
  const [activeEntry, setActiveEntry] = useState<string | null>(null);

  const entries = entriesData?.entries ?? [];

  const handleScore = async (entryId: string) => {
    if (!score || score < 1 || score > 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid score',
        description: 'Score must be between 1 and 10',
      });
      return;
    }

    try {
      await submitScore({
        contestId,
        entryId,
        score,
      }).unwrap();

      toast({
        title: 'Score submitted',
        description: 'Your score has been saved',
      });

      setScore(0);
      setActiveEntry(null);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.data?.message || 'Failed to submit score',
      });
    }
  };

  // Loading states
  if (contestLoading || entriesLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load entries</div>;
  }

  if (!contest) {
    return <div className="p-6">Contest not found</div>;
  }

  if (entries.length === 0) {
    return <div className="p-6">No entries to judge</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => {
        const isActive = activeEntry === entry.id;

        return (
          <Card key={entry.id}>
            <CardContent className="p-4 space-y-3">
              {/* Entry Info */}
              <div className="font-semibold truncate">Entry: {entry.artwork_id}</div>

              {/* Score Input */}
              <Input
                type="number"
                min={1}
                max={10}
                value={isActive ? score : ''}
                placeholder="Score (1-10)"
                onChange={(e) => {
                  setActiveEntry(entry.id);
                  setScore(Number(e.target.value));
                }}
              />

              {/* Submit Button */}
              <Button
                onClick={() => handleScore(entry.id)}
                disabled={!isActive || !score || isSubmitting}
                className="w-full"
              >
                {isSubmitting && isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Submit Score'
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
