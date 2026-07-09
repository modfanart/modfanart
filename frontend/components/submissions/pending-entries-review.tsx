'use client';

import Image from 'next/image';
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

function ContestPendingEntries({ contestId, contestTitle }: { contestId: string; contestTitle: string }) {
  const { data, isLoading } = useGetContestEntriesQuery({ contestId, status: 'pending' });
  const [updateEntryStatus, { isLoading: isUpdating }] = useUpdateEntryStatusMutation();

  const entries = data?.entries || [];

  const handleDecision = async (entryId: string, status: 'approved' | 'rejected') => {
    try {
      await updateEntryStatus({ contestId, entryId, status }).unwrap();
      toast({ title: status === 'approved' ? 'Entry approved' : 'Entry rejected' });
    } catch (err: any) {
      toast({
        title: 'Action failed',
        description: err?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
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
            <div className="aspect-square relative bg-gray-50">
              <Image
                src={entry.artwork.thumbnail_url || entry.artwork.file_url || '/placeholder.svg'}
                alt={entry.artwork.title}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="font-medium line-clamp-1">{entry.artwork.title}</p>
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
    </div>
  );
}

export function PendingEntriesReview() {
  const { user } = useAuth();
  const brandIds = (user?.brands || []).map((b) => b.id);

  const { data: contestsData, isLoading: contestsLoading } = useGetContestsQuery(undefined, {
    skip: brandIds.length === 0,
  });

  const myContests = (contestsData?.contests || []).filter((c) => brandIds.includes(c.brand_id));

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
          myContests.map((contest) => (
            <ContestPendingEntries key={contest.id} contestId={contest.id} contestTitle={contest.title} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
