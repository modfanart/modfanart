// app/(dashboard)/admin/AdminDashboardContent.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Shield,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  Settings,
  BarChart3,
  PlusCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/store/AuthContext';

// ── Real RTK Query hooks ────────────────────────────────────────
import { useGetPlatformStatsQuery } from '@/services/api/adminApi';
import { useGetAllUsersQuery, type UserProfile } from '@/services/api/userApi';
import { useGetPendingBrandVerificationsQuery } from '@/services/api/adminApi';

// ── NEW: use the status-based contests query ───────────────────
import { useGetContestsByStatusQuery } from '@/services/api/contestsApi';
interface StatCardProps {
  icon: any; // consider LucideIcon instead of any
  title: string;
  value: string | number;
  trend?: string | undefined; // ← explicitly allow undefined
  variant?: 'default' | 'destructive';
}
export default function AdminDashboardContent() {
  const { user, loading: authLoading } = useAuth();

  // ── Platform overview stats ────────────────────────────────
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetPlatformStatsQuery();

  // ── Recent users (last 8 sign-ups) ──────────────────────────
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
  } = useGetAllUsersQuery({
    page: 1,
    limit: 8,
    sort: 'created_at',
    order: 'desc',
  });

  // ── Pending brand verifications ─────────────────────────────
  const {
    data: pendingBrandsData,
    isLoading: brandsLoading,
    isError: brandsError,
  } = useGetPendingBrandVerificationsQuery({ limit: 5 });

  // ── Pending contests – using getContestsByStatus ────────────
  const {
    data: pendingContestsResponse,
    isLoading: contestsLoading,
    isError: contestsError,
  } = useGetContestsByStatusQuery({
    status: 'pending_review', // or 'moderation_pending' — adjust to your actual pending status
    visibility: 'public', // or omit / set to undefined if you want all
    page: 1,
    limit: 10,
    sort: 'created_at',
    order: 'desc',
  });

  const platformStats = statsData ?? {
    totalUsers: 0,
    activeBrands: 0,
    totalContests: 0,
    pendingApprovals: 0,
    reportedItems: 0,
    activeJudges: 0,
  };

  const recentUsers = usersData?.users ?? [];
  const pendingBrands = pendingBrandsData ?? [];
  const pendingContests = pendingContestsResponse?.contests ?? [];

  const isSuperAdmin = user?.role?.name === 'super_admin' || user?.role?.name === 'Admin';

  // ── Combined loading state ──────────────────────────────────
  if (authLoading || statsLoading || usersLoading || brandsLoading || contestsLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return (
      <div className="p-12 text-center">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-semibold">Access Restricted</h2>
        <p className="mt-2 text-muted-foreground">
          This area is only available to platform administrators.
        </p>
      </div>
    );
  }

  const hasError = statsError || usersError || brandsError || contestsError;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-6 lg:p-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview • Moderation • Contests • Users • Settings
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Platform Settings
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/contests/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Official Contest
              </Link>
            </Button>
          </div>
        </div>

        {hasError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-md">
            Some dashboard data could not be loaded. Please try refreshing the page.
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon={Users}
            title="Total Users"
            value={platformStats.totalUsers.toLocaleString()}
          />
          <StatCard
            icon={Users}
            title="Active Brands"
            value={platformStats.activeBrands.toLocaleString()}
          />
          <StatCard icon={Award} title="Contests" value={platformStats.totalContests} />
          <StatCard
            icon={AlertCircle}
            title="Pending Approvals"
            value={platformStats.pendingApprovals}
            trend={platformStats.pendingApprovals > 10 ? 'urgent' : undefined}
            variant={platformStats.pendingApprovals > 5 ? 'destructive' : 'default'}
          />
          <StatCard
            icon={Ban}
            title="Reports"
            value={platformStats.reportedItems}
            variant={platformStats.reportedItems > 0 ? 'destructive' : 'default'}
          />
          <StatCard icon={BarChart3} title="Judges" value={platformStats.activeJudges} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Recent Users</TabsTrigger>
            <TabsTrigger value="brands">Pending Brands</TabsTrigger>
            <TabsTrigger value="contests">Pending Contests</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common admin tasks</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <ActionButton
                    href="/admin/brands/pending"
                    label="Review Brand Verifications"
                    icon={Shield}
                  />
                  <ActionButton
                    href="/admin/contests/pending"
                    label="Approve New Contests"
                    icon={Award}
                  />
                  <ActionButton
                    href="/admin/reports"
                    label="Handle Reported Content"
                    icon={AlertCircle}
                    variant="destructive"
                  />
                  <ActionButton href="/admin/judges" label="Manage Judges" icon={Users} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                  <CardDescription>Recent system status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatusItem
                    label="API Status"
                    value="Operational"
                    icon={CheckCircle}
                    color="text-green-600"
                  />
                  <StatusItem label="Last Backup" value="Today at 03:00 IST" icon={Clock} />
                  <StatusItem
                    label="Open Reports"
                    value={`${platformStats.reportedItems} unresolved`}
                    icon={AlertCircle}
                    color={
                      platformStats.reportedItems > 0 ? 'text-orange-600' : 'text-muted-foreground'
                    }
                  />
                  <StatusItem
                    label="Pending Brands"
                    value={`${pendingBrands.length} awaiting review`}
                    icon={Shield}
                    color={pendingBrands.length > 0 ? 'text-orange-600' : 'text-muted-foreground'}
                  />
                  <StatusItem
                    label="Pending Contests"
                    value={`${pendingContests.length} awaiting review`}
                    icon={Award}
                    color={pendingContests.length > 0 ? 'text-orange-600' : 'text-muted-foreground'}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recent Users */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Sign-ups</CardTitle>
                  <CardDescription>New users in the last 7 days</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/users">View All Users</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No recent sign-ups found.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {recentUsers.map((u: UserProfile) => (
                      <div key={u.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
                            {u.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{u.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {u.role?.name || 'user'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <Badge
                            variant={
                              u.status === 'pending_verification'
                                ? 'secondary'
                                : u.status === 'suspended' || u.status === 'deactivated'
                                  ? 'destructive'
                                  : 'default'
                            }
                          >
                            {u.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Brands */}
          <TabsContent value="brands">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Pending Brand Verifications</CardTitle>
                  <CardDescription>Brands awaiting approval</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/brands/pending">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {pendingBrands.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No pending brand verification requests at the moment.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingBrands.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                              {brand.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{brand.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {brand.company_name || brand.slug}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/brands/${brand.id}`}>Review</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Contests – using getContestsByStatus */}
          <TabsContent value="contests">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Contests Awaiting Review</CardTitle>
                  <CardDescription>Brand-submitted campaigns pending approval</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/contests">All Contests</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {pendingContests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No contests currently awaiting review.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingContests.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{c.title}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/contests/${c.id}`}>View</Link>
                          </Button>
                          <Button size="sm">Approve</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ── Reusable Components (unchanged) ────────────────────────────────────────

function StatCard({ icon: Icon, title, value, trend, variant = 'default' }: StatCardProps) {
  return (
    <Card className={variant === 'destructive' ? 'border-destructive/30 bg-destructive/5' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={`h-5 w-5 ${variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p
            className={`text-xs mt-1 ${variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ActionButton({
  href,
  label,
  icon: Icon,
  variant = 'default',
}: {
  href: string;
  label: string;
  icon: any;
  variant?: 'default' | 'destructive';
}) {
  return (
    <Button variant={variant} className="h-auto py-6 justify-start" asChild>
      <Link href={href}>
        <Icon className="mr-3 h-5 w-5" />
        {label}
      </Link>
    </Button>
  );
}

function StatusItem({
  label,
  value,
  icon: Icon,
  color = 'text-muted-foreground',
}: {
  label: string;
  value: string;
  icon: any;
  color?: string;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span>{label}</span>
      </div>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}
