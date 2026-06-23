'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  Users,
  Tag,
  Clock,
  Briefcase,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock data - replace with actual API calls
const mockOpportunity = {
  id: 'opp-123',
  title: 'Star Wars Fan Art Collection',
  description:
    'Create fan art for the upcoming Star Wars series. Selected artwork will be featured in official promotional materials.',
  brand: 'Lucasfilm',
  category: 'Fan Art',
  status: 'active',
  deadline: '2025-05-04T23:59:59Z',
  reward: '$500 per selected artwork',
  requirements: 'Digital artwork only, must be original, must follow brand guidelines',
  createdAt: '2024-02-15T12:00:00Z',
  updatedAt: '2024-02-15T12:00:00Z',
};

const mockEntries = [
  {
    id: 'entry-1',
    title: 'Darth Vader Reimagined',
    artist: 'Jane Smith',
    status: 'approved',
    submittedAt: '2024-02-20T14:30:00Z',
    imageUrl: '/placeholder.svg?height=300&width=300',
  },
  {
    id: 'entry-2',
    title: 'Luke Skywalker Portrait',
    artist: 'John Doe',
    status: 'pending',
    submittedAt: '2024-02-21T09:15:00Z',
    imageUrl: '/placeholder.svg?height=300&width=300',
  },
  {
    id: 'entry-3',
    title: 'Millennium Falcon in Hyperspace',
    artist: 'Alex Johnson',
    status: 'rejected',
    submittedAt: '2024-02-19T16:45:00Z',
    imageUrl: '/placeholder.svg?height=300&width=300',
  },
];

export function ManageOpportunityContent({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [viewEntryDialogOpen, setViewEntryDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch opportunity details
    const fetchOpportunity = async () => {
      try {
        // Replace with actual API call
        setOpportunity(mockOpportunity);
        setEntries(mockEntries);
      } catch (error) {
        console.error('Error fetching opportunity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [opportunityId]);

  const handleDeleteOpportunity = async () => {
    try {
      // Replace with actual API call
      console.log('Deleting opportunity:', opportunityId);

      // Redirect to opportunities list after deletion
      router.push('/dashboard/opportunities');
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    }
  };

  const handleUpdateEntryStatus = async (entryId: string, newStatus: string) => {
    try {
      // Replace with actual API call
      console.log(`Updating entry ${entryId} status to ${newStatus}`);

      // Update local state
      setEntries(
        entries.map((entry) => (entry.id === entryId ? { ...entry, status: newStatus } : entry))
      );
    } catch (error) {
      console.error('Error updating entry status:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      // Replace with actual API call
      console.log('Deleting entry:', entryId);

      // Update local state
      setEntries(entries.filter((entry) => entry.id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <p>Loading opportunity details...</p>;
  }

  if (!opportunity) {
    return (
      <EmptyState
        title="Opportunity Not Found"
        description="The opportunity you're looking for doesn't exist or you don't have access to it."
        icon="file-question"
        actionLabel="Back to Opportunities"
        actionLink="/dashboard/opportunities"
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/opportunities">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{opportunity.title}</h2>
          </div>
          <p className="text-muted-foreground">Manage opportunity details and submissions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/opportunities/${opportunityId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the opportunity and all
                  associated entries.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteOpportunity}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="mr-1 h-4 w-4" />
                Brand
              </div>
              <p className="font-medium">{opportunity.brand}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Tag className="mr-1 h-4 w-4" />
                Category
              </div>
              <p className="font-medium">{opportunity.category}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                Deadline
              </div>
              <p className="font-medium">{formatDate(opportunity.deadline)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                Created
              </div>
              <p className="font-medium">{formatDate(opportunity.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-1 h-4 w-4" />
                Status
              </div>
              <div>
                {opportunity.status === 'active' ? (
                  <Badge className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h4 className="mb-2 font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{opportunity.description}</p>
          </div>

          <div className="mt-6">
            <h4 className="mb-2 font-medium">Requirements</h4>
            <p className="text-sm text-muted-foreground">{opportunity.requirements}</p>
          </div>

          <div className="mt-6">
            <h4 className="mb-2 font-medium">Reward</h4>
            <p className="text-sm text-muted-foreground">{opportunity.reward}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="entries">
        <TabsList>
          <TabsTrigger value="entries">Entries ({entries.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="entries" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <CardTitle>Submissions</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[200px]"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredEntries.length === 0 ? (
                <EmptyState
                  title="No entries found"
                  description="No entries match your current filters."
                  icon="inbox"
                />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 border-b pb-3 text-sm font-medium">
                    <div>Entry</div>
                    <div>Artist</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[1fr_100px_100px_80px] gap-4 items-center"
                    >
                      <div className="font-medium">{entry.title}</div>
                      <div className="text-sm">{entry.artist}</div>
                      <div>{getStatusBadge(entry.status)}</div>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedEntry(entry);
                                setViewEntryDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateEntryStatus(entry.id, 'approved')}
                            >
                              <Badge className="mr-2 bg-green-500 h-4">✓</Badge>
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateEntryStatus(entry.id, 'rejected')}
                            >
                              <Badge className="mr-2 bg-red-500 h-4">✕</Badge>
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteEntry(entry.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Analytics</CardTitle>
              <CardDescription>
                View statistics and performance metrics for this opportunity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{entries.length}</div>
                    <p className="text-xs text-muted-foreground">+12% from last week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {entries.length > 0
                        ? `${Math.round(
                            (entries.filter((e) => e.status === 'approved').length /
                              entries.length) *
                              100
                          )}%`
                        : '0%'}
                    </div>
                    <p className="text-xs text-muted-foreground">-3% from last week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2.4 days</div>
                    <p className="text-xs text-muted-foreground">+1 day from last week</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 h-[300px] w-full flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Analytics charts will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Entry Dialog */}
      <Dialog open={viewEntryDialogOpen} onOpenChange={setViewEntryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedEntry?.title}</DialogTitle>
            <DialogDescription>
              Submitted by {selectedEntry?.artist} on{' '}
              {selectedEntry ? formatDate(selectedEntry.submittedAt) : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex justify-center">
              <img
                src={selectedEntry?.imageUrl || '/placeholder.svg'}
                alt={selectedEntry?.title}
                className="max-h-[300px] object-contain rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div>{selectedEntry && getStatusBadge(selectedEntry.status)}</div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
            <div className="flex space-x-2 mb-3 sm:mb-0">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedEntry) handleUpdateEntryStatus(selectedEntry.id, 'approved');
                }}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedEntry) handleUpdateEntryStatus(selectedEntry.id, 'rejected');
                }}
              >
                Reject
              </Button>
            </div>
            <Button variant="secondary" onClick={() => setViewEntryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
