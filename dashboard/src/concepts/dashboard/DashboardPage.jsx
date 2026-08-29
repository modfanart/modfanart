import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  ShieldCheck,
  Warning,
  TrendUp,
  ArrowRight,
  Clock,
  Buildings,
  Flag,
  UserCircle,
  CheckCircle,
  CaretRight,
} from "@phosphor-icons/react";

import { Header } from "../../components/layout/Header";

import { Button } from "../../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";

import { Badge } from "../../components/ui/badge";

import { Separator } from "../../components/ui/separator";

import { Skeleton } from "../../components/ui/skeleton";

import {
  useGetPlatformStatsQuery,
  useGetPendingBrandVerificationsQuery,
  useGetModerationQueueQuery,
  useGetAdminUsersQuery,
} from "../../services/api/adminApi";

import { toast } from "sonner";

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-US").format(value || 0);
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getInitials = (username) => {
  if (!username) return "??";

  return username.slice(0, 2).toUpperCase();
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClassName = "",
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className={`
        group
        bg-zinc-950
        border-zinc-800
        transition-all
        duration-200
        hover:border-zinc-700
        hover:bg-zinc-900/80
        ${onClick ? "cursor-pointer" : ""}
      `}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {title}
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {formatNumber(value)}
            </p>

            {description && (
              <p className="mt-1 text-xs text-zinc-500">
                {description}
              </p>
            )}
          </div>

          <div
            className={`
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-lg border border-zinc-800
              bg-zinc-900
              ${iconClassName}
            `}
          >
            <Icon size={20} weight="duotone" />
          </div>
        </div>

        {onClick && (
          <div className="mt-4 flex items-center gap-1 text-xs text-zinc-500 transition-colors group-hover:text-zinc-300">
            View details
            <ArrowRight
              size={13}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* =========================================================
   STAT SKELETON
========================================================= */

const StatSkeleton = () => {
  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24 bg-zinc-800" />
            <Skeleton className="h-8 w-20 bg-zinc-800" />
            <Skeleton className="h-3 w-32 bg-zinc-800" />
          </div>

          <Skeleton className="h-10 w-10 rounded-lg bg-zinc-800" />
        </div>
      </CardContent>
    </Card>
  );
};

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
  icon: Icon,
  title,
  description,
  actionLabel = "View all",
  onAction,
}) => {
  return (
    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
          <Icon
            size={18}
            weight="duotone"
            className="text-zinc-400"
          />
        </div>

        <div className="min-w-0">
          <CardTitle className="text-sm font-semibold text-white">
            {title}
          </CardTitle>

          {description && (
            <CardDescription className="mt-1 text-xs text-zinc-500">
              {description}
            </CardDescription>
          )}
        </div>
      </div>

      {onAction && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAction}
          className="shrink-0 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-white"
        >
          {actionLabel}
          <ArrowRight size={14} className="ml-1" />
        </Button>
      )}
    </CardHeader>
  );
};

/* =========================================================
   BRAND VERIFICATION ITEM
========================================================= */

const VerificationItem = ({ item }) => {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
          <Buildings
            size={18}
            weight="duotone"
            className="text-zinc-400"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {item.company_name || "Unnamed Brand"}
          </p>

          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
            <Clock size={12} />
            Verification requested
          </p>
        </div>
      </div>

      <Badge
        variant="secondary"
        className="shrink-0 border border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
      >
        {formatStatus(item.verification_status)}
      </Badge>
    </div>
  );
};

/* =========================================================
   MODERATION ITEM
========================================================= */

const ModerationItem = ({ item }) => {
  const isPending =
    item.status === "pending" ||
    item.status === "open" ||
    item.status === "pending_review";

  return (
    <div className="group flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
          <Flag
            size={18}
            weight="duotone"
            className="text-zinc-400"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium capitalize text-white">
            {formatStatus(item.entity_type)}
          </p>

          <p className="mt-0.5 text-xs text-zinc-500">
            Moderation item
          </p>
        </div>
      </div>

      <Badge
        variant={isPending ? "secondary" : "outline"}
        className={
          isPending
            ? "shrink-0 border border-red-500/20 bg-red-500/10 text-red-400"
            : "shrink-0 border-zinc-700 text-zinc-400"
        }
      >
        {formatStatus(item.status)}
      </Badge>
    </div>
  );
};

