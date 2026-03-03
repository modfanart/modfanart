'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyArtworksQuery, useDeleteArtworkMutation } from '@/services/api/artworkApi'; // ← import your RTK Query hook
import { ArtworkListItem } from '@/services/api/artworkApi'; // type
import { DashboardShell } from '@/components/dashboard-shell';

// Helper: map backend status to UI-friendly display
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'published':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'draft':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-orange-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'archived':
      return <XCircle className="h-4 w-4 text-gray-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-orange-100 text-orange-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ManageSubmissionsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch real data from backend
  const {
    data, // { artworks: ArtworkListItem[], pagination }
    isLoading,
    isFetching,
    error,
  } = useGetMyArtworksQuery(activeTab === 'all' ? undefined : { status: activeTab });
  console.log(data);
  // Mutation for delete
  const [deleteArtwork, { isLoading: isDeleting }] = useDeleteArtworkMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteArtwork(id).unwrap();
      setDeleteId(null);
      // RTK Query will automatically refetch the list thanks to invalidatesTags
    } catch (err) {
      console.error('Delete failed:', err);
      // TODO: show toast error
    }
  };

  const artworks = data?.artworks ?? [];

  if (error) {
    return (
      <div className="flex-1 p-6 text-center text-red-600">
        Failed to load your submissions. Please try again later.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
        <Link href="/submissions/new">
          <Button className="bg-[#9747ff] hover:bg-[#8035e0]">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Submission
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading || isFetching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Skeleton className="h-full w-full absolute" />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">
                No {activeTab === 'all' ? 'submissions' : activeTab} yet
              </h3>
              <p className="text-muted-foreground mt-2">Start creating your first artwork!</p>
              <Link href="/submissions/new">
                <Button className="mt-6 bg-[#9747ff] hover:bg-[#8035e0]">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Artwork
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((art: ArtworkListItem) => (
                <Card key={art.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square relative">
                    <Image
                      src={
                        art.thumbnail_url ||
                        art.file_url ||
                        '/placeholder.svg?height=400&width=400&text=Artwork'
                      }
                      alt={art.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusBadge(art.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(art.status)}
                          {art.status.charAt(0).toUpperCase() + art.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium line-clamp-1">{art.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {art.description || 'No description provided'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Views: {art.views_count}</span>
                        <span>{new Date(art.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Link href={`/artworks/${art.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/artworks/${art.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog
                          open={deleteId === art.id}
                          onOpenChange={(open) => !open && setDeleteId(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => {
                                e.preventDefault();
                                setDeleteId(art.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this artwork?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The artwork will be permanently
                                removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isDeleting}
                                onClick={() => handleDelete(art.id)}
                              >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
