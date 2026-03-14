// app/contest/[id]/monitor/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  useGetContestQuery,
  useGetContestEntriesQuery,
  Contest,
  ContestEntry,
} from '@/services/api/contestsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Users, Clock, AlertCircle } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';

export default function ContestMonitorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: contest, isLoading: contestLoading } = useGetContestQuery(id);
  const { data: entriesData, isLoading: entriesLoading } = useGetContestEntriesQuery({
    contestId: id,
  });

  const entries = entriesData?.entries ?? [];

  if (contestLoading || !contest) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isLive = contest.status === 'live';
  const canManage = contest.status !== 'completed' && contest.status !== 'archived';

  return (
    <DashboardShell>
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{contest.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={isLive ? 'default' : 'outline'}>{contest.status}</Badge>
              <span className="text-muted-foreground">
                {format(new Date(contest.start_date), 'd MMM')} –{' '}
                {format(new Date(contest.submission_end_date), 'd MMM yyyy')}
              </span>
            </div>
          </div>

          {canManage && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push(`/contest/${id}/edit`)}>
                Edit Contest
              </Button>
              {contest.status === 'published' && <Button>Start Contest</Button>}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard icon={<Users />} title="Entries" value={entries.length} />
          <StatCard icon={<Trophy />} title="Prizes" value={contest.prizes?.length ?? 0} />
          <StatCard icon={<Clock />} title="Phase" value={contest.status.toUpperCase()} />
          <StatCard icon={<AlertCircle />} title="Moderation" value="0 pending" />{' '}
          {/* TODO: real count */}
        </div>

        <Tabs defaultValue="entries" className="space-y-6">
          <TabsList>
            <TabsTrigger value="entries">Entries ({entries.length})</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="judges">Judges</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="entries">
            <Card>
              <CardHeader>
                <CardTitle>Submitted Entries</CardTitle>
                <CardDescription>Review, approve or reject submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {entriesLoading ? (
                  <div>Loading entries...</div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No entries submitted yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry: ContestEntry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          {/* Thumbnail placeholder */}
                          <div className="h-16 w-16 bg-muted rounded-md" />
                          <div>
                            <p className="font-medium">Entry #{entry.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Submitted {format(new Date(entry.created_at), 'd MMM yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              entry.status === 'approved'
                                ? 'default'
                                : entry.status === 'rejected'
                                  ? 'destructive'
                                  : entry.status === 'winner'
                                    ? 'secondary'
                                    : 'outline'
                            }
                          >
                            {entry.status}
                          </Badge>
                          {entry.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline">
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive">
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs placeholders */}
          <TabsContent value="leaderboard">
            <Card>
              <CardContent className="py-12 text-center">Leaderboard coming soon...</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="judges">
            <Card>
              <CardContent className="py-12 text-center">
                Judges management coming soon...
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="text-primary/70">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
