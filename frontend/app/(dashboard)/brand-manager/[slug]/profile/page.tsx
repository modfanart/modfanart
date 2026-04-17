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
import { Separator } from '@/components/ui/separator';

import {
  useGetBrandQuery,
  useGetBrandPostsQuery,
  useGetBrandArtworksQuery,
} from '@/services/api/brands';

import { useAuth } from '@/store/AuthContext';

export default function BrandOverviewPage() {
  const { user, loading: authLoading } = useAuth();

  const currentManagerId = user?.id;
  const managedBrand = user?.brands?.[0];

  const brandId = managedBrand?.id;
  const brandSlug = managedBrand?.slug;

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

  if (authLoading || brandLoading || postsLoading || artworksLoading) {
    return <BrandOverviewSkeleton />;
  }

  if (!user || !currentManagerId || !managedBrand || brandError || !brand) {
    return (
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
    );
  }

  const recentPosts = posts.slice(0, 5);
  const recentArtworks = artworks.slice(0, 4);

  return (
    <div className="container py-6 space-y-10">
      {/* HERO */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="relative h-72 w-full">
          {brand.banner_url && (
            <Image
              src={brand.banner_url}
              alt="banner"
              fill
              className="object-cover opacity-70"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <CardContent className="relative -mt-20 p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* LOGO */}
            <div className="h-28 w-28 md:h-36 md:w-36 rounded-2xl border-4 border-background overflow-hidden bg-background shadow-xl">
              {brand.logo_url ? (
                <Image src={brand.logo_url} alt="logo" fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                  {brand.name?.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold">{brand.name}</h1>

                <Badge variant={brand.status === 'active' ? 'default' : 'outline'}>
                  {brand.status}
                </Badge>
              </div>

              <p className="text-muted-foreground max-w-3xl">
                {brand.description || 'No brand description provided yet.'}
              </p>

              <Separator />

              {/* STATS */}
              <div className="flex flex-wrap gap-8">
                <StatDisplay
                  icon={<Users />}
                  value={brand.followers_count ?? 0}
                  label="Followers"
                />
                <StatDisplay icon={<Eye />} value={brand.views_count ?? 0} label="Views" />
                <StatDisplay icon={<FileText />} value={posts.length} label="Posts" />
                <StatDisplay icon={<ImageIcon />} value={artworks.length} label="Artworks" />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <Button variant="secondary" asChild>
                <Link href={`/brand/${brandSlug || brand.id}`} target="_blank">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  View
                </Link>
              </Button>

              <Button asChild>
                <Link href={`/dashboard/brand/${brandSlug}/${currentManagerId}/settings`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
        <QuickActionCard icon={<PlusCircle />} title="New Post" href="#" />
        <QuickActionCard icon={<ImageIcon />} title="Add Artwork" href="#" />
        <QuickActionCard icon={<BarChart3 />} title="Analytics" href="#" disabled />
        <QuickActionCard icon={<Users />} title="Followers" href="#" />
        <QuickActionCard icon={<Heart />} title="Engagement" href="#" disabled />
        <QuickActionCard icon={<MessageSquare />} title="Comments" href="#" disabled />
      </div>

      {/* CONTENT GRID */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* POSTS */}
        <Card>
          <CardHeader className="flex-row justify-between items-center">
            <div>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Latest updates</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {recentPosts.length === 0 ? (
              <EmptyBox text="No posts created yet." />
            ) : (
              recentPosts.map((post: any) => (
                <div key={post.id} className="flex gap-4">
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-muted relative">
                    {post.media_urls?.[0] && (
                      <Image src={post.media_urls[0]} alt="" fill className="object-cover" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{post.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* ARTWORKS */}
        <Card>
          <CardHeader className="flex-row justify-between items-center">
            <div>
              <CardTitle>Storefront Highlights</CardTitle>
              <CardDescription>Featured artworks</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </CardHeader>

          <CardContent>
            {recentArtworks.length === 0 ? (
              <EmptyBox text="No artworks yet." />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {recentArtworks.map((art: any) => (
                  <div key={art.id} className="space-y-2">
                    <div className="aspect-square rounded-md overflow-hidden bg-muted relative">
                      <Image
                        src={art.preview_url || '/placeholder.svg'}
                        alt={art.title}
                        fill
                        className="object-cover"
                      />
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
  );
}

/* ───────── UI HELPERS (NO LOGIC CHANGE) ───────── */

function StatDisplay({ icon, value, label }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="text-xl font-bold">{value.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, href, disabled }: any) {
  const content = (
    <Card className={`hover:shadow-sm transition ${disabled ? 'opacity-50' : ''}`}>
      <CardContent className="p-5 text-center space-y-2">
        <div className="mx-auto text-primary">{icon}</div>
        <p className="text-sm font-medium">{title}</p>
      </CardContent>
    </Card>
  );

  return disabled ? content : <Link href={href}>{content}</Link>;
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/20">
      {text}
    </div>
  );
}

/* ───────── SKELETON (UI ONLY IMPROVED) ───────── */

function BrandOverviewSkeleton() {
  return (
    <div className="container py-6 space-y-10">
      <div className="h-72 bg-muted rounded-2xl animate-pulse" />

      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}
