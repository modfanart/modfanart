'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarIcon,
  Users,
  PlusCircle,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Trophy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import { useGetContestsQuery } from '@/services/api/contestsApi';
import { useToast } from '@/components/ui/use-toast';

function getStatusBadge(status: string) {
  switch (status) {
    case 'live':
    case 'published':
      return { label: 'Live', variant: 'default' as const };
    case 'completed':
    case 'archived':
      return { label: 'Closed', variant: 'secondary' as const };
    case 'judging':
      return { label: 'Judging', variant: 'outline' as const };
    case 'draft':
      return { label: 'Draft', variant: 'outline' as const };
    default:
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        variant: 'secondary' as const,
      };
  }
}

export default function OpportunitiesManagementPage() {
  const { data: contestsResponse, isLoading, isError } = useGetContestsQuery();
  const { toast } = useToast();

  const contests = contestsResponse?.contests ?? [];

  const activeContests = contests.filter((c) => ['live', 'published'].includes(c.status));
  const closedContests = contests.filter((c) => ['completed', 'archived'].includes(c.status));
  const draftContests = contests.filter((c) => c.status === 'draft');

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    // Add your delete mutation here
    toast({ title: 'Contest deleted', description: title });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[420px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Opportunities</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Manage contests, fan art opportunities and licensing deals
          </p>
        </div>

        <Button asChild size="lg">
          <Link href="/dashboard/opportunities/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Opportunity
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-8">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="all" className="rounded-lg px-6">
            All
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-lg px-6">
            Active
          </TabsTrigger>
          <TabsTrigger value="closed" className="rounded-lg px-6">
            Closed
          </TabsTrigger>
          <TabsTrigger value="draft" className="rounded-lg px-6">
            Drafts
          </TabsTrigger>
        </TabsList>

        {/* ALL */}
        <TabsContent value="all">
          <OpportunityGrid items={contests} onDelete={handleDelete} />
        </TabsContent>

        {/* ACTIVE */}
        <TabsContent value="active">
          <OpportunityGrid items={activeContests} onDelete={handleDelete} />
        </TabsContent>

        {/* CLOSED */}
        <TabsContent value="closed">
          <OpportunityGrid items={closedContests} isClosed onDelete={handleDelete} />
        </TabsContent>

        {/* DRAFTS */}
        <TabsContent value="draft">
          <OpportunityGrid items={draftContests} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function OpportunityGrid({
  items,
  isClosed = false,
  onDelete,
}: {
  items: any[];
  isClosed?: boolean;
  onDelete: (id: string, title: string) => void;
}) {
  if (items.length === 0) {
    return <EmptyState isClosed={isClosed} />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((opp) => {
        const statusInfo = getStatusBadge(opp.status);
        const deadline = opp.submission_end_date || opp.end_date;

        return (
          <Card
            key={opp.id}
            className="group overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col"
          >
            {/* Image */}
            <div className="relative h-52 overflow-hidden">
              <Image
                src={opp.hero_image || '/placeholder.svg?height=400&text=Contest'}
                alt={opp.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute top-3 right-3">
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>

              {/* Actions Menu */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-black/70 hover:bg-black/80 text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/opportunities/${opp.slug || opp.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Public
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/opportunities/${opp.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/opportunities/${opp.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> Manage
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(opp.id, opp.title)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="line-clamp-2 text-lg leading-tight">{opp.title}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
              <p className="line-clamp-3 text-sm text-muted-foreground mb-4">{opp.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{deadline ? new Date(deadline).toLocaleDateString() : 'No deadline'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{opp.entry_count ?? 0} entries</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4 border-t">
              <div className="flex w-full gap-3">
                <Button asChild variant="default" className="flex-1">
                  <Link href={`/dashboard/opportunities/${opp.id}`}>
                    {isClosed ? 'View Results' : 'Manage'}
                  </Link>
                </Button>

                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/opportunities/${opp.slug || opp.id}`}>View Public</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

// Empty State
function EmptyState({ isClosed = false }: { isClosed?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl">
      <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">No opportunities found</h3>
      <p className="text-muted-foreground max-w-sm">
        {isClosed
          ? "You don't have any closed opportunities yet."
          : "You haven't created any opportunities yet."}
      </p>
    </div>
  );
}
