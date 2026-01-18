'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  Share2,
  BookmarkPlus,
  Trophy,
  Users,
  Calendar,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useGetContestQuery } from '@/app/api/contestsApi';
import type { Contest } from '@/app/api/contestsApi';

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const contestId = params.id;

  const { data, isLoading, isError } = useGetContestQuery(contestId, {
    skip: !contestId,
  });

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading contest details…</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Contest Not Found</h1>
        <p className="mt-4 text-muted-foreground">
          The contest you're looking for doesn't exist, has ended, or was removed.
        </p>
        <Link href="/opportunities" className="mt-8 inline-block">
          <Button>← Back to All Opportunities</Button>
        </Link>
      </div>
    );
  }

  const contest: Contest = data;

  const formatPrize = (prizes: Contest['prizes']) => {
    if (!prizes?.length) return 'Prizes TBA';
    const total = prizes.reduce((sum, p) => sum + (Number(p.amount_inr) || 0), 0);
    return total > 0 ? `₹${(total / 100).toLocaleString('en-IN')}` : 'Prizes TBA';
  };

  const topPrize = contest.prizes?.find((p) => p.rank === 1);
  const topPrizeText = topPrize?.amount_inr
    ? `1st Prize: ₹${(Number(topPrize.amount_inr) / 100).toLocaleString('en-IN')}`
    : formatPrize(contest.prizes);

  const endDate = new Date(contest.submission_end_date);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));
  const isActive = daysLeft > 0 && contest.status === 'live';

  // Generate storefront link using brand_id
  const storefrontUrl = contest.brand_id
    ? `/marketplace/storefront/${contest.brand_id}`
    : '#'; // fallback if brand_id is missing

  return (
    <div className="container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/opportunities" className="hover:text-foreground hover:underline">
          Opportunities
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{contest.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Main content */}
        <div className="space-y-8">
          {/* Hero */}
          <div className="relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Trophy className="h-40 w-40" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge variant="outline" className="mb-2 bg-black/40 backdrop-blur-sm">
                {contest.slug.includes('design') ? 'Design' : 'Art & Illustration'}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-white">
                {contest.title}
              </h1>
            </div>
          </div>

          {/* Actions + status */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Hosted by – now clickable */}
              <Link
                href={storefrontUrl}
                className="flex items-center gap-2 transition-colors hover:text-primary group"
              >
                <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
                <div>
                  <p className="font-medium group-hover:underline">
                    Hosted by Organizer
                  </p>
                  <p className="text-sm text-muted-foreground">
                    View storefront →
                  </p>
                </div>
              </Link>

              <Badge
                variant="secondary"
                className={
                  isActive
                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                }
              >
                {isActive ? 'Active' : 'Closed'}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="prizes">Prizes</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="prose prose-neutral max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: contest.description || '' }} />
              {!contest.description && (
                <p className="text-muted-foreground italic">
                  No detailed description available for this contest.
                </p>
              )}
            </TabsContent>

            {/* Rules tab – unchanged */}
            <TabsContent value="rules">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Contest Rules & Requirements</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <span>Submissions close on {endDate.toLocaleDateString('en-IN')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <span>Maximum {contest.max_entries_per_user || '—'} entries per participant</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-primary/20" />
                    <span>Artwork must be 100% original</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-primary/20" />
                    <span>Suitable for all audiences (no NSFW content)</span>
                  </li>
                </ul>

                {contest.rules && (
                  <div
                    className="prose prose-sm mt-6 border-t pt-6"
                    dangerouslySetInnerHTML={{ __html: contest.rules }}
                  />
                )}
              </div>
            </TabsContent>

            {/* Prizes tab – unchanged */}
            <TabsContent value="prizes">
              <h3 className="text-xl font-semibold">Prize Distribution</h3>
              {contest.prizes?.length ? (
                <div className="mt-4 space-y-4">
                  {[...contest.prizes]
                    .sort((a, b) => a.rank - b.rank)
                    .map((prize) => (
                      <div
                        key={prize.rank}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                            {prize.rank}
                          </div>
                          <div>
                            <p className="font-medium">
                              {prize.rank === 1
                                ? 'Grand Prize'
                                : `${prize.rank}${ordinal(prize.rank)} Place`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {prize.type || 'Cash Prize'}
                            </p>
                          </div>
                        </div>
                        {prize.amount_inr && (
                          <p className="text-lg font-bold text-green-600">
                            ₹{(Number(prize.amount_inr) / 100).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="mt-4 text-muted-foreground">
                  Prize details will be announced soon.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-8 border shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deadline</span>
                    <div className="text-right">
                      <p className="font-medium">
                        {endDate.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          daysLeft > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Closed'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prize Pool</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrize(contest.prizes)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Top Prize</span>
                    <span className="font-medium">{topPrizeText}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Max {contest.max_entries_per_user || '—'} entries / user</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" disabled={!isActive} asChild>
                  {isActive ? (
                    <Link href={`/submissions/new?contest=${contest.id}`}>
                      Submit Your Artwork
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    'Submissions Closed'
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  You need to be logged in to submit work
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'] as const;
  const v = n % 100;

  // Special case for 11,12,13
  if (v >= 11 && v <= 13) return 'th';

  // Last digit rule
  switch (v % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}