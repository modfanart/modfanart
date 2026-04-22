'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useGetIssuedLicensesQuery } from '@/services/api/licenseApi';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import Image from 'next/image';

export default function LicenseRequestsPage() {
  // ─────────────────────────────────────────────
  // ALL HOOKS MUST BE AT THE TOP
  // ─────────────────────────────────────────────
  const { user, loading: authLoading } = useAuth();

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: licenses = [], isLoading, error } = useGetIssuedLicensesQuery();

  // ─────────────────────────────────────────────
  // Derived state / memos (still hooks, so before any return)
  // ─────────────────────────────────────────────
  const licenseRequests = useMemo(() => {
    return licenses.map((lic: any) => {
      const status = lic.revoked_at ? 'rejected' : lic.is_active ? 'approved' : 'pending';

      return {
        id: lic.id,
        artworkId: lic.artwork_id,
        artworkTitle: lic.artwork?.title ?? 'Untitled Artwork',
        artworkImage: lic.artwork?.thumbnail_url ?? '/placeholder.svg',

        requester: {
          name: lic.buyer?.username ?? 'Unknown User',
          avatar: '/placeholder.svg',
          company: lic.buyer?.email ?? '',
          verified: true,
        },

        licenseType: lic.license_type,
        usage: 'Not specified',
        duration: lic.expires_at
          ? `Until ${new Date(lic.expires_at).toLocaleDateString()}`
          : 'Lifetime',

        payment: 'N/A',
        status,
        requestDate: lic.created_at,
      };
    });
  }, [licenses]);

  const pendingRequests = licenseRequests.filter((r: any) => r.status === 'pending');
  const approvedRequests = licenseRequests.filter((r: any) => r.status === 'approved');
  const rejectedRequests = licenseRequests.filter((r: any) => r.status === 'rejected');

  const handleOpenDetails = (request: any) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 flex gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 flex gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 flex gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderRequestCard = (request: any) => (
    <Card
      key={request.id}
      className="cursor-pointer hover:shadow-md"
      onClick={() => handleOpenDetails(request)}
    >
      {/* ... your card content (unchanged) ... */}
      <CardHeader className="flex justify-between">
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={request.requester.avatar} />
            <AvatarFallback>{request.requester.name?.[0] ?? '?'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm">{request.requester.name}</CardTitle>
            <CardDescription className="text-xs">{request.requester.company}</CardDescription>
          </div>
        </div>
        {renderStatusBadge(request.status)}
      </CardHeader>

      <CardContent className="flex gap-3">
        <div className="relative h-20 w-20">
          <Image
            src={request.artworkImage}
            alt={request.artworkTitle}
            fill
            className="object-cover rounded"
          />
        </div>

        <div className="text-sm">
          <p className="font-medium">{request.artworkTitle}</p>
          <p>{request.licenseType}</p>
          <p className="text-green-600">{request.duration}</p>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  );

  // ─────────────────────────────────────────────
  // Now safe to do early returns
  // ─────────────────────────────────────────────
  if (authLoading || isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6 text-red-500">Unauthorized</div>;
  }

  // ─────────────────────────────────────────────
  // Rest of your JSX (unchanged)
  // ─────────────────────────────────────────────
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.username ?? user.email}</h1>
          <p className="text-muted-foreground">Manage your license requests</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input className="pl-9 w-[250px]" placeholder="Search..." />
        </div>
      </div>

      {/* TABS */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({licenseRequests.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {licenseRequests.map(renderRequestCard)}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {pendingRequests.map(renderRequestCard)}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {approvedRequests.map(renderRequestCard)}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {rejectedRequests.map(renderRequestCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* DETAILS MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>License Details</DialogTitle>
            <DialogDescription>{selectedRequest?.artworkTitle}</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="text-sm space-y-2">
              <p>Requester: {selectedRequest.requester.name}</p>
              <p>Type: {selectedRequest.licenseType}</p>
              <p>Status: {selectedRequest.status}</p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
