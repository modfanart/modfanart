'use client';
import React from 'react'; // ← add this if not already present
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
import {
  FileText,
  Eye,
  MoreHorizontal,
  ShieldCheck,
  ShieldX,
  Clock,
  IndianRupee,
  Download,
  AlertTriangle,
} from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import {
  useGetIssuedLicensesQuery,
  useRevokeLicenseMutation,
  type License,
} from '@/services/api/licenseApi';

type LicenseStatus = 'active' | 'expired' | 'revoked' | 'pending';

interface DisplayLicense extends License {
  displayStatus: LicenseStatus;
  statusLabel: string; // ← add this
  statusColor: string;
  statusIcon: React.ReactNode; // ← after fix #1
}

const getLicenseStatusInfo = (
  license: License
): {
  displayStatus: LicenseStatus;
  label: string;
  color: string;
  icon: React.ReactNode;
} => {
  const now = new Date();
  const expires = license.expires_at ? new Date(license.expires_at) : null;

  if (license.revoked_at) {
    return {
      displayStatus: 'revoked',
      label: 'Revoked',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: <ShieldX className="h-3.5 w-3.5" />,
    };
  }

  if (expires && expires < now) {
    return {
      displayStatus: 'expired',
      label: 'Expired',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <Clock className="h-3.5 w-3.5" />,
    };
  }

  if (!license.is_active) {
    return {
      displayStatus: 'pending',
      label: 'Pending',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: <Clock className="h-3.5 w-3.5" />,
    };
  }

  return {
    displayStatus: 'active',
    label: 'Active',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium',
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  };
};

export default function LicenseRequestsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { user, loading: authLoading } = useAuth();

  const {
    data: licenses = [],
    isLoading: licensesLoading,
    isFetching: licensesFetching,
  } = useGetIssuedLicensesQuery();

  const [revokeLicense, { isLoading: isRevoking }] = useRevokeLicenseMutation();

  const isLoading = authLoading || licensesLoading || licensesFetching;

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading your issued licenses...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold">Please sign in</h2>
          <p className="text-muted-foreground">
            You need to be logged in to manage license requests.
          </p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Enhance licenses with display info
  const enhancedLicenses: DisplayLicense[] = licenses.map((lic) => {
    const { displayStatus, label, color, icon } = getLicenseStatusInfo(lic);
    return {
      ...lic,
      displayStatus,
      statusLabel: label,
      statusColor: color,
      statusIcon: icon,
    };
  });

  let displayed = enhancedLicenses;

  if (activeTab !== 'all') {
    displayed = enhancedLicenses.filter((lic) => lic.displayStatus === activeTab);
  }

  const handleRevoke = async (id: string, reason?: string) => {
    try {
      await revokeLicense({ id, reason }).unwrap();
      // toast.success("License revoked successfully");
    } catch (err) {
      console.error('Revoke failed:', err);
      // toast.error("Failed to revoke license");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">License Requests</h1>
          <p className="text-muted-foreground mt-1">Manage licenses issued for your artwork</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="revoked">Revoked</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {displayed.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-muted/30">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/70" />
              <h3 className="mt-4 text-lg font-medium">
                No {activeTab === 'all' ? 'licenses' : activeTab + ' licenses'} yet
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                When buyers purchase licenses for your work, they will appear here.
              </p>
              <Link href="/dashboard/artist/my-artworks">
                <Button variant="outline" className="mt-6">
                  View Your Artworks
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayed.map((license) => (
                <Card
                  key={license.id}
                  className="overflow-hidden hover:shadow-md transition-all duration-200 border"
                >
                  <CardHeader className="pb-3 pt-4 px-5 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-md overflow-hidden border bg-muted">
                          {license.artwork?.thumbnail_url ? (
                            <Image
                              src={license.artwork.thumbnail_url}
                              alt={license.artwork.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                              Art
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base line-clamp-1">
                            {license.artwork?.title || 'Untitled Work'}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            License #{license.id.slice(-8).toUpperCase()}
                          </CardDescription>
                        </div>
                      </div>

                      <Badge
                        className={`${license.statusColor} flex items-center gap-1 px-2.5 py-0.5 text-xs`}
                      >
                        {license.statusIcon}
                        {license.statusLabel}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-4 pt-1 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                      <div>
                        <p className="text-xs uppercase tracking-wide">Buyer</p>
                        <p className="font-medium text-foreground">
                          @{license.buyer?.username || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide">Type</p>
                        <p className="font-medium capitalize">{license.license_type}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide">Issued</p>
                        <p className="font-medium">
                          {format(new Date(license.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide">Expires</p>
                        <p className="font-medium">
                          {license.expires_at
                            ? format(new Date(license.expires_at), 'MMM d, yyyy')
                            : 'Never'}
                        </p>
                      </div>
                    </div>

                    {license.revoked_at && (
                      <div className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200 mt-2">
                        Revoked on {format(new Date(license.revoked_at), 'MMM d, yyyy')}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="px-5 py-4 border-t bg-muted/40 flex justify-between gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/licenses/${license.id}`}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View Details
                      </Link>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                          <Link href={`/licenses/${license.id}`} className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            View Contract
                          </Link>
                        </DropdownMenuItem>

                        {license.displayStatus === 'active' && (
                          <>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <ShieldX className="mr-2 h-4 w-4" />
                                  Revoke License
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    Revoke License?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will immediately terminate the buyer's rights to use the
                                    artwork. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isRevoking}
                                    onClick={() => handleRevoke(license.id)}
                                  >
                                    {isRevoking ? 'Revoking...' : 'Revoke License'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
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
