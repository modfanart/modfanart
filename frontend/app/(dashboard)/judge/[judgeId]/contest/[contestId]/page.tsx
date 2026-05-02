'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import {
  useGetContestQuery,
  useGetContestEntriesQuery,
  useSubmitJudgeScoreMutation,
  useGetEntryScoresQuery,
} from '@/services/api/contestsApi';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBasePath } from '@/hooks/getBasePath';
import { Trophy, Calendar, Users, Star, Send, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/store/AuthContext';
export default function JudgeContestPage() {
  const { contestId } = useParams<{ contestId: string }>();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [comments, setComments] = useState('');
  const basePath = user ? getBasePath(user) : null;
  // Fetch contest details
  const { data: contest, isLoading: contestLoading } = useGetContestQuery(contestId);

  // Fetch all entries for this contest
  const { data: entriesData, isLoading: entriesLoading } = useGetContestEntriesQuery({
    contestId,
    status: 'approved', // or remove this to show all
  });

  const entries = entriesData?.entries ?? [];

  // Submit score mutation
  const [submitJudgeScore, { isLoading: isSubmitting }] = useSubmitJudgeScoreMutation();

  const handleSubmitScore = async (entryId: string) => {
    if (!score || score < 1 || score > 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid score',
        description: 'Please give a score between 1 and 10.',
      });
      return;
    }

    try {
      const payload: {
        contestId: string;
        entryId: string;
        score: number;
        comments?: string;
      } = {
        contestId,
        entryId,
        score,
      };

      if (comments.trim()) {
        payload.comments = comments.trim();
      }

      await submitJudgeScore(payload).unwrap();

      toast({
        title: 'Score submitted',
        description: 'Your rating has been saved successfully.',
      });

      setScore(0);
      setComments('');
      setSelectedEntryId(null);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to submit score',
        description: err?.data?.message || 'Something went wrong.',
      });
    }
  };
  if (contestLoading || entriesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Contest not found or you don&apos;t have access.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-10">
      {/* Contest Header */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="uppercase tracking-widest">
              {contest.status}
            </Badge>
            <Badge variant="secondary">{contest.visibility}</Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-3">{contest.title}</h1>
          <p className="text-lg text-muted-foreground">{contest.description}</p>

          <div className="flex gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>
                Judging ends:{' '}
                {format(
                  new Date(contest.judging_end_date || contest.submission_end_date),
                  'dd MMM yyyy'
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>{contest.entry_count || entries.length} Entries</span>
            </div>
          </div>
        </div>

        {contest.hero_image && (
          <div className="relative w-full lg:w-96 h-64 lg:h-80 rounded-2xl overflow-hidden border">
            <Image src={contest.hero_image} alt={contest.title} fill className="object-cover" />
          </div>
        )}
      </div>

      {/* Entries Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <Trophy className="h-6 w-6" />
            Contest Entries
          </h2>

          <Link href={`${basePath}/review-queue/${contestId}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Review Queue
            </Button>
          </Link>
        </div>
        {entries.length === 0 ? (
          <Alert>
            <AlertDescription>No entries available for judging yet.</AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry: any) => (
              <Card key={entry.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-56 bg-muted">
                  {entry.artwork_thumbnail_url || entry.artwork_file_url ? (
                    <Image
                      src={entry.artwork_thumbnail_url || entry.artwork_file_url}
                      alt={entry.artwork_title || 'Artwork'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="font-semibold line-clamp-1">{entry.artwork_title}</h3>
                    <p className="text-sm text-muted-foreground">
                      by @{entry.creator_username || 'Unknown'}
                    </p>
                  </div>

                  {entry.submission_notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      "{entry.submission_notes}"
                    </p>
                  )}

                  {/* Score Input */}
                  <div className="pt-4 border-t">
                    <Label className="text-xs uppercase tracking-widest">Your Score (1-10)</Label>
                    <div className="flex gap-3 mt-2">
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={selectedEntryId === entry.id ? score : ''}
                        onChange={(e) => {
                          setSelectedEntryId(entry.id);
                          setScore(Number(e.target.value));
                        }}
                        placeholder="Score"
                        className="w-24"
                      />

                      <Button
                        onClick={() => handleSubmitScore(entry.id)}
                        disabled={isSubmitting || selectedEntryId !== entry.id || !score}
                        size="sm"
                      >
                        {isSubmitting && selectedEntryId === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <Textarea
                      placeholder="Add comments (optional)"
                      value={selectedEntryId === entry.id ? comments : ''}
                      onChange={(e) => {
                        setSelectedEntryId(entry.id);
                        setComments(e.target.value);
                      }}
                      className="mt-3 text-sm min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
