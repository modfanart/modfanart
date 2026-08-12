'use client';

import {
  useGetContestQuery,
  useGetContestEntriesQuery,
} from '@/services/api/contestsApi';

import { JudgeEntryCard } from '@/components/opportunities/judge-entry-card';

export function JudgeOpportunityContent({
  contestId,
}: {
  contestId: string;
}) {
  const { data: contest, isLoading: contestLoading } =
    useGetContestQuery(contestId);

  // Mirrors the contest page: approved entries only, and the backend maximum
  // rather than the default 20 so a large contest is not silently truncated.
  const {
    data: entriesData,
    isLoading: entriesLoading,
    isError,
  } = useGetContestEntriesQuery({
    contestId,
    status: 'approved',
    limit: 100,
  });

  const entries = entriesData?.entries ?? [];

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
      {entries.map((entry) => (
        <JudgeEntryCard key={entry.id} entry={entry} contestId={contestId} />
      ))}
    </div>
  );
}
