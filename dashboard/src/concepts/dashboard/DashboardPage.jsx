import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Users,
  ShieldCheck,
  Warning,
  TrendUp,
  ArrowRight,
  Eye,
} from "@phosphor-icons/react";

import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/button";

import {
  useGetPlatformStatsQuery,
  useGetPendingBrandVerificationsQuery,
  useGetModerationQueueQuery,
  useGetAdminUsersQuery,
} from "../../services/api/adminApi";

// ─────────────────────────────
// Color map (FIXED Tailwind issue)
// ─────────────────────────────
const colorMap = {
  white: "text-white bg-white/10",
  "yellow-500": "text-yellow-500 bg-yellow-500/10",
  "red-500": "text-red-500 bg-red-500/10",
};

// ─────────────────────────────
// Stat Card
// ─────────────────────────────
const StatCard = ({ title, value, icon: Icon, color = "white" }) => {
  const c = colorMap[color] || colorMap.white;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
        </div>

        <div className={`w-10 h-10 rounded-md ${c} flex items-center justify-center`}>
          <Icon className="w-5 h-5" weight="duotone" />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────
// Main Dashboard
// ─────────────────────────────
const AdminDashboardPage = () => {
  const navigate = useNavigate();

  // ───── Queries ─────
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetPlatformStatsQuery();

  const { data: verifications } = useGetPendingBrandVerificationsQuery({
    limit: 5,
  });

  const { data: moderation } = useGetModerationQueueQuery({
    limit: 5,
  });

  const { data: users } = useGetAdminUsersQuery({
    limit: 5,
    page: 1,
  });

  if (statsError) {
    toast.error("Failed to load admin dashboard");
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ───── FIX: correct API structure ─────
  const statsData = stats?.data || {};

  return (
    <div className="min-h-screen">
      <Header
        title="Admin Dashboard"
        subtitle="Platform overview & moderation control"
      />

      <div className="p-6 space-y-6">

        {/* ───────── Stats ───────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={statsData.totalUsers || 0}
            icon={Users}
            color="white"
          />

          <StatCard
            title="Active Brands"
            value={statsData.activeBrands || 0}
            icon={TrendUp}
            color="white"
          />

          <StatCard
            title="Pending Approvals"
            value={statsData.pendingApprovals || 0}
            icon={ShieldCheck}
            color="yellow-500"
          />

          <StatCard
            title="Reported Items"
            value={statsData.reportedItems || 0}
            icon={Warning}
            color="red-500"
          />
        </div>

        {/* ───────── Panels ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Brand Verifications */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">
                Brand Verifications
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/brands")}
                className="text-zinc-400"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {verifications?.data?.length ? (
                verifications.data.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-md"
                  >
                    <p className="text-sm text-white">
                      {item.company_name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.verification_status}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">
                  No pending verifications
                </p>
              )}
            </div>
          </div>

          {/* Moderation Queue */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">
                Moderation Queue
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/moderation")}
                className="text-zinc-400"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {moderation?.data?.length ? (
                moderation.data.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-md"
                  >
                    <p className="text-sm text-white">
                      {item.entity_type}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Status: {item.status}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">
                  No moderation items
                </p>
              )}
            </div>
          </div>

          {/* Users */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">
                Recent Users
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/users")}
                className="text-zinc-400"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {users?.data?.length ? (
                users.data.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-md"
                  >
                    <div>
                      <p className="text-sm text-white">
                        {user.username}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {user.email}
                      </p>
                    </div>


                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">
                  No users found
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;