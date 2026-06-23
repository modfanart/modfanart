'use client';

import { useAuth } from '@/store/AuthContext';
import { useGetJudgeContestsQuery } from '@/services/api/contestsApi';
import type { Contest } from '@/services/api/contestsApi';

export default function JudgeDashboardContent() {
  const { user, loading } = useAuth();

  const { data, isLoading } = useGetJudgeContestsQuery(undefined, {
    skip: !user,
  });

  if (loading || isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (!user) {
    return <div className="p-6">Not authenticated</div>;
  }

  const contests: Contest[] = data?.contests ?? [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Judge Dashboard</h1>

      <p className="text-sm text-muted-foreground">Welcome {user.username}</p>

      <div className="grid gap-4">
        {contests.length === 0 && (
          <div className="border rounded-lg p-4">No contests assigned to you.</div>
        )}

        {contests.map((contest) => (
          <div key={contest.id} className="border rounded-lg p-4 space-y-2">
            <h2 className="font-semibold text-lg">{contest.title}</h2>

            <p className="text-sm text-muted-foreground">{contest.description}</p>

            <p className="text-sm">
              <strong>Status:</strong> {contest.status}
            </p>

            <p className="text-sm">
              <strong>Start:</strong> {new Date(contest.start_date).toLocaleDateString()}
            </p>

            <p className="text-sm">
              <strong>Submissions close:</strong>{' '}
              {new Date(contest.submission_end_date).toLocaleDateString()}
            </p>

            {contest.judging_end_date && (
              <p className="text-sm">
                <strong>Judging ends:</strong>{' '}
                {new Date(contest.judging_end_date).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
