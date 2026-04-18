'use client';

import { useParams } from 'next/navigation';
import { useGetUserByIdQuery } from '@/services/api/userApi';
import { useGetJudgeContestsQuery } from '@/services/api/contestsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, Trophy, Calendar } from 'lucide-react';

export default function JudgeMonitorPage() {
  const { judgeId } = useParams<{ judgeId: string }>();

  const { data: judge, isLoading: judgeLoading } = useGetUserByIdQuery(judgeId);
  const { data, isLoading: contestsLoading } = useGetJudgeContestsQuery(undefined);

  const judgeContests = data?.contests || [];
  if (judgeLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!judge) {
    return <div className="text-center py-20">Judge not found</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={judge.avatar_url ?? undefined} />
          <AvatarFallback>{judge.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">@{judge.username}</h1>
          <p className="text-muted-foreground">Contest Judge</p>
          <Badge variant="secondary" className="mt-2">
            Judge
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Judge Info */}
        <Card>
          <CardHeader>
            <CardTitle>Judge Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>Email:</strong> {judge.email}
            </p>
            <p>
              <strong>Status:</strong> {judge.status}
            </p>
            <p>
              <strong>Joined:</strong> {new Date(judge.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        {/* Contests Being Judged */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Contests Handling
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contestsLoading ? (
              <Skeleton className="h-32" />
            ) : judgeContests.length === 0 ? (
              <p className="text-muted-foreground">No active contests assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {judgeContests.map((contest: any) => (
                  <div
                    key={contest.id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{contest.title}</p>
                      <p className="text-sm text-muted-foreground">{contest.status}</p>
                    </div>
                    <Badge>{contest.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
