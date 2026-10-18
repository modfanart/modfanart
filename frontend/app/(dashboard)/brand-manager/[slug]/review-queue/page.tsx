'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, FileText, Trophy, XCircle } from 'lucide-react';

import { ScreeningReasonList } from '@/components/compliance/screening-detail-panel';
import { ScreeningStages } from '@/components/compliance/screening-stages';
import { ScreeningDecisionBadge } from '@/components/compliance/screening-verdict-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { artworkPreviewSrc } from '@/lib/artwork-preview';
import { screeningReasons } from '@/lib/screening-reasons';
import {
  type ModerationDecision,
  type ModerationQueueItem,
  type ModerationQueueQuery,
  useGetModerationQueueQuery,
  useResolveModerationQueueItemMutation,
} from '@/services/api/moderationApi';
import { useAuth } from '@/store/AuthContext';

type QueueTab = NonNullable<ModerationQueueQuery['status']>;

const TABS: Array<{ value: QueueTab; label: string; empty: string }> = [
  { value: 'pending', label: 'Needs review', empty: 'Nothing is waiting for review.' },
  {
    value: 'escalated',
    label: 'Escalated',
    empty: 'Nothing has been escalated to platform moderators.',
  },
  { value: 'reviewed', label: 'Reviewed', empty: 'No decisions yet.' },
];

const DECISION_LABELS: Record<ModerationDecision, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
};

export default function ReviewQueuePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<QueueTab>('pending');

  // The queue is brand-scoped: a brand member must name their brand, and only sees its entries.
  const brand = user?.brands?.find((candidate) => candidate.slug === slug) ?? user?.brands?.[0];

  if (loading) return <ReviewQueueSkeleton />;

  if (!brand) {
    return (
      <Card className="m-6">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          The review queue is available to brand team members.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Review Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submissions to {brand.name}&apos;s contests that AI screening could not clear on its own.
          Your decision is final and the artist is notified.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as QueueTab)}>
        <TabsList>
          {TABS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ value, empty }) => (
          <TabsContent key={value} value={value} className="mt-4">
            {tab === value && <QueueList brandId={brand.id} slug={slug} status={value} empty={empty} />}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function QueueList({
  brandId,
  slug,
  status,
  empty,
}: {
  brandId: string;
  slug: string;
  status: QueueTab;
  empty: string;
}) {
  const { data: items = [], isLoading, isError, refetch } = useGetModerationQueueQuery({
    brand_id: brandId,
    status,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((key) => (
          <Skeleton key={key} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between gap-4 pt-6">
          <p className="text-sm">Unable to load the review queue.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{empty}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <QueueItemCard key={item.id} item={item} slug={slug} actionable={status === 'pending'} />
      ))}
    </div>
  );
}

function QueueItemCard({
  item,
  slug,
  actionable,
}: {
  item: ModerationQueueItem;
  slug: string;
  actionable: boolean;
}) {
  const [notes, setNotes] = useState('');
  const [resolve, { isLoading }] = useResolveModerationQueueItemMutation();
  const { artwork, contest_entry: entry } = item;
  const reasons = screeningReasons(item.rule_matches);
  const image = artwork ? artworkPreviewSrc(artwork) : null;
  const entryHref = entry
    ? `/brand-manager/${slug}/opportunities/${entry.contest_id}/entries/${entry.id}`
    : null;

  const decide = async (decision: ModerationDecision) => {
    try {
      await resolve({
        id: item.id,
        body: { decision, ...(notes.trim() ? { notes: notes.trim() } : {}) },
      }).unwrap();

      toast({
        title:
          decision === 'escalated'
            ? 'Escalated to platform moderators'
            : `Submission ${DECISION_LABELS[decision].toLowerCase()}`,
      });
    } catch (err) {
      const apiError = (err as { data?: { error?: string } } | undefined)?.data?.error;
      toast({
        title: 'Could not save the decision',
        description: apiError || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{artwork?.title ?? 'Untitled submission'}</CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {artwork && <span>@{artwork.creator.username}</span>}
              {entry && (
                <span className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5" />
                  {entry.contest_title}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(item.created_at).toLocaleString()}
              </span>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {item.priority > 0 && <Badge variant="secondary">Priority {item.priority}</Badge>}
            {item.screening_decision ? (
              <ScreeningDecisionBadge decision={item.screening_decision} />
            ) : (
              <Badge variant="outline">User report</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-5 md:grid-cols-[10rem_1fr_16rem]">
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted md:w-40">
            {image ? (
              <Image
                src={image}
                alt={artwork?.title ?? ''}
                fill
                className="object-cover"
                sizes="160px"
              />
            ) : (
              artwork && (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
                  <FileText className="h-8 w-8" />
                  <span className="text-xs">PDF</span>
                </div>
              )
            )}
          </div>

          <div className="min-w-0 space-y-4">
            {reasons.length ? (
              <ScreeningReasonList reasons={reasons} />
            ) : (
              item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>
            )}

            {item.screening_run_id && (
              <ScreeningStages aiornot={item.aiornot} moderation={item.moderation} style={item.style} />
            )}

            <div className="flex flex-wrap gap-2">
              {entryHref && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={entryHref}>View submission</Link>
                </Button>
              )}
              {artwork?.file_url && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={artwork.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Full size
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {actionable ? (
              <>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Note for the record (optional)"
                  rows={3}
                  maxLength={2000}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" disabled={isLoading} onClick={() => decide('approved')}>
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => decide('rejected')}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => decide('escalated')}
                >
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  Escalate to platform moderators
                </Button>
              </>
            ) : (
              <div className="space-y-1 text-sm">
                {item.decision && (
                  <p className="font-medium">{DECISION_LABELS[item.decision]}</p>
                )}
                {item.reviewed_at && (
                  <p className="text-muted-foreground">
                    {new Date(item.reviewed_at).toLocaleString()}
                  </p>
                )}
                {item.notes && reasons.length > 0 && (
                  <p className="text-muted-foreground">“{item.notes}”</p>
                )}
                {item.decision === 'escalated' && (
                  <p className="text-muted-foreground">Waiting on a platform moderator.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewQueueSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-10 w-80" />
      {[1, 2].map((key) => (
        <Skeleton key={key} className="h-40 w-full rounded-lg" />
      ))}
    </div>
  );
}
