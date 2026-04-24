'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetContestsQuery } from '@/services/api/contestsApi';
import isApiError from '@/lib/isApiError';
import { LayoutWrapper } from '@/components/layouts/layout-wrapper';
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

  const formatPrize = (prizes: any[] | null) => {
    if (!prizes || prizes.length === 0) return 'Prizes available';
    const totalINR = prizes.reduce((sum, p) => sum + (p.amount_inr || 0), 0);
    if (totalINR === 0) return 'Prizes available';
    return `₹${(totalINR / 100).toLocaleString('en-IN')}`;
  };

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <LayoutWrapper>
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
                <Skeleton key={i} className="h-64 rounded-2xl bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (isError) {
    return (
      <LayoutWrapper>
        <div className="container py-20 text-center">
          <p className="text-lg text-muted-foreground">Failed to load contests</p>

          {isApiError(error) && error.data?.message && (
            <p className="text-sm mt-2 text-muted-foreground">{error.data.message}</p>
          )}
        </div>
      </LayoutWrapper>
    );
  }

  /* ---------------- FILTER ---------------- */
  const filteredContests = activeTab === 'all' ? contests : activeTab === 'active' ? contests : []; // upcoming empty for now

  return (
    <LayoutWrapper>
      <div className="container py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ---------------- SIDEBAR ---------------- */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg p-3 space-y-2">
                {[
                  { key: 'all', label: 'All Contests' },
                  { key: 'active', label: 'Active' },
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

          {/* ---------------- CONTENT ---------------- */}
          <div className="lg:col-span-9">
            {filteredContests.length === 0 ? (
              <div className="text-center py-32 text-muted-foreground">No contests available.</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredContests.map((contest) => (
                  <Card
                    key={contest.id}
                    className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Banner */}
                    <div className="relative h-40 bg-gradient-to-br from-primary/80 to-indigo-500">
                      <div className="absolute inset-0 bg-black/20" />

                      <div className="absolute bottom-3 left-4 text-white">
                        <p className="text-xs opacity-80">Prize Pool</p>
                        <p className="text-xl font-bold">{formatPrize(contest.prizes)}</p>
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-1">{contest.title}</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {contest.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{contest.max_entries_per_user} entries</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          <span>{contest.prizes?.length || 0} prizes</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Link href={`/contest/${contest.id}`} className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                          View & Enter
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
