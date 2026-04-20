// app/(dashboard)/brand/DashboardContent.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Eye,
  FileText,
  Image as ImageIcon,
  Calendar,
  Star,
  PlusCircle,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

import {
  useGetMyBrandsQuery,
  useGetBrandPostsQuery,
  useGetBrandArtworksQuery,
} from '@/services/api/brands';

import { useGetContestsQuery } from '@/services/api/contestsApi';

import { useAuth } from '@/store/AuthContext';
export default function DashboardContent() {
  const { user } = useAuth();
  const isBrandManager = user?.role?.name === 'brand_manager';

  // Get the primary brand (most brand managers manage only one)
  const primaryBrand = user?.brands?.[0];
  const brandId = primaryBrand?.id ?? '';
  const brandSlug = primaryBrand?.slug ?? '';
  const brandName = primaryBrand?.name ?? 'Your Brand';

  // ── Real data fetches ───────────────────────────────────────
  const { data: myBrands = [], isLoading: brandsLoading } = useGetMyBrandsQuery();
  const { data: posts = [], isLoading: postsLoading } = useGetBrandPostsQuery(brandId, {
    skip: !brandId,
  });
  const { data: artworks = [], isLoading: artworksLoading } = useGetBrandArtworksQuery(brandId, {
    skip: !brandId,
  });
  const { data: contestsData, isLoading: contestsLoading } = useGetContestsQuery({
    brandId,
    activeOnly: true,
    limit: 5,
  });

  const recentPosts = posts.slice(0, 4);
  const recentArtworks = artworks.slice(0, 4);
  const activeContests = contestsData?.contests ?? [];

  const totalStats = {
    posts: posts.length,
    artworks: artworks.length,
    activeCampaigns: activeContests.length,
    // pendingSubmissions: 0, // TODO: connect to contest entries
  };

  if (brandsLoading || postsLoading || artworksLoading || contestsLoading) {
    return (
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!isBrandManager || !primaryBrand) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-semibold">No brand found</h2>
        <p className="mt-2 text-muted-foreground">You are not managing any brand yet.</p>
        <Button className="mt-6" asChild>
          <Link href="/brand/verify">Start Brand Verification</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-6 lg:p-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{brandName} Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your fan art, campaigns, licenses, and community.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href={`/brand/${brandSlug}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Public Profile
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/brand/${brandSlug}/${user?.id}/contests/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Campaign
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FileText}
            title="Posts"
            value={totalStats.posts}
            trend="3 new this week"
          />
          <StatCard
            icon={ImageIcon}
            title="Artworks"
            value={totalStats.artworks}
            trend="+5 added recently"
          />
        </div>

        {/* Tabs: Recent Activity */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posts">Recent Posts</TabsTrigger>
            <TabsTrigger value="artworks">Storefront Highlights</TabsTrigger>
            <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
          </TabsList>

          {/* Recent Posts */}
          <TabsContent value="posts">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Posts</CardTitle>
                  <CardDescription>Latest updates shared with your fans</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/brand/${brandSlug}/${user?.id}/posts`}>
                    View All Posts
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentPosts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No posts yet. Start sharing updates!
                  </div>
                ) : (
                  <div className="space-y-6">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="flex gap-4">
                        {post.media_urls?.[0] ? (
                          <div className="shrink-0 h-16 w-16 rounded-md overflow-hidden bg-muted relative">
                            <Image src={post.media_urls[0]} alt="" fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="shrink-0 h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">{post.title || 'Untitled'}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {post.content?.replace(/<[^>]+>/g, '') || 'No content'}
                          </p>
                          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <span>Likes: {post.likes_count}</span>
                            <span>Comments: {post.comments_count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Artworks */}
          <TabsContent value="artworks">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Storefront Highlights</CardTitle>
                  <CardDescription>Featured artworks available for licensing</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/brand/${brandSlug}/${user?.id}/artworks`}>
                    Manage Storefront
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentArtworks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No artworks added yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {recentArtworks.map((art) => (
                      <div key={art.id} className="space-y-2">
                        <div className="aspect-square rounded-md overflow-hidden bg-muted relative group">
                          <Image
                            src={art.preview_url || '/placeholder.svg'}
                            alt={art.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          {art.is_featured && (
                            <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-500">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium line-clamp-1">{art.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Campaigns */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Campaigns</CardTitle>
                  <CardDescription>Current fan art contests & licensing briefs</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/brand/${brandSlug}/${user?.id}/contests`}>
                    View All Campaigns
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {activeContests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No active campaigns right now.
                    <Button className="mt-4" variant="outline" asChild>
                      <Link href={`/dashboard/brand/${brandSlug}/${user?.id}/contests/new`}>
                        Create New Campaign
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeContests.map((contest) => (
                      <div
                        key={contest.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{contest.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ends: {new Date(contest.submission_end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{contest.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ── Reusable Stat Card ────────────────────────────────────────
function StatCard({
  icon: Icon,
  title,
  value,
  trend,
}: {
  icon: any;
  title: string;
  value: string | number;
  trend?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}
