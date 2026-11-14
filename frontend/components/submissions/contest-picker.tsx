'use client';

// ART-04: every "New Submission" / "Create Artwork" CTA used to dead-end on a
// "Missing Contest" alert. Show the contests that are open for entries instead.

import Link from 'next/link';
import { Trophy } from 'lucide-react';

import { useGetContestsQuery } from '@/services/api/contestsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ContestPicker() {
  const { data, isLoading, isError, refetch } = useGetContestsQuery({ status: 'live', limit: 50 });

  const now = Date.now();
  const open = (data?.contests ?? []).filter(
    (c) =>
      String(c.status).toLowerCase() === 'live' &&
      (!c.submission_end_date || new Date(c.submission_end_date).getTime() > now)
  );

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <h1 className="text-2xl font-bold">Choose a contest to enter</h1>
      <p className="mt-2 text-muted-foreground">
        Submissions are made to a specific contest or opportunity. Pick one below.
      </p>

      <div className="mt-8 space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}

        {isError && (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-muted-foreground">Couldn&apos;t load contests.</p>
            <Button variant="outline" className="mt-3" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && open.length === 0 && (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-muted-foreground">There are no contests open for entries right now.</p>
            <Button variant="outline" className="mt-3" asChild>
              <Link href="/explore/contests">Browse all contests</Link>
            </Button>
          </div>
        )}

        {open.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium">{c.title}</p>
                  {c.submission_end_date && (
                    <p className="text-xs text-muted-foreground">
                      Entries close {new Date(c.submission_end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button asChild size="sm">
                <Link href={`/submissions/new?contest=${encodeURIComponent(c.id)}`}>Enter</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
