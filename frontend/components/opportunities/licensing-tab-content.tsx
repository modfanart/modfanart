'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FileCheck2 } from 'lucide-react';

import {
  useGetContestEntriesQuery,
  useUpdateEntryLicensingStatusMutation,
  type ContestEntry,
  type LicensingStatus,
} from '@/services/api/contestsApi';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * The licensing lifecycle the brand walks by hand for now; sending the
 * agreement from the system is a later phase. Order matches the real
 * progression so the dropdown reads as a timeline.
 */
const LICENSING_OPTIONS: Array<{ value: LicensingStatus; label: string }> = [
  { value: 'not_started', label: 'Not started' },
  { value: 'agreement_sent', label: 'Agreement sent' },
  { value: 'signed', label: 'Signed' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
  { value: 'finalized', label: 'Finalized' },
];

const LABELS = Object.fromEntries(LICENSING_OPTIONS.map((o) => [o.value, o.label]));

/** Same colored-badge treatment as the brand licensing-requests page. */
const BADGE_CLASSES: Record<LicensingStatus, string> = {
  not_started: 'bg-gray-50 text-gray-600 border-gray-200',
  agreement_sent: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  signed: 'bg-blue-50 text-blue-700 border-blue-200',
  declined: 'bg-red-50 text-red-700 border-red-200',
  expired: 'bg-red-50 text-red-700 border-red-200',
  finalized: 'bg-green-50 text-green-700 border-green-200',
};

/**
 * Brand-side licensing tracker: the selected winners, each with a manually
 * set agreement status. 'Finalized' is the explicit action that makes the
 * artwork publicly visible in the gallery, so it alone asks for confirmation.
 */
export function LicensingTabContent({ contestId }: { contestId: string }) {
  const { data, isLoading, error } = useGetContestEntriesQuery({
    contestId,
    status: 'winner',
    limit: 50,
  });
  const [updateLicensingStatus, { isLoading: isSaving }] =
    useUpdateEntryLicensingStatusMutation();

  // The finalize confirmation in flight: which entry, pending user consent.
  const [pendingFinalize, setPendingFinalize] = useState<ContestEntry | null>(null);
  const [savingEntryId, setSavingEntryId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Winners come back in submission order; rank is the order the brand chose.
  const winners = [...(data?.entries ?? [])].sort(
    (a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER)
  );

  const applyStatus = async (entry: ContestEntry, status: LicensingStatus) => {
    setSaveError(null);
    setSavingEntryId(entry.id);
    try {
      await updateLicensingStatus({
        contestId,
        entryId: entry.id,
        licensing_status: status,
      }).unwrap();
    } catch (err: any) {
      setSaveError(err?.data?.error || 'Failed to update the licensing status');
    } finally {
      setSavingEntryId(null);
    }
  };

  const handleChange = (entry: ContestEntry, status: LicensingStatus) => {
    if (status === entry.licensing_status) return;
    // Finalizing publishes the artwork; every other move is freely revisable.
    if (status === 'finalized') setPendingFinalize(entry);
    else void applyStatus(entry, status);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Could not load the winners. Please try again.</AlertDescription>
      </Alert>
    );
  }

  if (winners.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No winners selected yet. Pick winners in the Results tab first — licensing is
          tracked per selected winner.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileCheck2 className="h-5 w-5" />
          Licensing
        </h3>
        <p className="text-sm text-muted-foreground">
          Track each winner&apos;s licensing agreement. Set the status by hand as it
          progresses — an artwork appears in the public gallery only after you mark it
          Finalized.
        </p>
      </div>

      {saveError && (
        <Alert variant="destructive">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {winners.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-4 flex gap-4 items-center">
              <div className="text-2xl font-bold tabular-nums w-10 shrink-0 text-center text-muted-foreground">
                {entry.rank ?? '—'}
              </div>

              <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                {(entry.artwork?.thumbnail_url || entry.artwork?.file_url) && (
                  <Image
                    src={entry.artwork.thumbnail_url || entry.artwork.file_url || ''}
                    alt={entry.artwork?.title || 'Winning entry'}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">
                  {entry.artwork?.title || 'Untitled'}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  @{entry.creator?.username}
                </div>
              </div>

              <Badge variant="outline" className={BADGE_CLASSES[entry.licensing_status]}>
                {LABELS[entry.licensing_status] ?? entry.licensing_status}
              </Badge>

              <Select
                value={entry.licensing_status}
                onValueChange={(value) => handleChange(entry, value as LicensingStatus)}
                disabled={isSaving && savingEntryId === entry.id}
              >
                <SelectTrigger
                  className="w-44 shrink-0"
                  aria-label={`Licensing status for ${entry.artwork?.title || 'entry'}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LICENSING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={pendingFinalize !== null}
        onOpenChange={(open) => {
          if (!open) setPendingFinalize(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize licensing?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the licensing agreement for{' '}
              <span className="font-semibold">
                {pendingFinalize?.artwork?.title || 'this entry'}
              </span>{' '}
              as complete and makes the artwork publicly visible in the gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingFinalize) void applyStatus(pendingFinalize, 'finalized');
                setPendingFinalize(null);
              }}
            >
              Finalize
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
