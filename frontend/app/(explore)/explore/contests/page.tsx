'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Award, Users, Trophy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { useGetContestsQuery } from '@/services/api/contestsApi';
import isApiError from '@/lib/isApiError';
import { cn } from '@/lib/utils';

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

  const contests = contestsResponse?.contests ?? [];
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'upcoming'>('all');

  // Safe prize formatting - USD only
  const formatPrizePool = (prizes: any[] | null | undefined) => {
    if (!prizes || prizes.length === 0) return 'Prizes available';

    const totalUSD = prizes.reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0);
    if (totalUSD === 0) return 'Prizes available';

    return `$${totalUSD.toLocaleString('en-US')}`;
  };

  // Get top prize for quick display
  const getTopPrize = (prizes: any[] | null | undefined) => {
    if (!prizes || prizes.length === 0) return null;
    return prizes.find((p: any) => p.rank === 1) || prizes[0];
  };

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="container py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl bg-muted" />
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (isError) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg text-muted-foreground">Failed to load contests</p>
        {isApiError(error) && error.data?.message && (
          <p className="text-sm mt-2 text-muted-foreground">{error.data.message}</p>
        )}
      </div>
    );
  }

  /* ---------------- FILTER ---------------- */
  const filteredContests =
    activeTab === 'all'
      ? contests
      : activeTab === 'active'
        ? contests.filter((c: any) => c.status === 'live')
        : []; // upcoming logic can be expanded later

  return (
    <div className="container py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground mt-2">
            Discover creative contests and win amazing prizes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24">
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg p-3 space-y-2">
              {[
                { key: 'all', label: 'All Contests' },
                { key: 'active', label: 'Active Now' },
                { key: 'upcoming', label: 'Upcoming' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl text-left font-medium transition-all duration-200',
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ---------------- MAIN CONTENT ---------------- */}
        <div className="lg:col-span-9">
          {filteredContests.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground">
              No contests available at the moment.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContests.map((contest: any) => {
                const topPrize = getTopPrize(contest.prizes);
                const prizePool = formatPrizePool(contest.prizes);

                return (
                  <Card
                    key={contest.id}
                    className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
                  >
                    {/* Hero Image Banner */}
                    <div className="relative h-48 overflow-hidden">
                      {contest.hero_image ? (
                        <Image
                          src={contest.hero_image}
                          alt={contest.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/80 to-indigo-500" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                      {/* Prize Pool Overlay */}
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-xs opacity-80 flex items-center gap-1">
                          <Trophy className="h-3.5 w-3.5" /> Prize Pool
                        </p>
                        <p className="text-xl font-bold tracking-tight">{prizePool}</p>
                      </div>

                      {/* Status Badge */}
                      {contest.status === 'live' && (
                        <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600">
                          LIVE
                        </Badge>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="line-clamp-2 text-lg leading-tight">
                        {contest.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {contest.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          <span>Max {contest.max_entries_per_user || 1} entries</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Award className="h-4 w-4" />
                          <span>{contest.prizes?.length || 0} prizes</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2">
                      <Link href={`/contest/${contest.id}`} className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                          View Contest & Enter
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