/* =========================================================
   USER ITEM
========================================================= */

const UserItem = ({ user }) => {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
      <div className="flex min-w-0 items-center gap-3">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="h-9 w-9 shrink-0 rounded-full border border-zinc-700 object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-300">
            {getInitials(user.username)}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            @{user.username || "unknown"}
          </p>

          <p className="truncate text-xs text-zinc-500">
            {user.email || "No email"}
          </p>
        </div>
      </div>

      <CaretRight
        size={16}
        className="shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-400"
      />
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
        <Icon
          size={22}
          weight="duotone"
          className="text-zinc-600"
        />
      </div>

      <p className="text-sm font-medium text-zinc-300">
        {title}
      </p>

      <p className="mt-1 max-w-xs text-xs text-zinc-600">
        {description}
      </p>
    </div>
  );
};

/* =========================================================
   MAIN DASHBOARD
========================================================= */

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetPlatformStatsQuery();

  const { data: verifications } =
    useGetPendingBrandVerificationsQuery({
      limit: 5,
    });

  const { data: moderation } =
    useGetModerationQueueQuery({
      limit: 5,
    });

  const { data: users } =
    useGetAdminUsersQuery({
      limit: 5,
      page: 1,
    });

  /* =======================================================
     ERROR TOAST
  ======================================================= */

  useEffect(() => {
    if (statsError) {
      toast.error("Failed to load admin dashboard");
    }
  }, [statsError]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (statsLoading) {
    return (
      <div className="min-h-screen">
        <Header
          title="Admin Dashboard"
          subtitle="Platform overview & moderation control"
        />

        <div className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-5 w-40 bg-zinc-800" />
                <Skeleton className="h-16 w-full bg-zinc-900" />
                <Skeleton className="h-16 w-full bg-zinc-900" />
                <Skeleton className="h-16 w-full bg-zinc-900" />
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-5 w-40 bg-zinc-800" />
                <Skeleton className="h-16 w-full bg-zinc-900" />
                <Skeleton className="h-16 w-full bg-zinc-900" />
                <Skeleton className="h-16 w-full bg-zinc-900" />
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-5 w-40 bg-zinc-800" />
                <Skeleton className="h-16 w-full bg-zinc-900" />
                <Skeleton className="h-16 w-full bg-zinc-900" />
                <Skeleton className="h-16 w-full bg-zinc-900" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     DATA
  ======================================================= */

  const statsData = stats?.data || {};

  const verificationItems = verifications?.data || [];
  const moderationItems = moderation?.data || [];
  const recentUsers = users?.data || [];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="min-h-screen"
      data-testid="admin-dashboard"
    >
      <Header
        title="Admin Dashboard"
        subtitle="Platform overview & moderation control"
      />

      <main className="space-y-8 p-4 sm:p-6">

        {/* =================================================
            PAGE INTRO
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Overview
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              Platform at a glance
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-zinc-500">
              Monitor users, brands, verification requests and
              moderation activity from one place.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/admin/users")}
            className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-white"
          >
            <Users size={16} className="mr-2" />
            Manage Users
          </Button>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Users"
              value={statsData.totalUsers}
              description="Registered platform users"
              icon={Users}
              iconClassName="text-zinc-300"
              onClick={() => navigate("/admin/users")}
            />

            <StatCard
              title="Active Brands"
              value={statsData.activeBrands}
              description="Currently active brands"
              icon={TrendUp}
              iconClassName="text-zinc-300"
              onClick={() => navigate("/admin/brands")}
            />

            <StatCard
              title="Pending Approvals"
              value={statsData.pendingApprovals}
              description="Requests awaiting review"
              icon={ShieldCheck}
              iconClassName="text-yellow-400"
              onClick={() => navigate("/admin/brands")}
            />

            <StatCard
              title="Reported Items"
              value={statsData.reportedItems}
              description="Items requiring attention"
              icon={Warning}
              iconClassName="text-red-400"
              onClick={() => navigate("/admin/moderation")}
            />

          </div>
        </section>

        {/* =================================================
            MAIN PANELS
        ================================================= */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* ===============================================
              BRAND VERIFICATIONS
          =============================================== */}

          <Card className="bg-zinc-950 border-zinc-800">
            <SectionHeader
              icon={Buildings}
              title="Brand Verifications"
              description="Pending requests"
              onAction={() => navigate("/admin/brands")}
            />

            <Separator className="bg-zinc-800" />

            <CardContent className="space-y-2 p-4">
              {verificationItems.length > 0 ? (
                verificationItems.map((item) => (
                  <VerificationItem
                    key={item.id}
                    item={item}
                  />
                ))
              ) : (
                <EmptyState
                  icon={CheckCircle}
                  title="All caught up"
                  description="There are no pending brand verification requests."
                />
              )}
            </CardContent>
          </Card>

          {/* ===============================================
              MODERATION
          =============================================== */}

          <Card className="bg-zinc-950 border-zinc-800">
            <SectionHeader
              icon={Flag}
              title="Moderation Queue"
              description="Items requiring review"
              onAction={() =>
                navigate("/admin/moderation")
              }
            />

            <Separator className="bg-zinc-800" />

            <CardContent className="space-y-2 p-4">
              {moderationItems.length > 0 ? (
                moderationItems.map((item) => (
                  <ModerationItem
                    key={item.id}
                    item={item}
                  />
                ))
              ) : (
                <EmptyState
                  icon={CheckCircle}
                  title="Queue is clear"
                  description="There are no moderation items waiting for review."
                />
              )}
            </CardContent>
          </Card>

          {/* ===============================================
              RECENT USERS
          =============================================== */}

          <Card className="bg-zinc-950 border-zinc-800">
            <SectionHeader
              icon={UserCircle}
              title="Recent Users"
              description="Latest registrations"
              onAction={() => navigate("/admin/users")}
            />

            <Separator className="bg-zinc-800" />

            <CardContent className="space-y-2 p-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <UserItem
                    key={user.id}
                    user={user}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Users}
                  title="No users found"
                  description="There are no recent users to display."
                />
              )}
            </CardContent>
          </Card>

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Jump directly into common administrative tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <Button
              variant="outline"
              onClick={() => navigate("/admin/users")}
              className="h-auto justify-between border-zinc-800 bg-zinc-950 px-4 py-4 text-left hover:bg-zinc-900"
            >
              <span className="flex items-center gap-3">
                <Users
                  size={18}
                  weight="duotone"
                  className="text-zinc-400"
                />

                <span>
                  <span className="block text-sm text-white">
                    Manage Users
                  </span>

                  <span className="block text-xs text-zinc-500">
                    View and manage users
                  </span>
                </span>
              </span>

              <ArrowRight
                size={15}
                className="text-zinc-600"
              />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/admin/brands")}
              className="h-auto justify-between border-zinc-800 bg-zinc-950 px-4 py-4 text-left hover:bg-zinc-900"
            >
              <span className="flex items-center gap-3">
                <Buildings
                  size={18}
                  weight="duotone"
                  className="text-zinc-400"
                />

                <span>
                  <span className="block text-sm text-white">
                    Manage Brands
                  </span>

                  <span className="block text-xs text-zinc-500">
                    Review brand accounts
                  </span>
                </span>
              </span>

              <ArrowRight
                size={15}
                className="text-zinc-600"
              />
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                navigate("/admin/moderation")
              }
              className="h-auto justify-between border-zinc-800 bg-zinc-950 px-4 py-4 text-left hover:bg-zinc-900"
            >
              <span className="flex items-center gap-3">
                <Flag
                  size={18}
                  weight="duotone"
                  className="text-zinc-400"
                />

                <span>
                  <span className="block text-sm text-white">
                    Moderation
                  </span>

                  <span className="block text-xs text-zinc-500">
                    Review reported content
                  </span>
                </span>
              </span>

              <ArrowRight
                size={15}
                className="text-zinc-600"
              />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/admin/verifications")}
              className="h-auto justify-between border-zinc-800 bg-zinc-950 px-4 py-4 text-left hover:bg-zinc-900"
            >
              <span className="flex items-center gap-3">
                <ShieldCheck
                  size={18}
                  weight="duotone"
                  className="text-zinc-400"
                />

                <span>
                  <span className="block text-sm text-white">
                    Verifications
                  </span>

                  <span className="block text-xs text-zinc-500">
                    Review pending requests
                  </span>
                </span>
              </span>

              <ArrowRight
                size={15}
                className="text-zinc-600"
              />
            </Button>

          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboardPage;

