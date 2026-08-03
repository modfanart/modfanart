'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Check, Clock, ExternalLink, Loader2, Mail, Tag, Trophy, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { unpackSubmissionNotes } from '@/lib/contest-notes';
import {
  useGetContestEntryQuery,
  useUpdateEntryStatusMutation,
  type ContestEntry,
} from '@/services/api/contestsApi';

const STATUS_STYLES: Record<ContestEntry['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  disqualified: 'bg-gray-100 text-gray-800',
  winner: 'bg-blue-100 text-blue-800',
};

const formatDateTime = (value: string) => new Date(value).toLocaleString();

/** One labelled metadata row. Renders nothing when there is no value, so the
 *  panel never shows an empty field. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  if (children === null || children === undefined || children === '') return null;

  return (
    <div>
      <h4 className="text-sm font-medium">{label}</h4>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

interface Props {
  slug: string;
  contestId: string;
  entryId: string;
}

export default function SubmissionDetail({ slug, contestId, entryId }: Props) {
  const { data, isLoading, isError, error } = useGetContestEntryQuery({ contestId, entryId });
  const [updateEntryStatus, { isLoading: isUpdating }] = useUpdateEntryStatusMutation();

  const backHref = `/brand-manager/${slug}`;
  const entry = data?.entry;

  const handleDecision = async (status: 'approved' | 'rejected') => {
    try {
      await updateEntryStatus({ contestId, entryId, status }).unwrap();
      toast({ title: status === 'approved' ? 'Entry approved' : 'Entry rejected' });
    } catch (err) {
      // RTK Query rejects with FetchBaseQueryError | SerializedError; only the
      // former carries the API's message, so narrow rather than casting away.
      const apiError = (err as { data?: { error?: string } } | undefined)?.data?.error;

      toast({
        title: 'Action failed',
        description: apiError || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !entry) {
    // 403 and 404 are both expected here (another brand's entry, or a deleted
    // one), so the message distinguishes them rather than showing "not found"
    // for a permissions problem.
    // SerializedError has no status field, so narrow instead of casting.
    const status = error && 'status' in error ? error.status : undefined;
    const message =
      status === 403
        ? 'You do not have access to this submission.'
        : status === 404
          ? 'This submission no longer exists.'
          : 'Could not load this submission. Please try again.';

    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center space-y-4">
        <p className="text-muted-foreground">{message}</p>
        <Button variant="outline" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const { note, originalIp } = unpackSubmissionNotes(entry.submission_notes);
  const { artwork, creator } = entry;

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
        <Badge className={STATUS_STYLES[entry.status]}>{entry.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{artwork.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* object-contain, not object-cover: the point of this view is to
                  show the whole artwork rather than the cropped thumbnail the
                  dashboard grid shows. */}
              <div className="relative w-full aspect-[4/3] bg-muted rounded-md overflow-hidden">
                <Image
                  src={artwork.file_url || artwork.thumbnail_url || '/placeholder.svg'}
                  alt={artwork.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </div>

              {artwork.file_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={artwork.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Open full size
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Artwork description">
                {artwork.description || (
                  <span className="italic">No description provided</span>
                )}
              </Field>

              <Separator />

              <Field label="Note to the brand">
                {note || <span className="italic">No note provided</span>}
              </Field>

              <Field label="Fandom / Original IP">
                {originalIp || <span className="italic">Not provided</span>}
              </Field>

              <Field label="Category">
                {artwork.categories?.length ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {artwork.categories.map((category) => (
                      <Badge key={category.id} variant="secondary">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="italic">Not provided</span>
                )}
              </Field>

              <Field label="Tags">
                {artwork.tags?.length ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {artwork.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="flex items-center">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="italic">No tags added</span>
                )}
              </Field>
            </CardContent>
          </Card>

          {(entry.judge_score !== null || entry.judge_comments) && (
            <Card>
              <CardHeader>
                <CardTitle>Judging</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Score">{entry.judge_score}</Field>
                <Field label="Judge comments">{entry.judge_comments}</Field>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted shrink-0">
                  {creator.avatar_url && (
                    <Image src={creator.avatar_url} alt="" fill className="object-cover" />
                  )}
                </div>
                <p className="font-medium">{creator.username}</p>
              </div>

              {creator.email && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 break-all">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {creator.email}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Contest">
                <span className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5" />
                  {entry.contest.title}
                </span>
              </Field>

              <Field label="Submitted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateTime(entry.created_at)}
                </span>
              </Field>

              <Field label="Last updated">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDateTime(entry.updated_at)}
                </span>
              </Field>

              {entry.rank !== null && (
                <Field label="Rank">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    {entry.rank}
                  </span>
                </Field>
              )}
            </CardContent>
          </Card>

          {entry.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Review</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isUpdating}
                  onClick={() => handleDecision('approved')}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={isUpdating}
                  onClick={() => handleDecision('rejected')}
                >
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
