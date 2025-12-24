import Link from 'next/link';
import Image from 'next/image';
import { CalendarIcon, Users, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
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
import { DashboardShell } from '@/components/dashboard-shell';
import { MoreHorizontal } from 'lucide-react';

export default function OpportunitiesManagementPage() {
  // Sample data for contests and RFDs
  const myOpportunities = [
    {
      id: 'my-contest-1',
      title: 'Pixel Art Game Characters Contest',
      description: 'Create pixel art versions of popular video game characters.',
      image:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
      deadline: '2023-08-30',
      prize: '$500',
      entries: 24,
      status: 'active',
      categories: ['Gaming', 'Pixel Art'],
      type: 'contest',
    },
    {
      id: 'my-rfd-1',
      title: 'Sci-Fi Book Cover Illustrations',
      description: 'Looking for artists to create cover art for sci-fi novel series.',
      image:
        'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?q=80&w=2070&auto=format&fit=crop',
      deadline: '2023-09-15',
      compensation: '$1,200 per cover',
      submissions: 8,
      status: 'active',
      categories: ['Books', 'Sci-Fi'],
      type: 'rfd',
    },
    {
      id: 'my-contest-2',
      title: 'Retro Gaming Fan Art Challenge',
      description: 'Create fan art inspired by classic video games from the 80s and 90s.',
      image:
        'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=2070&auto=format&fit=crop',
      deadline: '2023-07-10',
      prize: '$350',
      entries: 42,
      status: 'closed',
      categories: ['Gaming', 'Retro'],
      type: 'contest',
    },
  ];

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Opportunities Management</h1>
            <p className="text-lg text-muted-foreground">
              Create and manage fan art contests and licensing opportunities.
            </p>
          </div>
          <Link href="/dashboard/opportunities/create">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="relative h-11 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              All Opportunities
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="relative h-11 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="closed"
              className="relative h-11 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Closed
            </TabsTrigger>
            <TabsTrigger
              value="draft"
              className="relative h-11 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Drafts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="flex flex-col overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={opportunity.image || '/placeholder.svg'}
                      alt={opportunity.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute right-2 top-2">
                      <Badge
                        variant={opportunity.status === 'active' ? 'default' : 'secondary'}
                        className={
                          opportunity.status === 'active' ? 'bg-green-100 text-green-800' : ''
                        }
                      >
                        {opportunity.status === 'active' ? 'Active' : 'Closed'}
                      </Badge>
                    </div>
                    <div className="absolute right-2 bottom-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-black/20 text-white hover:bg-black/30"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardHeader className="flex-1">
                    <CardTitle className="line-clamp-1 text-xl">{opportunity.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                      {opportunity.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {opportunity.categories.map((category) => (
                        <Badge key={category} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Due {new Date(opportunity.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {opportunity.type === 'contest'
                            ? `${(opportunity as any).entries} Entries`
                            : `${(opportunity as any).submissions} Submissions`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="grid grid-cols-2 gap-4 border-t bg-muted/50 p-4">
                    <Link href={`/dashboard/opportunities/${opportunity.id}`} className="w-full">
                      <Button variant="secondary" className="w-full">
                        Manage
                      </Button>
                    </Link>
                    <Link href={`/opportunities/${opportunity.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Public
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myOpportunities
                .filter((opp) => opp.status === 'active')
                .map((opportunity) => (
                  <Card key={opportunity.id} className="flex flex-col overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={opportunity.image || '/placeholder.svg'}
                        alt={opportunity.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute right-2 top-2">
                        <Badge
                          variant={opportunity.status === 'active' ? 'default' : 'secondary'}
                          className={
                            opportunity.status === 'active' ? 'bg-green-100 text-green-800' : ''
                          }
                        >
                          {opportunity.status === 'active' ? 'Active' : 'Closed'}
                        </Badge>
                      </div>
                      <div className="absolute right-2 bottom-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="bg-black/20 text-white hover:bg-black/30"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardHeader className="flex-1">
                      <CardTitle className="line-clamp-1 text-xl">{opportunity.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                        {opportunity.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {opportunity.categories.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Due {new Date(opportunity.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {opportunity.type === 'contest'
                              ? `${(opportunity as any).entries} Entries`
                              : `${(opportunity as any).submissions} Submissions`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-4 border-t bg-muted/50 p-4">
                      <Link href={`/dashboard/opportunities/${opportunity.id}`} className="w-full">
                        <Button variant="secondary" className="w-full">
                          Manage
                        </Button>
                      </Link>
                      <Link href={`/opportunities/${opportunity.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          View Public
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="closed" className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myOpportunities
                .filter((opp) => opp.status === 'closed')
                .map((opportunity) => (
                  <Card key={opportunity.id} className="flex flex-col overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={opportunity.image || '/placeholder.svg'}
                        alt={opportunity.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute right-2 top-2">
                        <Badge variant="secondary">Closed</Badge>
                      </div>
                      <div className="absolute right-2 bottom-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="bg-black/20 text-white hover:bg-black/30"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardHeader className="flex-1">
                      <CardTitle className="line-clamp-1 text-xl">{opportunity.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                        {opportunity.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {opportunity.categories.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Ended {new Date(opportunity.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {opportunity.type === 'contest'
                              ? `${(opportunity as any).entries} Entries`
                              : `${(opportunity as any).submissions} Submissions`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-4 border-t bg-muted/50 p-4">
                      <Link href={`/dashboard/opportunities/${opportunity.id}`} className="w-full">
                        <Button variant="secondary" className="w-full">
                          View Results
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/opportunities/${opportunity.id}/reopen`}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          Reopen
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="draft" className="space-y-8">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">No Draft Opportunities</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                You don't have any draft opportunities yet. Create one to get started.
              </p>
              <Link href="/dashboard/opportunities/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Opportunity
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
