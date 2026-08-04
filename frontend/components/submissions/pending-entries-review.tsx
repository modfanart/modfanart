'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import {
  useGetContestsQuery,
  useGetContestEntriesQuery,
  useUpdateEntryStatusMutation,
} from '@/services/api/contestsApi';
import { toast } from '@/components/ui/use-toast';
import { contestsWithBrandSlug, entryDetailPath } from '@/lib/submissions/entry-detail-link';
import {
  buildEntriesQueryArgs,
  foldEntriesPage,
  PAGE_SIZE,
  type ExtendedContestEntry,
} from '@/components/opportunities/submission-pagination';

function ContestPendingEntries({
  contestId,
  contestTitle,
  brandSlug,
}: {
  contestId: string;
  contestTitle: string;
  brandSlug: string;
}) {
  // Paged in from the server and accumulated client-side, same as the brand
  // Monitor list. Without this the card took the endpoint's default page of 20
  // and had no way to reach the rest of a contest's pending entries.
  const [offset, setOffset] = useState(0);
  const [entries, setEntries] = useState<ExtendedContestEntry[]>([]);
  // Held in state so the count stays stable while the next page is fetching
  // (the query's `data` briefly goes undefined when `offset` changes).
  const [totalEntries, setTotalEntries] = useState(0);

  const entriesQueryArgs = useMemo(
    () => buildEntriesQueryArgs({ contestId, offset, statusFilter: 'pending', search: '' }),
    [contestId, offset]
  );

  const { data, isLoading, isFetching } = useGetContestEntriesQuery(entriesQueryArgs);
  const [updateEntryStatus, { isLoading: isUpdating }] = useUpdateEntryStatusMutation();

  useEffect(() => {
    if (typeof data?.total === 'number') setTotalEntries(data.total);
  }, [data]);

  // Fold each fetched page into the accumulated list. Dedupe by id so a
  // StrictMode double-invoke or a post-mutation refetch cannot double-append,
  // and let page 0 replace the list (refreshed data after approve/reject).
  useEffect(() => {
    const page = data?.entries;
    if (!page) return;
    setEntries((prev) => foldEntriesPage(prev, page, offset));
  }, [data, offset]);

  const canLoadMore = entries.length < totalEntries;
  const loadMore = useCallback(() => {
    setOffset((prev) => prev + PAGE_SIZE);
  }, []);

  const handleDecision = async (entryId: string, status: 'approved' | 'rejected') => {
    try {
      await updateEntryStatus({ contestId, entryId, status }).unwrap();
      // Drop it locally as well as invalidating: the entry is no longer
      // pending, and on a later page the refetch only replaces that page, so
      // without this a decided entry would linger in the accumulated list.
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setTotalEntries((prev) => Math.max(0, prev - 1));
      toast({ title: status === 'approved' ? 'Entry approved' : 'Entry rejected' });
    } catch (err: any) {
      toast({
        title: 'Action failed',
        description: err?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Only spin on the very first page. Changing `offset` gives RTK Query a new
  // cache key, so isLoading goes true again on every "Load more" - gating the
  // whole grid on it would blank the loaded entries mid-scroll.
  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{contestTitle}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="overflow-hidden">
            {/* The link covers the thumbnail and title only. Wrapping the whole
                card would nest the Approve/Reject buttons inside an anchor, so
                deciding on an entry would navigate away instead. */}
            <Link
              href={entryDetailPath(brandSlug, contestId, entry.id)}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`View full details for ${entry.artwork.title}`}
            >
              <div className="aspect-square relative bg-gray-50">
                <Image
                  src={entry.artwork.thumbnail_url || entry.artwork.file_url || '/placeholder.svg'}
                  alt={entry.artwork.title}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
            </Link>
            <CardContent className="p-4 space-y-3">
              <div>
                <Link
                  href={entryDetailPath(brandSlug, contestId, entry.id)}
                  className="font-medium line-clamp-1 hover:underline"
                >
                  {entry.artwork.title}
                </Link>
                <p className="text-xs text-muted-foreground">By {entry.creator.username}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isUpdating}
                  onClick={() => handleDecision(entry.id, 'approved')}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={isUpdating}
                  onClick={() => handleDecision(entry.id, 'rejected')}
                >
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {canLoadMore && (
        <div className="flex flex-col items-center gap-2 pt-1">
          <p className="text-xs text-muted-foreground">
            Showing {entries.length} of {totalEntries}
          </p>
          <Button variant="outline" size="sm" disabled={isFetching} onClick={loadMore}>
            {isFetching ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

export function PendingEntriesReview() {
  const { user } = useAuth();
  const brands = user?.brands || [];
  const brandIds = brands.map((b) => b.id);

  const { data: contestsData, isLoading: contestsLoading } = useGetContestsQuery(undefined, {
    skip: brandIds.length === 0,
  });

  // Only contests this manager owns, each paired with the brand slug its detail
  // link should sit under.
  const myContests = contestsWithBrandSlug(contestsData?.contests, brands);

  if (!user || brandIds.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Submissions to Review</CardTitle>
        <CardDescription>Entries awaiting approval for contests you own.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {contestsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : myContests.length === 0 ? (
          <p className="text-sm text-muted-foreground">You don't own any contests yet.</p>
        ) : (
          myContests.map(({ contest, brandSlug }) => (
            <ContestPendingEntries
              key={contest.id}
              contestId={contest.id}
              contestTitle={contest.title}
              brandSlug={brandSlug}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
