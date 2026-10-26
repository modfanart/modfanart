'use client';

import { Star } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetRatingSummaryQuery,
  useGetReviewsQuery,
  type ReviewTarget,
} from '@/services/api/marketplaceApi';
import { formatDate } from '@/lib/marketplace/format';
import { cn } from '@/lib/utils';

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'h-4 w-4',
            n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
          )}
        />
      ))}
    </span>
  );
}

export function ProductReviews({
  targetType,
  targetId,
}: {
  targetType: ReviewTarget;
  targetId: string;
}) {
  const { data: reviews, isLoading } = useGetReviewsQuery({ targetType, targetId });
  const { data: summary } = useGetRatingSummaryQuery({ targetType, targetId });

  const count = summary?.review_count ?? reviews?.length ?? 0;
  const average = summary?.average_rating;

  // 5 → 1 star distribution from the loaded reviews.
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews?.filter((r) => r.rating === stars).length ?? 0,
  }));

  return (
    <section aria-labelledby="reviews-heading" className="space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div>
          <h2 id="reviews-heading" className="text-xl font-semibold">
            Customer reviews
          </h2>
          {count > 0 && average != null ? (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-4xl font-bold">{average.toFixed(1)}</span>
              <div>
                <Stars value={average} />
                <p className="text-sm text-muted-foreground">
                  {count} review{count === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No reviews yet.</p>
          )}
        </div>

        {count > 0 && (
          <div className="w-full max-w-xs space-y-1.5">
            {distribution.map(({ stars, count: c }) => (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-right">{stars}</span>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${count ? (c / count) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-muted-foreground">{c}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <ul className="divide-y">
          {reviews?.map((review) => (
            <li key={review.id} className="flex gap-4 py-5">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.reviewer_avatar_url ?? undefined} />
                <AvatarFallback>
                  {(review.reviewer_username || 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium">{review.reviewer_username || 'Verified buyer'}</span>
                  <Stars value={review.rating} />
                  <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                </div>
                {review.body && <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Only customers with a completed order can leave a review — find it in{' '}
        <a href="/marketplace/orders" className="underline">
          your orders
        </a>
        .
      </p>
    </section>
  );
}
