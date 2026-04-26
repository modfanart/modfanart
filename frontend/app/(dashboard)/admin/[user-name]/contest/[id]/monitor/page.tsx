'use client';

import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';

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
import { Trophy, Users, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';

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

  // Parse gallery safely
  const galleryImages: string[] = Array.isArray(contest.gallery)
    ? contest.gallery
    : typeof contest.gallery === 'string'
      ? JSON.parse(contest.gallery)
      : [];

  // Parse prizes safely and show in USD
  const prizes = Array.isArray(contest.prizes)
    ? contest.prizes
    : typeof contest.prizes === 'string'
      ? JSON.parse(contest.prizes)
      : [];

  return (
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

      {/* Hero Image */}
      {contest.hero_image && (
        <div className="mb-10 rounded-xl overflow-hidden border">
          <Image
            src={contest.hero_image}
            alt={contest.title}
            width={1200}
            height={400}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      )}

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard icon={<Users />} title="Total Entries" value={entries.length} />
        <StatCard icon={<Trophy />} title="Prizes" value={prizes.length} />
        <StatCard icon={<Clock />} title="Current Phase" value={contest.status.toUpperCase()} />
        <StatCard icon={<AlertCircle />} title="Moderation" value="0 pending" />
      </div>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Contest Gallery
            </CardTitle>
            <CardDescription>Visuals for this opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((url: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden border"
                >
                  <Image
                    src={url}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="entries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="entries">Entries ({entries.length})</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="judges">Judges</TabsTrigger>
          <TabsTrigger value="prizes">Prizes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* ENTRIES TAB */}
        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Entries</CardTitle>
              <CardDescription>Review, approve or reject submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="text-center py-8">Loading entries...</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No entries submitted yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {entries.map((entry: ContestEntry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-muted rounded-md flex-shrink-0" />
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

        {/* PRIZES TAB - Updated with USD */}
        <TabsContent value="prizes">
          <Card>
            <CardHeader>
              <CardTitle>Prize Pool</CardTitle>
              <CardDescription>All prize amounts are in US Dollars (USD)</CardDescription>
            </CardHeader>
            <CardContent>
              {prizes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No prizes configured yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {prizes.map((prize: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Rank #{prize.rank}</p>
                          <p className="text-sm text-muted-foreground">
                            {prize.description || prize.type}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {prize.amount_usd ? (
                          <p className="text-2xl font-bold text-green-600">
                            ${prize.amount_usd.toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Amount not set</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other placeholder tabs */}
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

        <TabsContent value="activity">
          <Card>
            <CardContent className="py-12 text-center">Activity log coming soon...</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
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
