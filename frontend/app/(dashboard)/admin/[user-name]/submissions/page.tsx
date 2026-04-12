'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
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

import { Loader2, ImageOff, ImageIcon, Filter, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminArtworksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategorySlug = searchParams.get('category');
  const statusFilter = searchParams.get('status');
  const page = Number(searchParams.get('page')) || 1;

  // ✅ SAFE QUERY OBJECT (fixes exactOptionalPropertyTypes issue)
  const queryArgs = useMemo(() => {
    const args: {
      page: number;
      category?: string;
      status?: string;
    } = { page };

    if (selectedCategorySlug) args.category = selectedCategorySlug;
    if (statusFilter) args.status = statusFilter;

    return args;
  }, [page, selectedCategorySlug, statusFilter]);

  const {
    data: artworksData,
    isLoading: artworksLoading,
    isFetching: artworksFetching,
  } = useGetArtworksQuery(queryArgs);

  const { data: categories = [], isLoading: categoriesLoading } = useGetAllCategoriesQuery({
    activeOnly: true,
  });

  const [publishArtwork] = usePublishArtworkMutation();
  const [deleteArtwork] = useDeleteArtworkMutation();

  // ---------------- URL HANDLERS ----------------

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

  // ---------------- ACTIONS ----------------

  const handlePublish = async (id: string) => {
    await publishArtwork(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this artwork permanently?')) return;
    await deleteArtwork(id);
  };

  // ---------------- DATA ----------------

  const artworks = artworksData?.artworks ?? [];
  const pagination = artworksData?.pagination;

  const hasNext = pagination?.has_next ?? false;
  const hasPrev = pagination?.has_prev ?? false;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Artworks</h1>
            <p className="text-sm text-muted-foreground">Moderate, publish and manage artworks</p>
          </div>
        </div>

        {pagination && (
          <div className="text-sm text-muted-foreground">{pagination.total} artworks</div>
        )}
      </div>

      <div className="flex gap-6">
        {/* SIDEBAR */}
        <div className="w-64 shrink-0">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Filter className="h-4 w-4" />
            Categories
          </div>

          {categoriesLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (
            <div className="flex flex-col gap-1 bg-muted/40 p-2 rounded-xl border">
              <Button
                variant={!selectedCategorySlug ? 'secondary' : 'ghost'}
                className="justify-start"
                onClick={() => handleCategoryChange(null)}
              >
                All
              </Button>

              {categories.map((cat: Category) => (
                <Button
                  key={cat.id}
                  variant={selectedCategorySlug === cat.slug ? 'secondary' : 'ghost'}
                  className="justify-start"
                  onClick={() => handleCategoryChange(cat.slug)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* MAIN */}
        <div className="flex-1">
          {/* STATUS FILTER */}
          <div className="flex gap-2 mb-6 flex-wrap bg-muted/40 p-2 rounded-xl border">
            <Button
              size="sm"
              variant={!statusFilter ? 'secondary' : 'ghost'}
              onClick={() => handleStatusChange()}
            >
              All
            </Button>

            <Button
              size="sm"
              variant={statusFilter === 'moderation_pending' ? 'secondary' : 'ghost'}
              onClick={() => handleStatusChange('moderation_pending')}
            >
              Pending
            </Button>

            <Button
              size="sm"
              variant={statusFilter === 'published' ? 'secondary' : 'ghost'}
              onClick={() => handleStatusChange('published')}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Published
            </Button>

            <Button
              size="sm"
              variant={statusFilter === 'rejected' ? 'secondary' : 'ghost'}
              onClick={() => handleStatusChange('rejected')}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Rejected
            </Button>
          </div>

          {/* TABLE */}
          {artworksLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : (
            <div className="rounded-2xl border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Artwork</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {artworks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="flex flex-col items-center py-16 text-center">
                          <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
                          <p className="font-medium">No artworks found</p>
                          <p className="text-xs text-muted-foreground">Try adjusting filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    artworks.map((art: ArtworkListItem) => (
                      <TableRow key={art.id} className="hover:bg-muted/40">
                        {/* PREVIEW */}
                        <TableCell>
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted ring-1 ring-border">
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

                        {/* TITLE */}
                        <TableCell className="max-w-[250px]">
                          <div className="font-medium truncate">{art.title}</div>
                        </TableCell>

                        {/* CREATOR */}
                        <TableCell>
                          <Link
                            href={`/admin/users/${art.creator_id}`}
                            className="text-primary hover:underline text-sm"
                          >
                            {art.creator_id.slice(0, 8)}
                          </Link>
                        </TableCell>

                        {/* STATUS (FIXED BUG) */}
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

                        {/* STATS */}
                        <TableCell className="text-sm text-muted-foreground">
                          👁 {art.views_count} • ❤️ {art.favorites_count}
                        </TableCell>

                        {/* DATE */}
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(art.created_at).toLocaleDateString()}
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/artwork/${art.id}`}>
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
          {(hasNext || hasPrev) && (
            <div className="flex justify-center items-center gap-6 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev || artworksFetching}
                onClick={() => handlePageChange(page - 1)}
              >
                ← Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {page}
                {pagination?.total_pages && ` of ${pagination.total_pages}`}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext || artworksFetching}
                onClick={() => handlePageChange(page + 1)}
              >
                Next →
              </Button>
            </div>
          )}

          {/* LOADING */}
          {artworksFetching && (
            <div className="flex justify-center mt-6">
              <Loader2 className="animate-spin h-6 w-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
