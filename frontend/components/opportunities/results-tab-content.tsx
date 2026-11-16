'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, Check, Copy, FileText, Link2, Trophy } from 'lucide-react';

import { isPdfUrl } from '@/lib/utils/file-type';

import {
  useGetLeaderboardQuery,
  useGetResultsShareLinkMutation,
  useSelectWinnersMutation,
  type LeaderboardEntry,
} from '@/services/api/contestsApi';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Brand-side winner selection: the leaderboard ranked by average judge score,
 * with a checkbox per entry. Saving marks the checked entries as winners
 * (rank follows leaderboard order, so "the top 2" means exactly that) and the
 * share button hands back a public link anyone can open - no account needed.
 */
export function ResultsTabContent({ contestId }: { contestId: string }) {
  const { data, isLoading, error } = useGetLeaderboardQuery({ contestId });
  const [selectWinners, { isLoading: isSaving }] = useSelectWinnersMutation();
  const [getShareLink, { isLoading: isSharing }] = useGetResultsShareLinkMutation();

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rows = data?.leaderboard ?? [];

  // Seed the checkboxes from what is already selected in the database, so
  // reopening the tab shows the real current selection, not a blank slate.
  useEffect(() => {
    setChecked(new Set(rows.filter((r) => r.status === 'winner').map((r) => r.entry_id)));
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (entryId: string) => {
    setSaved(false);
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      // Leaderboard order, not click order: the first checked row on the
      // board is rank 1. Prizes are matched to rank downstream.
      const entryIds = rows.filter((r) => checked.has(r.entry_id)).map((r) => r.entry_id);
      await selectWinners({ contestId, entry_ids: entryIds }).unwrap();
      setSaved(true);
    } catch (err: any) {
      alert(err?.data?.error || 'Failed to save the winner selection');
    }
  };

  const handleShare = async () => {
    try {
      const { share_url } = await getShareLink(contestId).unwrap();
      setShareUrl(share_url);
      try {
        await navigator.clipboard.writeText(share_url);
        setCopied(true);
      } catch {
        // Clipboard can be unavailable (permissions, http). The URL is shown
        // below either way, so the brand can copy it by hand.
        setCopied(false);
      }
    } catch (err: any) {
      alert(err?.data?.error || 'Failed to create the share link');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Could not load the standings. Please try again.</AlertDescription>
      </Alert>
    );
  }

  if (rows.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No entries have been scored yet, so there is nothing to select from. The standings
          fill in as the judges work through the submissions.
        </AlertDescription>
      </Alert>
    );
  }

  const unscored = Math.max(0, (data?.approved_total ?? 0) - (data?.scored_total ?? 0));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Select winners
          </h3>
          <p className="text-sm text-muted-foreground">
            Ranked by average judge score. Check the entries to feature, save, then share the
            link — anyone with it can view the results, no account needed.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {saved ? <Check className="mr-2 h-4 w-4" /> : null}
            {saved ? 'Saved' : `Save selection (${checked.size})`}
          </Button>
          <Button variant="outline" onClick={handleShare} disabled={isSharing}>
            <Link2 className="mr-2 h-4 w-4" />
            Share results
          </Button>
        </div>
      </div>

      {shareUrl && (
        <Alert>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs break-all">{shareUrl}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(shareUrl).then(
                  () => setCopied(true),
                  () => {}
                );
              }}
            >
              <Copy className="mr-1 h-3 w-3" />
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {unscored > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Judging is not finished. {unscored} approved{' '}
            {unscored === 1 ? 'entry has' : 'entries have'} no score yet and cannot appear
            here.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {rows.map((entry: LeaderboardEntry) => (
          <Card key={entry.entry_id}>
            <CardContent className="p-4 flex gap-4 items-center">
              <Checkbox
                id={`winner-${entry.entry_id}`}
                checked={checked.has(entry.entry_id)}
                onCheckedChange={() => toggle(entry.entry_id)}
                aria-label={`Select ${entry.artwork_title || 'entry'} as a winner`}
              />

              <div className="text-2xl font-bold tabular-nums w-10 shrink-0 text-center text-muted-foreground">
                {entry.rank}
              </div>

              <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                {(entry.artwork_thumbnail || entry.artwork_file_url) && (
                  isPdfUrl(entry.artwork_thumbnail || entry.artwork_file_url) ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[9px] font-medium leading-none text-muted-foreground">
                        PDF
                      </span>
                    </div>
                  ) : (
                    <Image
                      src={entry.artwork_thumbnail || entry.artwork_file_url || ''}
                      alt={entry.artwork_title || 'Entry'}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">
                  {entry.artwork_title || 'Untitled'}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  @{entry.creator_username}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-lg font-bold tabular-nums">{entry.score_judge}</div>
                <div className="text-xs text-muted-foreground">
                  avg of {entry.judge_count} {entry.judge_count === 1 ? 'judge' : 'judges'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}