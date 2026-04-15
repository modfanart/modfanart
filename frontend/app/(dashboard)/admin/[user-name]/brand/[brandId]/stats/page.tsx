'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import {
  useGetBrandQuery,
  useGetBrandArtworksQuery,
  useGetBrandPostsQuery,
  useGetBrandManagersQuery,
  useAssignBrandManagerMutation,
} from '@/services/api/brands';

import { useGetUserByUsernameQuery } from '@/services/api/userApi';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

import {
  BarChart3,
  Users,
  FileText,
  Eye,
  ArrowUpRight,
  Image as ImageIcon,
  UserPlus,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function BrandStatsPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const { toast } = useToast();

  // Main data
  const { data: brand, isLoading: brandLoading } = useGetBrandQuery(brandId);
  const { data: artworks = [] } = useGetBrandArtworksQuery(brandId, { skip: !brandId });
  const { data: posts = [] } = useGetBrandPostsQuery(brandId, { skip: !brandId });

  // Managers
  const { data: managers = [] } = useGetBrandManagersQuery(brandId, { skip: !brandId });
  const [assignBrandManager, { isLoading: isAssigning }] = useAssignBrandManagerMutation();

  // Manager assignment state
  const [usernameSearch, setUsernameSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'manager' | 'editor'>('manager');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  // Search user by username
  const { data: searchedUser, isFetching: isSearching } = useGetUserByUsernameQuery(
    usernameSearch,
    { skip: !usernameSearch || usernameSearch.length < 3 }
  );

  const isActive = brand?.status === 'active';

  const handleAssignManager = async () => {
    if (!selectedUser || !brandId) return;

    try {
      await assignBrandManager({
        brandId: brandId as string,
        userId: selectedUser.id,
        role: selectedRole,
      }).unwrap();

      toast({
        title: 'Success',
        description: `${selectedUser.username} has been assigned as ${selectedRole}.`,
      });

      setShowAssignDialog(false);
      setUsernameSearch('');
      setSelectedUser(null);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to assign manager',
        description: err?.data?.message || 'User may already manage another brand.',
      });
    }
  };

  if (brandLoading || !brand) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Skeleton className="h-48 w-full rounded-xl mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      {/* Header */}
      <Card className="mb-10 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/5 relative">
          {brand.banner_url && (
            <img
              src={brand.banner_url}
              alt="Brand banner"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
        </div>

        <CardContent className="relative px-8 pb-8 -mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary/20">
              <AvatarImage src={brand.logo_url ?? undefined} alt={brand.name} />
              <AvatarFallback className="text-5xl bg-primary/10">
                {brand.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-3xl font-bold">{brand.name}</h1>
                <Badge variant={isActive ? 'default' : 'secondary'}>{brand.status}</Badge>
                {brand.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={brand.website} target="_blank" rel="noopener noreferrer">
                      Website <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {brand.followers_count} followers
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {brand.views_count} profile views
                </div>
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4" />
                  {artworks.length} artworks
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {posts.length} posts
                </div>
              </div>

              {brand.description && (
                <p className="mt-4 text-muted-foreground max-w-3xl">{brand.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard icon={<Users className="h-6 w-6" />} title="Followers" value={brand.followers_count} trend="+12%" />
        <StatCard icon={<Eye className="h-6 w-6" />} title="Profile Views" value={brand.views_count} trend="+28%" />
        <StatCard icon={<ImageIcon className="h-6 w-6" />} title="Artworks" value={artworks.length} trend="+3" />
        <StatCard icon={<FileText className="h-6 w-6" />} title="Posts" value={posts.length} trend="+5" />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="artworks">Artworks</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="verification">Verification & Managers</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Brand Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Recent Growth</h4>
                  <p className="text-sm text-muted-foreground">
                    Last 30 days: +{Math.floor(Math.random() * 80 + 20)} followers
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Top Artwork</h4>
                  <p className="text-sm text-muted-foreground">
                    {artworks[0]?.title || 'No featured artwork yet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Artworks Tab */}
        <TabsContent value="artworks">
          <Card>
            <CardHeader>
              <CardTitle>Featured Artworks</CardTitle>
            </CardHeader>
            <CardContent>
              {artworks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No artworks added to this brand yet.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {artworks.map((art: any) => (
                    <div key={art.id} className="border rounded-lg overflow-hidden">
                      {art.preview_url && (
                        <div className="aspect-video relative bg-muted">
                          <Image src={art.preview_url} alt={art.title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-medium line-clamp-1">{art.title}</h4>
                        {art.is_featured && <Badge variant="secondary" className="mt-2">Featured</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No posts published yet.</div>
              ) : (
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post: any) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{post.title}</h4>
                        {post.is_pinned && <Badge>Pinned</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(post.created_at), 'd MMM yyyy')}
                      </p>
                      <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                        <span>{post.likes_count} likes</span>
                        <span>{post.comments_count} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* VERIFICATION & MANAGERS TAB */}
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Verification & Brand Managers
                  </CardTitle>
                  <CardDescription>
                    Manage brand verification and assign managers. Each user can manage only one brand.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-10">
              {/* Brand Status */}
              <div>
                <h3 className="font-medium mb-3">Current Brand Status</h3>
                <div className="flex items-center gap-4">
                  <Badge variant={isActive ? 'default' : 'secondary'} className="text-base px-5 py-1.5">
                    {brand.status.toUpperCase()}
                  </Badge>
                  {brand.verification_request_id && (
                    <Badge variant="outline">Verification Requested</Badge>
                  )}
                </div>
              </div>

              {/* Managers Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Brand Managers ({managers.length})</h3>

                  <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Manager
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Assign Brand Manager</DialogTitle>
                        <DialogDescription>
                          Search for a user and assign them a role. The user must not already manage another brand.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 py-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            placeholder="Enter username..."
                            value={usernameSearch}
                            onChange={(e) => setUsernameSearch(e.target.value)}
                          />
                        </div>

                        {isSearching && <p className="text-sm text-muted-foreground">Searching user...</p>}

                        {searchedUser && !selectedUser && (
                          <div className="border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={searchedUser.avatar_url} />
                                <AvatarFallback>{searchedUser.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{searchedUser.username}</p>
                                <p className="text-sm text-muted-foreground">{searchedUser.email}</p>
                              </div>
                            </div>
                            <Button
                              className="mt-3 w-full"
                              onClick={() => setSelectedUser(searchedUser)}
                            >
                              Select this user
                            </Button>
                          </div>
                        )}

                        {selectedUser && (
                          <div>
                            <Label>Role</Label>
                            <Select value={selectedRole} onValueChange={(val: any) => setSelectedRole(val)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owner">Owner — Full Access</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="editor">Editor — Content Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setShowAssignDialog(false);
                          setSelectedUser(null);
                          setUsernameSearch('');
                        }}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAssignManager}
                          disabled={!selectedUser || isAssigning}
                        >
                          {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Assign as {selectedRole}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {managers.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg text-muted-foreground">
                    No managers assigned yet. Click "Assign Manager" to add one.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {managers.map((manager: any) => (
                      <div
                        key={manager.user_id}
                        className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={manager.avatar_url} />
                            <AvatarFallback>{manager.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{manager.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {manager.display_name || manager.email || 'No email'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {manager.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-6">
                <AlertTriangle className="h-3.5 w-3.5" />
                Users can only be assigned as a manager to <strong>one brand</strong> at a time. This is enforced by the backend.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab (placeholder) */}
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Coming soon — detailed analytics and insights.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// StatCard Component
function StatCard({
  icon,
  title,
  value,
  trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className="text-primary/70">{icon}</div>
        </div>
        {trend && (
          <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {trend} this month
          </p>
        )}
      </CardContent>
    </Card>
  );
}