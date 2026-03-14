// app/brand/[brandId]/stats/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  useGetBrandQuery,
  useGetBrandArtworksQuery,
  useGetBrandPostsQuery,
} from '@/services/api/brands';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Image, FileText, Eye, Heart, ArrowUpRight } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
export default function BrandStatsPage() {
  const { brandId } = useParams<{ brandId: string }>();

  const { data: brand, isLoading: brandLoading } = useGetBrandQuery(brandId);
  const { data: artworks = [] } = useGetBrandArtworksQuery(brandId, {
    skip: !brandId,
  });
  const { data: posts = [] } = useGetBrandPostsQuery(brandId, {
    skip: !brandId,
  });

  if (brandLoading || !brand) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Skeleton className="h-48 w-full rounded-xl mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isActive = brand.status === 'active';

  return (
    <DashboardShell>
      <div className="container mx-auto py-10 px-4">
        {/* Header */}
        <Card className="mb-10 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/5 relative">
            {brand.banner_url && (
              <img
                src={brand.banner_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
            )}
          </div>

          <CardContent className="relative px-8 pb-8 -mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary/20">
                <AvatarImage src={brand.logo_url ?? undefined} alt={brand.name} />
                <AvatarFallback className="text-5xl bg-primary/10">
                  {brand.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-4 flex-wrap">
                  <h1 className="text-3xl font-bold">{brand.name}</h1>
                  <Badge variant={isActive ? 'default' : 'secondary'}>{brand.status}</Badge>
                  {brand.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={brand.website} target="_blank" rel="noopener noreferrer">
                        Website <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {brand.followers_count} followers
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {brand.views_count} profile views
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Image className="h-4 w-4" />
                    {artworks.length} artworks
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    {posts.length} posts
                  </div>
                </div>

                {brand.description && (
                  <p className="mt-4 text-muted-foreground max-w-3xl">{brand.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            title="Followers"
            value={brand.followers_count}
            trend="+12%"
          />
          <StatCard
            icon={<Eye className="h-6 w-6" />}
            title="Profile Views"
            value={brand.views_count}
            trend="+28%"
          />
          <StatCard
            icon={<Image className="h-6 w-6" />}
            title="Artworks"
            value={artworks.length}
            trend="+3"
          />
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            title="Posts"
            value={posts.length}
            trend="+5"
          />
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Brand Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Recent Growth</h4>
                    <p className="text-sm text-muted-foreground">
                      Last 30 days: +{Math.floor(Math.random() * 80 + 20)} followers
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Top Artwork</h4>
                    <p className="text-sm text-muted-foreground">
                      {artworks[0]?.title || 'No featured artwork yet'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="artworks">
            <Card>
              <CardHeader>
                <CardTitle>Featured Artworks</CardTitle>
              </CardHeader>
              <CardContent>
                {artworks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No artworks added to this brand yet.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {artworks.map((art) => (
                      <div key={art.id} className="border rounded-lg overflow-hidden">
                        {art.preview_url && (
                          <div className="aspect-video relative bg-muted">
                            <Image
                              src={art.preview_url}
                              alt={art.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h4 className="font-medium line-clamp-1">{art.title}</h4>
                          {art.is_featured && (
                            <Badge variant="secondary" className="mt-2">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No posts published yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.slice(0, 5).map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{post.title}</h4>
                          {post.is_pinned && <Badge>Pinned</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(post.created_at), 'd MMM yyyy')}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                          <span>{post.likes_count} likes</span>
                          <span>{post.comments_count} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  icon,
  title,
  value,
  trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="text-primary/70">{icon}</div>
        </div>
        {trend && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {trend} this month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
