'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ExternalLink, Loader2, Send, Tag } from 'lucide-react';

import { unpackSubmissionNotes } from '@/lib/contest-notes';
import type { ContestEntry } from '@/services/api/contestsApi';
import { useSubmitJudgeScoreMutation } from '@/services/api/contestsApi';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm whitespace-pre-wrap break-words">{children}</div>
    </div>
  );
}

const NOT_PROVIDED = <span className="italic text-muted-foreground">Not provided</span>;

/**
 * One contest entry as a judge sees it: the full submission detail plus the
 * scoring controls.
 *
 * Score and comment state is deliberately local to this component. The two
 * judging screens previously kept one shared `score`/`comments` pair for the
 * whole grid, so typing a comment on one entry and then clicking into another
 * entry's score box submitted the first comment against the second artwork.
 * Per-card state makes that impossible by construction rather than by careful
 * bookkeeping.
 */
export function JudgeEntryCard({
  entry,
  contestId,
}: {
  entry: ContestEntry;
  contestId: string;
}) {
  const { toast } = useToast();
  const [submitScore, { isLoading: isSubmitting }] = useSubmitJudgeScoreMutation();

  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');

  const { artwork, creator } = entry;
  const { note, originalIp } = unpackSubmissionNotes(entry.submission_notes);

  const handleSubmit = async () => {
    const value = Number(score);

    if (!Number.isInteger(value) || value < 1 || value > 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid score',
        description: 'Please give a whole number between 1 and 10.',
      });
      return;
    }

    try {
      const payload: {
        contestId: string;
        entryId: string;
        score: number;
        comments?: string;
      } = { contestId, entryId: entry.id, score: value };

      if (comments.trim()) {
        payload.comments = comments.trim();
      }

      await submitScore(payload).unwrap();

      toast({
        title: 'Score submitted',
        description: `Your score for "${artwork.title}" has been saved.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to submit score',
        description: err?.data?.error || err?.data?.message || 'Something went wrong.',
      });
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative h-64 bg-muted">
        {/* object-contain, not object-cover: a judge is assessing the whole
            piece, so cropping it to fill the tile hides part of what they are
            scoring. */}
        <Image
          src={artwork.thumbnail_url || artwork.file_url}
          alt={artwork.title}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
        <div>
          <h3 className="font-semibold leading-tight">{artwork.title}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="relative h-6 w-6 rounded-full overflow-hidden bg-muted shrink-0">
              {creator.avatar_url && (
                <Image src={creator.avatar_url} alt="" fill className="object-cover" sizes="24px" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">@{creator.username}</p>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild className="w-full">
          <a href={artwork.file_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1 h-4 w-4" />
            View full design
          </a>
        </Button>

        <Separator />

        <div className="space-y-3">
          <Field label="Description">{artwork.description || NOT_PROVIDED}</Field>
          <Field label="Artist's note">{note || NOT_PROVIDED}</Field>
          <Field label="Fandom / Original IP">{originalIp || NOT_PROVIDED}</Field>
          {/* Category and tags render only when present, unlike the fields
              above which show "Not provided". Nothing in production has either
              yet (artwork_categories and taggings are both empty), so an
              always-visible empty row would read as broken on every card
              rather than as an artwork that simply has no tags. */}
          {!!artwork.categories?.length && (
            <Field label="Category">
              <div className="flex flex-wrap gap-2 pt-1">
                {artwork.categories.map((category) => (
                  <Badge key={category.id} variant="secondary">
                    {category.name}
                  </Badge>
                ))}
              </div>
            </Field>
          )}
          {!!artwork.tags?.length && (
            <Field label="Tags">
              <div className="flex flex-wrap gap-2 pt-1">
                {artwork.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="flex items-center">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </Field>
          )}
          <Field label="Submitted">
            {entry.created_at ? format(new Date(entry.created_at), 'dd MMM yyyy') : NOT_PROVIDED}
          </Field>
        </div>

        {/* judge_score is max(score) across every judge on the contest, not the
            signed-in judge's own score, so it must not be labelled "your"
            anything. With two judges the second to look would otherwise read
            the first judge's number as their own and be anchored by it. */}
        {entry.judge_score !== null && entry.judge_score !== undefined && (
          <Badge variant="secondary" className="w-fit">
            Highest score so far: {entry.judge_score}/10
          </Badge>
        )}

        <div className="pt-3 border-t mt-auto space-y-3">
          <div>
            <Label htmlFor={`score-${entry.id}`} className="text-xs uppercase tracking-widest">
              Your score (1-10)
            </Label>
            <div className="flex gap-3 mt-2">
              <Input
                id={`score-${entry.id}`}
                type="number"
                min={1}
                max={10}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Score"
                className="w-24"
              />
              <Button onClick={handleSubmit} disabled={isSubmitting || !score} size="sm">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Textarea
            aria-label={`Comments for ${artwork.title}`}
            placeholder="Add comments (optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="text-sm min-h-[80px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
