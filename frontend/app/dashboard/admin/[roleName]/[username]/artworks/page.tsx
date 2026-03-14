'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import {
  useGetArtworksQuery,
  useGetAllCategoriesQuery,
  usePublishArtworkMutation,
  useDeleteArtworkMutation,
  ArtworkListItem,
  Category,
} from '@/services/api/artworkApi';

import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

import { Loader2, ImageOff } from 'lucide-react';

export default function AdminArtworksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategorySlug = searchParams.get('category') || undefined;
  const statusFilter = searchParams.get('status') || undefined;
  const page = Number(searchParams.get('page')) || 1;

  const {
    data: artworksData,
    isLoading: artworksLoading,
    isFetching: artworksFetching,
  } = useGetArtworksQuery();

  const { data: categories = [], isLoading: categoriesLoading } = useGetAllCategoriesQuery({
    activeOnly: true,
  });

  const [publishArtwork] = usePublishArtworkMutation();
  const [deleteArtwork] = useDeleteArtworkMutation();

  const handleCategoryChange = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (slug) params.set('category', slug);
      else params.delete('category');

      params.delete('page');

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleStatusChange = (status?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (status) params.set('status', status);
    else params.delete('status');

    params.delete('page');

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePublish = async (id: string) => {
    await publishArtwork(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this artwork permanently?')) return;
    await deleteArtwork(id);
  };

  const artworks = artworksData?.artworks ?? [];
  const pagination = artworksData?.pagination;

  const hasNext = pagination?.has_next ?? false;
  const hasPrev = pagination?.has_prev ?? false;

  return (
    <DashboardShell>
      <div className="container mx-auto py-8 px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Artworks Management</h1>

          {pagination && (
            <span className="text-sm text-muted-foreground">{pagination.total} artworks</span>
          )}
        </div>

        <div className="flex gap-8">
          {/* CATEGORY FILTER */}

          {/* MAIN TABLE */}

          <div className="flex-1">
            {/* STATUS FILTER */}

            <div className="flex gap-2 mb-6">
              <Button
                variant={!statusFilter ? 'secondary' : 'ghost'}
                onClick={() => handleStatusChange()}
              >
                All
              </Button>

              <Button
                variant={statusFilter === 'moderation_pending' ? 'secondary' : 'ghost'}
                onClick={() => handleStatusChange('moderation_pending')}
              >
                Pending
              </Button>

              <Button
                variant={statusFilter === 'published' ? 'secondary' : 'ghost'}
                onClick={() => handleStatusChange('published')}
              >
                Published
              </Button>

              <Button
                variant={statusFilter === 'rejected' ? 'secondary' : 'ghost'}
                onClick={() => handleStatusChange('rejected')}
              >
                Rejected
              </Button>
            </div>

            {artworksLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Favorites</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {artworks.map((art: ArtworkListItem) => (
                      <TableRow key={art.id}>
                        <TableCell>
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                            {art.thumbnail_url || art.file_url ? (
                              <Image
                                src={art.thumbnail_url || art.file_url}
                                alt={art.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <ImageOff className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="font-medium max-w-[250px] truncate">
                          {art.title}
                        </TableCell>

                        <TableCell>
                          <Link
                            href={`/admin/users/${art.creator_id}`}
                            className="text-primary hover:underline"
                          >
                            {art.creator_id.slice(0, 8)}
                          </Link>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              art.status === 'published'
                                ? 'default'
                                : art.status === 'moderation_pending'
                                  ? 'secondary'
                                  : art.status === 'rejected'
                                    ? 'destructive'
                                    : 'outline'
                            }
                          >
                            {art.status}
                          </Badge>
                        </TableCell>

                        <TableCell>{art.views_count}</TableCell>

                        <TableCell>{art.favorites_count}</TableCell>

                        <TableCell>{new Date(art.created_at).toLocaleDateString()}</TableCell>

                        <TableCell className="text-right flex gap-2 justify-end">
                          <Link href={`/artwork/${art.id}`}>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>

                          {art.status !== 'published' && (
                            <Button size="sm" onClick={() => handlePublish(art.id)}>
                              Publish
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(art.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* PAGINATION */}

            {(hasNext || hasPrev) && (
              <div className="flex justify-center items-center gap-6 mt-8">
                <Button
                  variant="outline"
                  disabled={!hasPrev || artworksFetching}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>

                <span className="text-sm font-medium">
                  Page {page} {pagination?.total_pages && `of ${pagination.total_pages}`}
                </span>

                <Button
                  variant="outline"
                  disabled={!hasNext || artworksFetching}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}

            {artworksFetching && (
              <div className="flex justify-center mt-6">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
