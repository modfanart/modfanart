'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  useGetContestQuery,
  useGetContestEntriesQuery,
} from '@/services/api/contestsApi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBasePath } from '@/hooks/getBasePath';
import { Trophy, Calendar, Users, Eye } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { JudgeEntryCard } from '@/components/opportunities/judge-entry-card';

export default function JudgeContestPage() {
  const { contestId } = useParams<{ contestId: string }>();
  const { user } = useAuth();
  const basePath = user ? getBasePath(user) : null;
  // Fetch contest details
  const { data: contest, isLoading: contestLoading } = useGetContestQuery(contestId);

  // Only entries the brand has approved are judgeable. The default page size is
  // 20, which would silently hide the rest of a large contest from a judge, so
  // ask for the backend's maximum instead.
  const { data: entriesData, isLoading: entriesLoading } = useGetContestEntriesQuery({
    contestId,
    status: 'approved',
    limit: 100,
  });

  const entries = entriesData?.entries ?? [];

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

          <Link href={`${basePath}/contest/${contestId}/review-queue`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Review Queue
            </Button>
          </Link>
        </div>
        {entries.length === 0 ? (
          <Alert>
            <AlertDescription>
              No entries are ready for judging yet. Only submissions the brand has approved
              appear here.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <JudgeEntryCard key={entry.id} entry={entry} contestId={contestId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
