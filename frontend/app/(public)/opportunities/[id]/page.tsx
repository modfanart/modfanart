'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Share2, BookmarkPlus, Eye, CalendarIcon, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetContestQuery } from '@/app/api/contestsApi'; // Adjust path if needed

export default function OpportunityDetailPage({
  params,
}: {
  params: { id: string }; // Use slug for better URLs
}) {
  const { id } = params;

  const { data: contest, isLoading, isError, error } = useGetContestQuery(id); // Fetch by slug (ensure your backend supports /contest/:slug or change to id)

  if (isLoading) {
    return <div className="container py-10">Loading contest details...</div>;
  }

  if (isError || !contest) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Contest not found</h1>
        <p className="mt-4">The contest you're looking for doesn't exist or has been removed.</p>
        <Link href="/opportunities" className="mt-6 inline-block">
          <Button>Back to Opportunities</Button>
        </Link>
      </div>
    );
  }

  // Format prize pool
  const formatPrize = (prizes: any[] | null) => {
    if (!prizes || prizes.length === 0) return 'Prizes available';
    const totalINR = prizes.reduce((sum, p) => sum + (p.amount_inr || 0), 0);
    return totalINR > 0 ? `₹${(totalINR / 100).toLocaleString('en-IN')}` : 'Prizes available';
  };

  // Top prize for display
  const topPrize = contest.prizes?.find((p) => p.rank === 1);

  const topPrizeText =
    topPrize && typeof topPrize.amount_inr === 'number'
      ? `1st: ₹${(topPrize.amount_inr / 100).toLocaleString('en-IN')}`
      : formatPrize(contest.prizes);

  // Days until submission ends (current date: Jan 9, 2026 – all past, so show "Ended")
  const submissionEnd = new Date(contest.submission_end_date);
  const daysUntilEnd = Math.ceil((submissionEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const deadlineStatus = daysUntilEnd > 0 ? `${daysUntilEnd} days left` : 'Submissions closed';

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/opportunities" className="text-sm text-muted-foreground hover:text-foreground">
          Opportunities
        </Link>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm font-medium">{contest.title}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="h-32 w-32 text-white/20" />
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">{contest.title}</h1>
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

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200" />{' '}
              {/* Placeholder for brand logo */}
              <span className="font-medium">Brand Organizer</span>
            </div>
            <Badge
              variant="secondary"
              className={
                contest.status === 'live'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }
            >
              {contest.status === 'live' ? 'Active' : 'Closed'}
            </Badge>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>Views TBD</span>
            </div>
          </div>

          <Tabs defaultValue="details" className="mb-8">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="rules">Rules & Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 prose max-w-none">
              <p>{contest.description}</p>
              {contest.rules && <div dangerouslySetInnerHTML={{ __html: contest.rules }} />}
            </TabsContent>

            <TabsContent value="rules" className="mt-4">
              <h3 className="mb-4 text-xl font-semibold">Contest Rules</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Maximum {contest.max_entries_per_user} entries per artist</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Original artwork only</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Appropriate for all ages</span>
                </li>
              </ul>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <div className="mb-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Submission Deadline</span>
                  <div className="text-right">
                    <span className="font-medium block">
                      {submissionEnd.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-sm text-muted-foreground">{deadlineStatus}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Prize Pool</span>
                  <span className="font-medium text-2xl text-green-600">
                    {formatPrize(contest.prizes)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Top Prize</span>
                  <span className="font-medium">{topPrizeText}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Max {contest.max_entries_per_user} entries per user
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <Link href={`/submissions/new?contest=${contest.id}`} className="w-full">
                  <Button className="w-full" disabled={daysUntilEnd <= 0}>
                    {daysUntilEnd > 0 ? 'Submit Your Artwork' : 'Submissions Closed'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-center text-sm text-muted-foreground">
                  Login required to submit
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
