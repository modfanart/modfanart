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

import {
  useGetJudgeContestsQuery,
  useGetJudgeInvitationsQuery,
  useAcceptJudgeInvitationMutation,
} from '@/services/api/contestsApi';

import { useAuth } from '@/store/AuthContext';

/* UI */
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
      return { label: 'Live', className: 'bg-green-600' };

    case 'judging':
      return { label: 'Judging', className: 'bg-blue-600' };

    case 'completed':
      return { label: 'Completed' };

    case 'archived':
      return { label: 'Archived' };

    default:
      return { label: status };
  }
};

export default function JudgeOpportunitiesPage() {
  const { user } = useAuth();

  /* ✅ Accepted contests */
  const { data, isLoading, isError, error, refetch } = useGetJudgeContestsQuery(undefined, {
    skip: !user,
  });

  /* 🆕 Invitations */
  const { data: inviteData, refetch: refetchInvites } = useGetJudgeInvitationsQuery(undefined, {
    skip: !user,
  });

  const [acceptInvitation] = useAcceptJudgeInvitationMutation();

  const contests = data?.contests ?? [];
  const invitations = inviteData?.contests ?? [];

  /* Filters */
  const activeContests = contests.filter((c: any) =>
    ['live', 'published', 'judging'].includes(c.status?.toLowerCase() ?? '')
  );

  const completedContests = contests.filter((c: any) =>
    ['completed', 'archived'].includes(c.status?.toLowerCase() ?? '')
  );

  /* Dialog state */
  const [open, setOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [judgingLink, setJudgingLink] = useState('');

  /* Accept handler */
  const handleAccept = async (contestId: string) => {
    if (!user) return; // ✅ guard

    try {
      await acceptInvitation({
        contestId,
        judgeId: user.id,
      }).unwrap();
      refetch();
      refetchInvites();
    } catch (err) {
      console.error(err);
    }
  };

  /* Link generator */
  const generateJudgingLink = async (contest: any) => {
    setSelectedContest(contest);
    setOpen(true);
    setLoading(true);
    setJudgingLink('');

    await new Promise((r) => setTimeout(r, 800));

    const token = Math.random().toString(36).substring(2);
    setJudgingLink(`${window.location.origin}/judge/contest/${contest.id}?token=${token}`);

    setLoading(false);
  };

  const copyLink = async () => {
    if (judgingLink) {
      await navigator.clipboard.writeText(judgingLink);
      alert('Copied!');
    }
  };

  /* Loading */
  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  /* Error */
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load contests. {(error as any)?.data?.message}
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
      <Tabs defaultValue="invites" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invites">Invitations ({invitations.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeContests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedContests.length})</TabsTrigger>
          <TabsTrigger value="all">All ({contests.length})</TabsTrigger>
        </TabsList>

        {/* 🔥 Invitations */}
        <TabsContent value="invites">
          {invitations.length === 0 ? (
            <EmptyState text="No pending invitations" />
          ) : (
            <Grid>
              {invitations.map((contest) => (
                <Card key={contest.id}>
                  <CardHeader>
                    <CardTitle>{contest.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground">{contest.description}</p>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button onClick={() => handleAccept(contest.id)}>Accept</Button>
                    <Button variant="outline" disabled>
                      Ignore
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </Grid>
          )}
        </TabsContent>

        {/* Active */}
        <TabsContent value="active">
          <OpportunityGrid
            items={activeContests}
            isActive
            user={user}
            onGenerateLink={generateJudgingLink}
          />
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed">
          <OpportunityGrid
            items={completedContests}
            user={user}
            onGenerateLink={generateJudgingLink}
          />
        </TabsContent>

        {/* All */}
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
            <p>{selectedContest?.title}</p>

            <div className="p-3 bg-muted rounded font-mono text-sm">
              {loading ? <Loader2 className="animate-spin" /> : judgingLink}
            </div>

            <Button onClick={copyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Grid */
function Grid({ children }: any) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

/* Empty */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 border rounded-xl">
      <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium">{text}</p>
    </div>
  );
}

/* Cards */
function OpportunityGrid({ items, isActive = false, onGenerateLink, user }: any) {
  const base = user?.username ? `/judge/${user.username}` : '/judge';

  if (!items.length) return <EmptyState text="No contests found" />;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((contest: any) => {
        const status = getStatusBadge(contest.status);

        return (
          <Card key={contest.id}>
            <div className="relative h-40">
              <Image
                src={contest.hero_image || '/placeholder.jpg'}
                alt={contest.title}
                fill
                className="object-cover"
              />
              <Badge className="absolute top-2 right-2">{status.label}</Badge>
            </div>

            <CardHeader>
              <CardTitle>{contest.title}</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm">
                <CalendarIcon className="inline h-4 w-4 mr-1" />
                {format(new Date(contest.submission_end_date), 'dd MMM yyyy')}
              </p>

              <p className="text-sm">
                <Users className="inline h-4 w-4 mr-1" />
                {contest.entry_count ?? 0} entries
              </p>
            </CardContent>

            <CardFooter className="grid grid-cols-2 gap-2">
              <Button asChild>
                <Link href={`${base}/contest/${contest.id}`}>{isActive ? 'Start' : 'View'}</Link>
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
