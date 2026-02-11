'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CalendarIcon, Award, Users, ArrowRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetContestsQuery } from '@/app/api/contestsApi'; // ← Your RTK Query API
import isApiError from '@/lib/isApiError';
export default function OpportunitiesPage() {
  const {
    data: contestsResponse,
    isLoading,
    isError,
    error,
  } = useGetContestsQuery({
    activeOnly: true,
    limit: 20,
  });

  // Extract the actual array from the response
  const contests = contestsResponse?.contests ?? [];
  // Helper to format prize amount
  const formatPrize = (prizes: any[] | null) => {
    if (!prizes || prizes.length === 0) return 'Prizes available';
    const totalINR = prizes.reduce((sum, p) => sum + (p.amount_inr || 0), 0);
    if (totalINR === 0) return 'Prizes available';
    return `₹${(totalINR / 100).toLocaleString('en-IN')}`;
  };

  // Helper to get main prize rank 1
  const getTopPrize = (prizes: any[] | null) => {
    if (!prizes) return null;
    const top = prizes.find((p) => p.rank === 1);
    return top ? `1st: ₹${(top.amount_inr / 100).toLocaleString('en-IN')}` : null;
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Fan Art Opportunities</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Discover contests and licensing opportunities for your fan art
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Fan Art Opportunities</h1>
        <p className="text-red-600">Failed to load contests. Please try again later.</p>

        {isApiError(error) && error.data?.message && (
          <p className="text-sm text-muted-foreground mt-2">{error.data.message}</p>
        )}
      </div>
    );
  }

  // const featuredContests = contests.filter((c) =>
  //   ['Marvel Cinematic Universe Art Challenge', 'Anime Expo 2023 Fan Art Contest'].includes(c.title)
  // );

  // const regularContests = contests.filter((c) => !featuredContests.includes(c));

  return (
    <div className="container py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Fan Art Opportunities</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Discover contests and licensing opportunities for your fan art
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="all">All Contests</TabsTrigger>
            <TabsTrigger value="contests">Active Contests</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          <Link href="/dashboard/opportunities/create">
            <Button>
              Create Contest
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <TabsContent value="all" className="mt-6 space-y-12">
          {/* Featured Contests */}
          {/* {featuredContests.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Featured Contests
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredContests.map((contest) => (
                  <Card
                    key={contest.id}
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-48 w-full bg-gradient-to-br from-purple-600 to-pink-600">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Trophy className="h-20 w-20 text-white/30" />
                      </div>
                      <div className="absolute right-2 top-2">
                        <Badge className="bg-black/70 text-white">Featured</Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1 text-lg">{contest.title}</CardTitle>
                      <CardDescription>
                        Ends{' '}
                        {new Date(contest.submission_end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                        {contest.description}
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Top Prize</span>
                          <span className="text-lg font-bold text-green-600">
                            {getTopPrize(contest.prizes) || formatPrize(contest.prizes)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            Submissions close in{' '}
                            {Math.ceil(
                              (new Date(contest.submission_end_date).getTime() - Date.now()) /
                                (1000 * 60 * 60 * 24)
                            )}{' '}
                            days
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/opportunities/${contest.id}`} className="w-full">
                        <Button className="w-full">Enter Contest</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )} */}

          {/* All Contests */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">All Active Contests</h2>
            {/* {regularContests.length === 0 && featuredContests.length === 0 ? ( */}
            {contests.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No active contests at the moment. Check back soon!
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contests.map((contest) => (
                  <Card
                    key={contest.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48 w-full bg-gradient-to-r from-blue-500 to-indigo-600">
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm font-medium">Total Prize Pool</p>
                        <p className="text-2xl font-bold">{formatPrize(contest.prizes)}</p>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{contest.title}</CardTitle>
                      <CardDescription>
                        Ends {new Date(contest.submission_end_date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {contest.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Max {contest.max_entries_per_user} entries</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span>{contest.prizes?.length || 0} prizes</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/opportunities/${contest.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          View & Enter
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="contests" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contests.map((contest) => (
              <Card key={contest.id} className="overflow-hidden">
                <div className="relative h-48 w-full bg-gradient-to-br from-purple-600 to-indigo-700">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-2xl font-bold">{formatPrize(contest.prizes)}</p>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{contest.title}</CardTitle>
                  <CardDescription>
                    Due {new Date(contest.submission_end_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {contest.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{contest.prizes?.length || 1} prize(s)</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/opportunities/${contest.id}`} className="w-full">
                    <Button className="w-full">Enter Now</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <p className="text-center text-muted-foreground py-12">
            Upcoming contests will appear here when announced.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
