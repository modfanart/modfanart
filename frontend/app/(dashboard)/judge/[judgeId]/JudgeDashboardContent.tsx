'use client';

import { useAuth } from '@/store/AuthContext';
import { useGetJudgeContestsQuery } from '@/services/api/contestsApi';
import type { Contest } from '@/services/api/contestsApi';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Trophy, Calendar, Clock, Users, Award, Eye, ArrowRight, ShieldCheck } from 'lucide-react';

import Link from 'next/link';
import { format } from 'date-fns';

export default function JudgeDashboardContent() {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading, isError } = useGetJudgeContestsQuery(undefined, {
    skip: !user,
  });

  const contests: Contest[] = data?.contests ?? [];

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

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load your assigned contests. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>You need to be logged in to access the Judge Dashboard.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Judge Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, @{user.username}</p>
          </div>
        </div>

        <Button asChild variant="outline">
          <Link href="/judge/profile">View My Profile</Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Contests</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active judging assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Judging</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {contests.filter((c) => c.status === 'judging').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Contests currently in judging phase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {contests.filter((c) => c.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Contests you have judged</p>
          </CardContent>
        </Card>
      </div>

      {/* Contests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Assigned Contests
          </CardTitle>
          <CardDescription>Contests where you have been invited as a judge</CardDescription>
        </CardHeader>

        <CardContent>
          {contests.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No contests assigned yet</h3>
              <p className="text-muted-foreground mt-2">
                You will be notified when a brand invites you to judge a contest.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contests.map((contest) => {
                const isJudging = contest.status === 'judging';
                const isCompleted = contest.status === 'completed';

                return (
                  <Card key={contest.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="line-clamp-2 text-lg">{contest.title}</CardTitle>
                        <Badge
                          variant={isJudging ? 'default' : isCompleted ? 'secondary' : 'outline'}
                        >
                          {contest.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {contest.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Submissions close:{' '}
                          {format(new Date(contest.submission_end_date), 'dd MMM yyyy')}
                        </span>
                      </div>

                      {contest.judging_end_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Judging ends:{' '}
                            {format(new Date(contest.judging_end_date), 'dd MMM yyyy')}
                          </span>
                        </div>
                      )}

                      <div className="pt-4 border-t flex gap-3">
                        <Button asChild variant="default" className="flex-1">
                          <Link href={`/contest/${contest.slug}/judge`}>
                            Start Judging
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
