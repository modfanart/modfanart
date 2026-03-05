// app/dashboard/brand/[brand-slug]/[brand_manager_id]/overview/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Eye,
  Heart,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  ArrowUpRight,
  Settings,
  PlusCircle,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardShell } from '@/components/dashboard-shell';

import {
  useGetBrandQuery,
  useGetBrandPostsQuery,
  useGetBrandArtworksQuery,
} from '@/services/api/brands';

import { useAuth } from '@/store/AuthContext';
export default function BrandOverviewPage() {
  const { user, loading: authLoading } = useAuth();

  // 1. Get current brand manager's user ID
  const currentManagerId = user?.id;

  // 2. Get the brand being managed (assuming primary = first one)
  const managedBrand = user?.brands?.[0];

  // 3. Use the real UUID (id) — this is what your backend expects
  const brandId = managedBrand?.id; // e.g. "3298a76e-b531-4b5c-9574-6cbb8c91b5ad"
  const brandSlug = managedBrand?.slug; // e.g. "my-test-brand" (for links only)

  // Fetch full brand details using the UUID (matches /api/brands/:id endpoint)
  const {
    data: brand,
    isLoading: brandLoading,
    isError: brandError,
    error: brandErrorDetail,
  } = useGetBrandQuery(brandId ?? '', {
    skip: !brandId || authLoading,
  });

  const { data: posts = [], isLoading: postsLoading } = useGetBrandPostsQuery(brandId ?? '', {
    skip: !brandId || !brand || authLoading,
  });

  const { data: artworks = [], isLoading: artworksLoading } = useGetBrandArtworksQuery(
    brandId ?? '',
    {
      skip: !brandId || !brand || authLoading,
    }
  );

  // ────────────────────────────────────────────────
  // Loading / Error states
  // ────────────────────────────────────────────────
  if (authLoading || brandLoading || postsLoading || artworksLoading) {
    return <BrandOverviewSkeleton />;
  }

  if (!user || !currentManagerId || !managedBrand || brandError || !brand) {
    return (
      <DashboardShell>
        <div className="container py-16 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-2xl font-semibold">
            {brandError ? 'Failed to load brand' : 'No brand found'}
          </h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            {brandError
              ? (brandErrorDetail as any)?.data?.error || 'Could not load brand data.'
              : 'You are not currently managing any brand or lack permission.'}
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/dashboard/brand">Back to My Brands</Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const recentPosts = posts.slice(0, 5);
  const recentArtworks = artworks.slice(0, 4);

  return (
    <DashboardShell>
      <div className="container py-6 space-y-10">
        {/* Hero / Brand Header */}
        <div className="relative rounded-2xl overflow-hidden border shadow-sm bg-gradient-to-br from-slate-900 to-slate-800">
          {brand.banner_url && (
            <Image
              src={brand.banner_url}
              alt={`${brand.name} banner`}
              fill
              className="object-cover opacity-70"
              priority
            />
          )}

          <div className="relative px-6 py-12 md:px-10 md:py-16 lg:py-20">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* Logo */}
              <div className="shrink-0">
                <div className="h-28 w-28 md:h-36 md:w-36 rounded-2xl border-4 border-background overflow-hidden bg-background shadow-2xl">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={`${brand.name} logo`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted/80 flex items-center justify-center text-5xl font-bold text-muted-foreground/70">
                      {brand.name?.slice(0, 2).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              </div>

              {/* Brand Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {brand.name}
                  </h1>

                  {brand.status === 'active' ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-base px-4 py-1">
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-600 text-base px-4 py-1"
                    >
                      {brand.status}
                    </Badge>
                  )}
                </div>

                <p className="mt-3 text-xl text-white/85 max-w-3xl">
                  {brand.description || 'No brand description provided yet.'}
                </p>

                <div className="mt-8 flex flex-wrap gap-8 text-white/90">
                  <StatDisplay
                    icon={<Users className="h-7 w-7" />}
                    value={brand.followers_count ?? 0}
                    label="Followers"
                  />
                  <StatDisplay
                    icon={<Eye className="h-7 w-7" />}
                    value={brand.views_count ?? 0}
                    label="Total Views"
                  />
                  <StatDisplay
                    icon={<FileText className="h-7 w-7" />}
                    value={posts.length}
                    label="Posts"
                  />
                  <StatDisplay
                    icon={<ImageIcon className="h-7 w-7" />}
                    value={artworks.length}
                    label="Artworks"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 self-end md:self-center">
                <Button variant="secondary" size="lg" asChild>
                  <Link href={`/brand/${brandSlug || brand.id}`} target="_blank">
                    <ArrowUpRight className="mr-2 h-5 w-5" />
                    View Public Profile
                  </Link>
                </Button>
                <Button size="lg" asChild>
                  <Link href={`/dashboard/brand/${brandSlug}/${currentManagerId}/settings`}>
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          <QuickActionCard
            icon={<PlusCircle className="h-6 w-6" />}
            title="New Post"
            href={`/dashboard/brand/${brandSlug}/${currentManagerId}/posts/new`}
          />
          <QuickActionCard
            icon={<ImageIcon className="h-6 w-6" />}
            title="Add Artwork"
            href={`/dashboard/brand/${brandSlug}/${currentManagerId}/artworks/new`}
          />
          <QuickActionCard
            icon={<BarChart3 className="h-6 w-6" />}
            title="Analytics"
            href={`/dashboard/brand/${brandSlug}/${currentManagerId}/analytics`}
            disabled
          />
          <QuickActionCard
            icon={<Users className="h-6 w-6" />}
            title="Followers"
            href={`/dashboard/brand/${brandSlug}/${currentManagerId}/followers`}
          />
          <QuickActionCard
            icon={<Heart className="h-6 w-6" />}
            title="Engagement"
            href={`/dashboard/brand/${brandSlug}/${currentManagerId}/engagement`}
            disabled
          />
          <QuickActionCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="Comments"
            href={`/dashboard/brand/${brandSlug}/${currentManagerId}/comments`}
            disabled
          />
        </div>

        {/* Recent Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Posts */}
          <Card className="border shadow-sm">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Recent Posts</CardTitle>
                <CardDescription>Latest updates and brand activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/brand/${brandSlug}/${currentManagerId}/posts`}>
                  View All Posts
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentPosts.length === 0 ? (
                <div className="text-center py-14 text-muted-foreground border border-dashed rounded-lg">
                  No posts created yet. Start sharing updates!
                </div>
              ) : (
                <div className="space-y-6">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex gap-5">
                      <div className="shrink-0">
                        {post.media_urls?.[0] ? (
                          <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted relative">
                            <Image src={post.media_urls[0]} alt="" fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="h-10 w-10 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold line-clamp-1 text-lg">
                          {post.title || 'Untitled Post'}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5">
                          {post.content || 'No preview available'}
                        </p>
                        <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5">
                            <Heart className="h-3.5 w-3.5" /> {post.likes_count ?? 0}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5" /> {post.comments_count ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Storefront Highlights */}
          <Card className="border shadow-sm">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Storefront Highlights</CardTitle>
                <CardDescription>Featured artworks available for licensing</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/brand/${brandSlug}/${currentManagerId}/artworks`}>
                  Manage Artworks
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentArtworks.length === 0 ? (
                <div className="text-center py-14 text-muted-foreground border border-dashed rounded-lg">
                  No artworks in storefront yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {recentArtworks.map((art) => (
                    <div key={art.id} className="space-y-2.5">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted relative group shadow-sm">
                        <Image
                          src={art.preview_url || '/placeholder.svg'}
                          alt={art.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                        {art.is_featured && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-amber-500 hover:bg-amber-500 text-black text-xs px-2.5 py-0.5">
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-1">{art.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

// ────────────────────────────────────────────────
// Reusable Components (unchanged)
// ────────────────────────────────────────────────

function StatDisplay({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-white/80">{icon}</div>
      <div>
        <div className="text-3xl font-bold">{value.toLocaleString()}</div>
        <div className="text-sm text-white/70">{label}</div>
      </div>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  href,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  disabled?: boolean;
}) {
  const content = (
    <Card
      className={`
        hover:border-primary/40 transition-all duration-200
        ${disabled ? 'opacity-55 pointer-events-none' : 'hover:shadow-md'}
      `}
    >
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <p className="font-medium text-gray-800">{title}</p>
      </CardContent>
    </Card>
  );

  if (disabled) return content;
  return <Link href={href}>{content}</Link>;
}

function BrandOverviewSkeleton() {
  return (
    <DashboardShell>
      <div className="container py-6 space-y-10">
        <div className="h-80 bg-muted animate-pulse rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 text-center space-y-4">
                  <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
                  <Skeleton className="h-5 w-28 mx-auto" />
                </CardContent>
              </Card>
            ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-5">
                    <Skeleton className="h-20 w-20 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-4/5" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-80 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square rounded-lg" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
