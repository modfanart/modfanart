'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CalendarIcon, Users, Trophy, Eye, Award, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

import { useGetMySubmittedContestsQuery } from '@/services/api/contestsApi'; // ← New or modified RTK Query hook
import { useToast } from '@/components/ui/use-toast';

function getStatusBadge(status: string) {
  switch (status) {
    case 'live':
    case 'published':
      return { label: 'Active', variant: 'default' as const };
    case 'judging':
      return { label: 'Judging', variant: 'outline' as const };
    case 'completed':
    case 'archived':
      return { label: 'Closed', variant: 'secondary' as const };
    default:
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        variant: 'secondary' as const,
      };
  }
}

export default function ArtistOpportunitiesPage() {
  const { toast } = useToast();

  const { data: response, isLoading, isError } = useGetMySubmittedContestsQuery();
  const contests = response?.contests ?? [];
  // Filter contests based on status
  const activeContests = contests.filter((c: any) => ['live', 'published'].includes(c.status));
  const judgingContests = contests.filter((c: any) => c.status === 'judging');
  const closedContests = contests.filter((c: any) => ['completed', 'archived'].includes(c.status));

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[420px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <p className="text-destructive">
          Failed to load your opportunities. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">My Opportunities</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Contests and opportunities you have submitted entries to
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-8">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="all" className="rounded-lg px-6">
            All
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-lg px-6">
            Active
          </TabsTrigger>
          <TabsTrigger value="judging" className="rounded-lg px-6">
            Judging
          </TabsTrigger>
          <TabsTrigger value="closed" className="rounded-lg px-6">
            Closed
          </TabsTrigger>
        </TabsList>

        {/* ALL */}
        <TabsContent value="all">
          <OpportunityGrid items={contests} />
        </TabsContent>

        {/* ACTIVE */}
        <TabsContent value="active">
          <OpportunityGrid items={activeContests} />
        </TabsContent>

        {/* JUDGING */}
        <TabsContent value="judging">
          <OpportunityGrid items={judgingContests} showJudgingStatus />
        </TabsContent>

        {/* CLOSED */}
        <TabsContent value="closed">
          <OpportunityGrid items={closedContests} isClosed />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function OpportunityGrid({
  items,
  isClosed = false,
  showJudgingStatus = false,
}: {
  items: any[];
  isClosed?: boolean;
  showJudgingStatus?: boolean;
}) {
  if (items.length === 0) {
    return <EmptyState isClosed={isClosed} />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((opp: any) => {
        const statusInfo = getStatusBadge(opp.status);
        const deadline = opp.submission_end_date || opp.end_date;

        return (
          <Card
            key={opp.id}
            className="group overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col"
          >
            {/* Image */}
            <div className="relative h-52 overflow-hidden">
              <Image
                src={opp.hero_image || '/placeholder.svg?height=400&text=Contest'}
                alt={opp.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute top-3 right-3">
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="line-clamp-2 text-lg leading-tight">{opp.title}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <p className="line-clamp-3 text-sm text-muted-foreground">{opp.description}</p>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{deadline ? new Date(deadline).toLocaleDateString() : 'No deadline'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{opp.entry_count ?? 0} total entries</span>
                </div>
              </div>

              {/* Artist-specific info */}
              {opp.my_entry && (
                <div className="pt-3 border-t text-sm">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Award className="h-4 w-4" />
                    <span>You submitted an entry</span>
                  </div>
                  {opp.my_entry.submitted_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted on {new Date(opp.my_entry.submitted_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-4 border-t">
              <div className="flex w-full gap-3">
                <Button asChild variant="default" className="flex-1">
                  <Link href={`/dashboard/opportunities/${opp.id}/my-entry`}>
                    {isClosed || opp.status === 'completed'
                      ? 'View Results'
                      : showJudgingStatus
                        ? 'Check Judging'
                        : 'Manage Entry'}
                  </Link>
                </Button>

                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/opportunities/${opp.slug || opp.id}`}>View Contest</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

// Empty State
function EmptyState({ isClosed = false }: { isClosed?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl">
      <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">No opportunities yet</h3>
      <p className="text-muted-foreground max-w-sm">
        {isClosed
          ? "You haven't participated in any closed opportunities yet."
          : "You haven't submitted to any opportunities yet."}
      </p>
      <Button asChild className="mt-6">
        <Link href="/opportunities">Browse Opportunities</Link>
      </Button>
    </div>
  );
}
