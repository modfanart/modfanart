'use client';

import Link from 'next/link';
import {
  Users,
  Building2,
  Award,
  ArrowRight,
  Palette,
  Briefcase,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Import your existing queries (adjust paths as needed)
import { useGetAllUsersQuery } from '@/services/api/userApi';
import { useGetAllBrandsQuery } from '@/services/api/brands';
import { useGetContestsQuery } from '@/services/api/contestsApi';
import { LayoutWrapper } from '@/components/layout-wrapper';

const PREVIEW_LIMIT = 4;

export default function ExplorePage() {
  // Artists preview
  const { data: artistsData, isLoading: artistsLoading } = useGetAllUsersQuery({
    page: 1,
    limit: PREVIEW_LIMIT,
    search: '',
  });
  const previewArtists = artistsData?.users?.filter((u) => u.role?.name === 'artist') || [];

  // Brands preview
  const { data: brandsData, isLoading: brandsLoading } = useGetAllBrandsQuery({
    limit: PREVIEW_LIMIT,
    offset: 0,
    sortBy: 'followers_count',
    sortOrder: 'desc',
    status: 'active',
  });
  const previewBrands = brandsData?.brands || [];

  // Contests preview
  const { data: contestsData, isLoading: contestsLoading } = useGetContestsQuery({
    activeOnly: true,
    limit: PREVIEW_LIMIT,
  });
  const previewContests = contestsData?.contests ?? [];

  const formatPrize = (prizes: any[] | null) => {
    if (!prizes?.length) return 'Prizes';
    const total = prizes.reduce((sum, p) => sum + (p.amount_inr || 0), 0);
    return total > 0 ? `₹${(total / 100).toLocaleString('en-IN')}` : 'Prizes';
  };

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-background">
        <div className="container px-4 md:px-6 py-12 md:py-16">
          {/* Artists Section */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Palette className="h-7 w-7 text-purple-600" />
                <h2 className="text-2xl md:text-3xl font-bold">Featured Artists</h2>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/explore/artists">
                  View All Artists <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {artistsLoading ? (
              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: PREVIEW_LIMIT }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-5 w-28 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {previewArtists.map((artist) => (
                  <Link key={artist.id} href={`/u/${artist.username}`}>
                    <Card className="hover:shadow-md transition-all h-full">
                      <CardContent className="p-5 text-center space-y-3">
                        <Avatar className="h-16 w-16 mx-auto">
                          <AvatarImage src={artist.avatar_url ?? undefined} />
                          <AvatarFallback>
                            {artist.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">@{artist.username}</p>
                          {artist.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {artist.bio}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {previewArtists.length === 0 && !artistsLoading && (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    No artists found
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Brands Section */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-7 w-7 text-blue-600" />
                <h2 className="text-2xl md:text-3xl font-bold">Popular Brands</h2>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/explore/brands">
                  View All Brands <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {brandsLoading ? (
              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: PREVIEW_LIMIT }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-28 w-full rounded-t-lg" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {previewBrands.map((brand) => (
                  <Link key={brand.id} href={`/brand/${brand.slug}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-all h-full">
                      {brand.banner_url && (
                        <div className="h-24 w-full">
                          <img
                            src={brand.banner_url}
                            alt={brand.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          {brand.logo_url && (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              className="h-10 w-10 rounded-md object-cover border"
                            />
                          )}
                          <div>
                            <p className="font-semibold line-clamp-1">{brand.name}</p>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Active
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {brand.description || 'Brand collaborating with creators'}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {previewBrands.length === 0 && !brandsLoading && (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    No brands found
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Opportunities / Contests Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-7 w-7 text-amber-600" />
                <h2 className="text-2xl md:text-3xl font-bold">Active Opportunities</h2>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/explore/opportunities">
                  View All Contests <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {contestsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-40 w-full" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-6 w-4/5" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {previewContests.map((contest) => (
                  <Link key={contest.id} href={`/opportunities/${contest.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-all h-full">
                      <div className="relative h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-end p-5">
                        <div>
                          <p className="text-2xl font-bold">{formatPrize(contest.prizes)}</p>
                          <p className="text-sm text-muted-foreground">Prize Pool</p>
                        </div>
                      </div>
                      <CardContent className="p-5 space-y-3">
                        <h3 className="font-semibold line-clamp-2">{contest.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {contest.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" />
                            <span>{contest.prizes?.length || 1} prizes</span>
                          </div>
                          <div>
                            Ends {new Date(contest.submission_end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {previewContests.length === 0 && !contestsLoading && (
                  <p className="col-span-full text-center text-muted-foreground py-12">
                    No active contests right now — check back soon!
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Final CTA */}
          <div className="text-center mt-16 py-10 border-t">
            <h3 className="text-2xl font-bold mb-4">Ready to dive deeper?</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/explore/artists">Explore Artists</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/explore/brands">Discover Brands</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/explore/opportunities">View Contests</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
