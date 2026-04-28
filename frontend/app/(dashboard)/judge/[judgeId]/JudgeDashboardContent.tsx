'use client';

import { useAuth } from '@/store/AuthContext';
import {
  useGetJudgeContestsQuery,
  useGetJudgeInvitationsQuery,
  useAcceptJudgeInvitationMutation,
} from '@/services/api/contestsApi';

import type { Contest } from '@/services/api/contestsApi';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Trophy, Calendar, Clock, Award, Eye, ArrowRight, ShieldCheck } from 'lucide-react';

import Link from 'next/link';
import { format } from 'date-fns';

export default function JudgeDashboardContent() {
  const { user, loading: authLoading } = useAuth();

  // ✅ Accepted contests
  const { data, isLoading, isError, refetch } = useGetJudgeContestsQuery(undefined, {
    skip: !user,
  });

  // 🆕 Pending invites
  const { data: inviteData, refetch: refetchInvites } = useGetJudgeInvitationsQuery(undefined, {
    skip: !user,
  });

  const [acceptInvitation, { isLoading: accepting }] = useAcceptJudgeInvitationMutation();

  const contests: Contest[] = data?.contests ?? [];
  const invitations: Contest[] = inviteData?.contests ?? [];

  // =============================
  // Loading
  // =============================
  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // =============================
  // Error
  // =============================
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load your assigned contests.</AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>You need to be logged in.</AlertDescription>
      </Alert>
    );
  }

  // =============================
  // Accept handler
  // =============================
  const handleAccept = async (contestId: string) => {
    try {
      await acceptInvitation({
        contestId,
        judgeId: user.id,
      }).unwrap();

      // 🔄 refresh both sections
      refetch();
      refetchInvites();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Judge Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, @{user.username}</p>
          </div>
        </div>

        <Button asChild variant="outline">
          <Link href="/judge/profile">View My Profile</Link>
        </Button>
      </div>

      {/* ================= INVITATIONS ================= */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Accept invitations to start judging</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {invitations.map((contest) => (
                <Card key={contest.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{contest.title}</CardTitle>
                    <CardDescription>{contest.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex gap-3">
                    <Button
                      className="flex-1"
                      disabled={accepting}
                      onClick={() => handleAccept(contest.id)}
                    >
                      Accept
                    </Button>

                    <Button variant="outline" className="flex-1" disabled>
                      Ignore
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================= STATS ================= */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Assigned Contests</CardTitle>
            <Trophy className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Pending Judging</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {contests.filter((c) => c.status === 'judging').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
            <Award className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {contests.filter((c) => c.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= ACCEPTED CONTESTS ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Contests</CardTitle>
          <CardDescription>Contests you have accepted</CardDescription>
        </CardHeader>

        <CardContent>
          {contests.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p>No accepted contests yet</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contests.map((contest) => {
                const isJudging = contest.status === 'judging';
                const isCompleted = contest.status === 'completed';

                return (
                  <Card key={contest.id}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{contest.title}</CardTitle>
                        <Badge>{contest.status}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(contest.submission_end_date), 'dd MMM yyyy')}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button asChild className="flex-1">
                          <Link href={`/contest/${contest.slug}/judge`}>
                            Start
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>

                        <Button asChild variant="outline" size="icon">
                          <Link href={`/contest/${contest.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
