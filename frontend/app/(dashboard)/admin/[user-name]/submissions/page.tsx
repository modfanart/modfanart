'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import {
  useGetArtworksQuery,
  usePublishArtworkMutation,
  useDeleteArtworkMutation,
  ArtworkListItem,
} from '@/services/api/artworkApi';

import { useGetUserByIdQuery } from '@/services/api/userApi';

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

import { Loader2, ImageOff, ImageIcon, CheckCircle2, XCircle } from 'lucide-react';

/* =========================
   ✅ SAFE CHILD COMPONENT
========================= */
function CreatorCell({ creatorId }: { creatorId: string }) {
  const { data, isLoading } = useGetUserByIdQuery(creatorId, {
    skip: !creatorId,
  });

  if (isLoading) {
    return <span className="text-sm text-muted-foreground">Loading...</span>;
  }

  const name = data?.username || data?.email?.split('@')[0] || 'Unknown User';

  return <>{name}</>;
}

/* =========================
   MAIN PAGE
========================= */
export default function AdminArtworksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusFilter = searchParams.get('status');
  const page = Number(searchParams.get('page')) || 1;

  /* =========================
     QUERY ARGS
  ========================= */
  const queryArgs = useMemo(() => {
    const args: { page: number; status?: string } = { page };
    if (statusFilter) args.status = statusFilter;
    return args;
  }, [page, statusFilter]);

  const {
    data: artworksData,
    isLoading: artworksLoading,
    isFetching: artworksFetching,
  } = useGetArtworksQuery(queryArgs);

  const [publishArtwork] = usePublishArtworkMutation();
  const [deleteArtwork] = useDeleteArtworkMutation();

  const artworks = artworksData?.artworks ?? [];
  const pagination = artworksData?.pagination;

  const hasPrev = pagination?.has_prev ?? false;
  const hasNext = pagination?.has_next ?? false;
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.total_pages ?? 1;

  /* =========================
     URL HANDLERS
  ========================= */
  const handleStatusChange = useCallback(
    (status?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (status) params.set('status', status);
      else params.delete('status');
      params.delete('page');

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(newPage));

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /* =========================
     ACTIONS
  ========================= */
  const handlePublish = async (id: string) => {
    await publishArtwork(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this artwork permanently?')) return;
    await deleteArtwork(id);
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10">
            <ImageIcon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Artworks</h1>
            <p className="text-muted-foreground">Manage and moderate all artworks</p>
          </div>
        </div>

        {pagination && (
          <div className="text-sm text-muted-foreground font-medium">
            {pagination.total} artworks total
          </div>
        )}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-6 bg-muted/50 p-2 rounded-2xl border">
        <Button
          size="sm"
          variant={!statusFilter ? 'default' : 'outline'}
          onClick={() => handleStatusChange()}
        >
          All
        </Button>

        <Button
          size="sm"
          variant={statusFilter === 'moderation_pending' ? 'default' : 'outline'}
          onClick={() => handleStatusChange('moderation_pending')}
        >
          Pending Review
        </Button>

        <Button
          size="sm"
          variant={statusFilter === 'published' ? 'default' : 'outline'}
          onClick={() => handleStatusChange('published')}
          className="flex items-center gap-1"
        >
          <CheckCircle2 className="h-4 w-4" />
          Published
        </Button>

        <Button
          size="sm"
          variant={statusFilter === 'rejected' ? 'default' : 'outline'}
          onClick={() => handleStatusChange('rejected')}
          className="flex items-center gap-1"
        >
          <XCircle className="h-4 w-4" />
          Rejected
        </Button>
      </div>

      {/* TABLE */}
      {artworksLoading ? (
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Preview</TableHead>
                <TableHead>Artwork</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {artworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-80">
                    <div className="flex flex-col items-center justify-center text-center">
                      <ImageOff className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="font-medium text-lg">No artworks found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try changing the status filter
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                artworks.map((art: ArtworkListItem) => (
                  <TableRow key={art.id} className="hover:bg-muted/50">
                    {/* Preview */}
                    <TableCell>
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted border">
                        {art.thumbnail_url ? (
                          <Image
                            src={art.thumbnail_url}
                            alt={art.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageOff className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Title */}
                    <TableCell className="font-medium max-w-[240px] truncate">
                      {art.title}
                    </TableCell>

                    {/* Creator */}
                    <TableCell>
                      <Link
                        href={`/admin/users/${art.creator_id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        <CreatorCell creatorId={art.creator_id} />
                      </Link>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant={
                          art.status === 'published'
                            ? 'default'
                            : art.status === 'moderation_pending'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {art.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>

                    {/* Stats */}
                    <TableCell className="text-sm text-muted-foreground">
                      👁 {art.views_count} • ❤️ {art.favorites_count}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(art.created_at).toLocaleDateString()}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/artwork/${art.id}`} target="_blank">
                          <Button size="icon" variant="ghost">
                            👁
                          </Button>
                        </Link>

                        {art.status !== 'published' && (
                          <Button size="sm" onClick={() => handlePublish(art.id)}>
                            Publish
                          </Button>
                        )}

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(art.id)}
                          className="text-destructive"
                        >
                          🗑
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between mt-8">
          <Button disabled={!hasPrev} onClick={() => handlePageChange(page - 1)}>
            ← Previous
          </Button>

          <div>
            Page {currentPage} of {totalPages}
          </div>

          <Button disabled={!hasNext} onClick={() => handlePageChange(page + 1)}>
            Next →
          </Button>
        </div>
      )}

      {artworksFetching && !artworksLoading && (
        <div className="flex justify-center mt-6">
          <Loader2 className="animate-spin h-6 w-6 text-primary" />
        </div>
      )}
    </div>
  );
}
