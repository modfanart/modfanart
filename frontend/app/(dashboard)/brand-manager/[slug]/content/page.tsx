// app/dashboard/brand/[brand-slug]/[brand_manager_id]/posts/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  Pin,
  Trash2,
  Edit,
  LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import {
  useGetBrandPostsQuery,
  useTogglePinBrandPostMutation,
  useDeleteBrandPostMutation,
  BrandPost,
} from '@/services/api/brands';

import { useAuth } from '@/store/AuthContext';

/* =========================================================
   PAGE
========================================================= */

export default function BrandPostsPage() {
  const { user } = useAuth();

  const brandId = user?.brands?.[0]?.id ?? '';
  const brandSlug = user?.brands?.[0]?.slug ?? '';

  const { data: posts = [], isLoading } = useGetBrandPostsQuery(brandId, {
    skip: !brandId,
  });

  const published = posts.filter((p) => p.status === 'published');
  const drafts = posts.filter((p) => p.status === 'draft');

  if (isLoading) {
    return <div className="container py-8">Loading posts...</div>;
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Brand Posts</h1>

        <Button asChild>
          <Link href={`/dashboard/brand/${brandSlug}/${user?.id}/posts/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={FileText} title="Total Posts" value={posts.length} />
        <StatCard icon={CheckCircle} title="Published" value={published.length} />
        <StatCard icon={Clock} title="Drafts" value={drafts.length} />
      </div>

      {/* TABS */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <PostList posts={posts} brandSlug={brandSlug} managerId={user?.id} />
        </TabsContent>

        <TabsContent value="published">
          <PostList posts={published} brandSlug={brandSlug} managerId={user?.id} />
        </TabsContent>

        <TabsContent value="drafts">
          <PostList posts={drafts} brandSlug={brandSlug} managerId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
}

function StatCard({ icon: Icon, title, value }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   POST LIST
========================================================= */

interface PostListProps {
  posts: BrandPost[];
  brandSlug: string;
  managerId: string | undefined;
}

function PostList({ posts, brandSlug, managerId }: PostListProps) {
  const [togglePin] = useTogglePinBrandPostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeleteBrandPostMutation();

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg">
        No posts in this category yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: BrandPost) => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 p-4">
              {/* POST INFO */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium truncate">{post.title || 'Untitled Post'}</h3>

                  {post.is_pinned && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Pinned
                    </Badge>
                  )}

                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {post.content?.replace(/<[^>]*>/g, '') || 'No content preview'}
                </p>

                <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span>Likes: {post.likes_count}</span>
                  <span>Comments: {post.comments_count}</span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/brand/${brandSlug}/${managerId ?? ''}/posts/${post.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    togglePin({
                      brandId: post.brand_id,
                      postId: post.id,
                      pin: !post.is_pinned,
                    })
                  }
                >
                  <Pin className={`h-4 w-4 ${post.is_pinned ? 'fill-current' : ''}`} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  disabled={isDeleting}
                  onClick={() => {
                    if (confirm('Delete this post permanently?')) {
                      deletePost({
                        brandId: post.brand_id,
                        postId: post.id,
                      });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
