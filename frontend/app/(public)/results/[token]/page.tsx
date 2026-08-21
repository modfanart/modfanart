'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Trophy } from 'lucide-react';

import { API_BASE_URL } from '@/services';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PublicWinner {
  entry_id: string;
  rank: number;
  artwork_title: string | null;
  artwork_thumbnail: string | null;
  artwork_file_url: string | null;
  creator_username: string | null;
}

interface PublicResults {
  contest: { title: string; hero_image: string | null };
  winners: PublicWinner[];
}

/**
 * The public face of the results share link. Anyone holding the token-keyed
 * URL can view it - no account, no login. Fetched with plain fetch, not the
 * RTK api: that client attaches the viewer's auth token, and this page must
 * behave identically for a viewer who has none.
 */
export default function PublicResultsPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [results, setResults] = useState<PublicResults | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetch(`${API_BASE_URL}/public/contest-results/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) return setState('missing');
        if (!res.ok) return setState('error');
        const body = (await res.json()) as PublicResults;
        if (cancelled) return;
        setResults(body);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === 'loading') {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (state === 'missing') {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Alert>
          <AlertDescription>
            These results don&apos;t exist or the link is no longer valid. Please check the
            link with whoever shared it with you.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (state === 'error' || !results) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertDescription>Could not load the results. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { contest, winners } = results;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="h-7 w-7" />
          Contest results
        </h1>
        <p className="text-muted-foreground mt-1">{contest.title}</p>
      </div>

      {winners.length === 0 ? (
        <Alert>
          <AlertDescription>
            The winners for this contest haven&apos;t been selected yet. Check back soon.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {winners.map((winner) => (
            <Card key={winner.entry_id}>
              <CardContent className="p-4 flex gap-4 items-center">
                <div className="text-2xl font-bold tabular-nums w-12 shrink-0 text-center text-muted-foreground">
                  {winner.rank}
                </div>

                <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0">
                  {(winner.artwork_thumbnail || winner.artwork_file_url) && (
                    <Image
                      src={winner.artwork_thumbnail || winner.artwork_file_url || ''}
                      alt={winner.artwork_title || 'Winning entry'}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">
                    {winner.artwork_title || 'Untitled'}
                  </div>
                  {winner.creator_username && (
                    <div className="text-sm text-muted-foreground truncate">
                      @{winner.creator_username}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
