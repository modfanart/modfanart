'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import {
  ModerationQueueItem,
  useGetModerationQueueQuery,
  useResolveModerationQueueItemMutation,
} from '@/services/api/moderationApi';

export default function ReviewQueuePage() {
  const {
    data: queue = [],
    isLoading,
    isError,
    refetch,
  } = useGetModerationQueueQuery();

  const [resolveQueueItem, { isLoading: isResolving }] =
    useResolveModerationQueueItemMutation();

  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const pendingItems = queue.filter(
    (item) => item.status === 'pending'
  );

  const handleDecision = async (
    item: ModerationQueueItem,
    decision: 'approved' | 'rejected' | 'needs_review'
  ) => {
    try {
      setResolvingId(item.id);

      await resolveQueueItem({
        id: item.id,
        body: {
          decision,
        },
      }).unwrap();
    } catch (error) {
      console.error('Failed to resolve moderation item:', error);
    } finally {
      setResolvingId(null);
    }
  };

  if (isLoading) {
    return <ReviewQueueSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Review Queue
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Review artwork that requires a human decision after automated
          screening.
        </p>
      </div>

      {isError && (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div>
              <p className="font-medium">
                Unable to load the review queue.
              </p>

              <p className="text-sm text-muted-foreground">
                Try loading the queue again.
              </p>
            </div>

            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!isError && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Needs Review</CardTitle>

                <CardDescription>
                  Submissions waiting for human review.
                </CardDescription>
              </div>

              <Badge variant="secondary">
                {pendingItems.length}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {pendingItems.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                <p className="font-medium">
                  Review queue is clear
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  There are currently no submissions waiting for review.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <ReviewQueueItem
                    key={item.id}
                    item={item}
                    isResolving={
                      isResolving && resolvingId === item.id
                    }
                    onDecision={handleDecision}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ReviewQueueItemProps {
  item: ModerationQueueItem;
  isResolving: boolean;
  onDecision: (
    item: ModerationQueueItem,
    decision: 'approved' | 'rejected' | 'needs_review'
  ) => Promise<void>;
}

function ReviewQueueItem({
  item,
  isResolving,
  onDecision,
}: ReviewQueueItemProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {formatValue(item.entity_type)}
            </Badge>

            <Badge variant="secondary">
              Priority {item.priority}
            </Badge>
          </div>

          <div>
            <p className="font-medium">
              {item.entity_id}
            </p>

            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />

              {formatDate(item.created_at)}
            </div>
          </div>

          {item.notes && (
            <p className="text-sm text-muted-foreground">
              {item.notes}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isResolving}
            onClick={() =>
              onDecision(item, 'needs_review')
            }
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Escalate
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isResolving}
            onClick={() =>
              onDecision(item, 'rejected')
            }
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>

          <Button
            size="sm"
            disabled={isResolving}
            onClick={() =>
              onDecision(item, 'approved')
            }
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewQueueSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>

        <CardContent className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Skeleton
              key={item}
              className="h-28 w-full rounded-lg"
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function formatValue(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}