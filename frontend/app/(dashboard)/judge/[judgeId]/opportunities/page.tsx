'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Trophy,
  Users,
  Link as LinkIcon,
  Copy,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

import { useGetJudgeContestsQuery } from '@/services/api/contestsApi';
import { useAuth } from '@/store/AuthContext';

/* ShadCN UI */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

/* Status Helper */
const getStatusBadge = (status: string = 'unknown') => {
  const s = status.toLowerCase();

  switch (s) {
    case 'live':
    case 'published':
      return {
        label: 'Live',
        variant: 'default' as const,
        className: 'bg-green-600 hover:bg-green-700',
      };

    case 'judging':
      return { label: 'Judging', variant: 'default' as const, className: 'bg-blue-600' };

    case 'completed':
      return { label: 'Completed', variant: 'secondary' as const };

    case 'archived':
      return { label: 'Archived', variant: 'outline' as const };

    default:
      return { label: status, variant: 'secondary' as const };
  }
};

export default function JudgeOpportunitiesPage() {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useGetJudgeContestsQuery(undefined, {
    skip: !user,
  });

  const contests = data?.contests ?? [];

  const activeContests = contests.filter((c: any) =>
    ['live', 'published', 'judging'].includes(c.status?.toLowerCase() ?? '')
  );

  const completedContests = contests.filter((c: any) =>
    ['completed', 'archived'].includes(c.status?.toLowerCase() ?? '')
  );

  const [open, setOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [judgingLink, setJudgingLink] = useState('');

  const generateJudgingLink = async (contest: any) => {
    setSelectedContest(contest);
    setOpen(true);
    setLoading(true);
    setJudgingLink('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const token = Math.random().toString(36).substring(2, 15);
      setJudgingLink(`${window.location.origin}/judge/contest/${contest.id}?token=${token}`);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (judgingLink) {
      await navigator.clipboard.writeText(judgingLink);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading your assigned contests...</div>;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load contests. {(error as any)?.data?.message || 'Please try again later.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">My Judging Opportunities</h1>
          <p className="text-muted-foreground">Contests where you are invited as a judge</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active ({activeContests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedContests.length})</TabsTrigger>
          <TabsTrigger value="all">All Contests ({contests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <OpportunityGrid
            items={activeContests}
            isActive
            user={user}
            onGenerateLink={generateJudgingLink}
          />
        </TabsContent>

        <TabsContent value="completed">
          <OpportunityGrid
            items={completedContests}
            user={user}
            onGenerateLink={generateJudgingLink}
          />
        </TabsContent>

        <TabsContent value="all">
          <OpportunityGrid items={contests} user={user} onGenerateLink={generateJudgingLink} />
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Private Judging Link</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="font-medium">{selectedContest?.title}</p>

            <div className="p-3 bg-muted rounded text-sm break-all font-mono">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Generating...
                </div>
              ) : (
                judgingLink
              )}
            </div>

            <Button onClick={copyLink} disabled={!judgingLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Grid Component */
function OpportunityGrid({
  items,
  isActive = false,
  onGenerateLink,
  user,
}: {
  items: any[];
  isActive?: boolean;
  onGenerateLink: (contest: any) => void;
  user: any;
}) {
  const judgeBase = user?.username ? `/judge/${user.username}` : '/judge';

  if (items.length === 0) {
    return (
      <div className="text-center py-16 border rounded-xl">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No contests found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((contest) => {
        const statusInfo = getStatusBadge(contest.status);
        const deadline = contest.submission_end_date || contest.judging_end_date;

        return (
          <Card key={contest.id} className="flex flex-col">
            <div className="relative h-40">
              <Image
                src={contest.hero_image || '/placeholder.jpg'}
                alt={contest.title}
                fill
                className="object-cover"
              />
              <Badge className="absolute top-2 right-2">{statusInfo.label}</Badge>
            </div>

            <CardHeader>
              <CardTitle>{contest.title}</CardTitle>
            </CardHeader>

            <CardContent>
              {deadline && (
                <p className="text-sm">
                  <CalendarIcon className="inline h-4 w-4 mr-1" />
                  {format(new Date(deadline), 'dd MMM yyyy')}
                </p>
              )}

              <p className="text-sm">
                <Users className="inline h-4 w-4 mr-1" />
                {contest.entry_count ?? 0} entries
              </p>
            </CardContent>

            <CardFooter className="grid grid-cols-2 gap-2">
              <Button asChild>
                <Link href={`${judgeBase}/contest/${contest.id}`}>
                  {isActive ? 'Start' : 'View'}
                </Link>
              </Button>

              <Button variant="outline" onClick={() => onGenerateLink(contest)}>
                <LinkIcon className="h-4 w-4 mr-1" />
                Link
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
