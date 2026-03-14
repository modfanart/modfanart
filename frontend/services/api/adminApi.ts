// src/services/api/adminApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store'; // ← import RootState for type safety

// ────────────────────────────────────────────────
// Types (you can move these to a separate types file)
// ────────────────────────────────────────────────

interface PlatformStats {
  totalUsers: number;
  activeBrands: number;
  totalContests: number;
  pendingApprovals: number;
  reportedItems: number;
  activeJudges: number;
}

interface UserAdminListItem {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
  role: string;
}

interface PaginatedUsers {
  data: UserAdminListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface BrandVerificationPending {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  company_name: string;
  verification_status: string;
  created_at: string;
}

interface ModerationQueueItem {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  priority: number;
  assigned_to: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  decision: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────────
// Admin API Definition
// ────────────────────────────────────────────────

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api', // or process.env.NEXT_PUBLIC_API_URL
    prepareHeaders: (headers, { getState }) => {
      // More flexible — support different auth slice shapes
      const token =
        (getState() as any)?.auth?.token ??
        (getState() as any)?.auth?.accessToken ??
        (getState() as any)?.session?.accessToken ??
        null;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['PlatformStats', 'UsersList', 'UserDetail', 'PendingVerifications', 'ModerationQueue'],

  endpoints: (builder) => ({
    // ── Stats ────────────────────────────────────────
    getPlatformStats: builder.query<PlatformStats, void>({
      query: () => '/admin/stats',
      providesTags: ['PlatformStats'],
    }),

    // ── Users ────────────────────────────────────────
    getAdminUsers: builder.query<
      PaginatedUsers,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        role?: string;
        sort?: string;
        order?: 'asc' | 'desc';
      }
    >({
      query: (params) => ({
        url: '/admin/users',
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          search: params.search,
          status: params.status,
          role: params.role,
          sort: params.sort,
          order: params.order ?? 'desc',
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'UserDetail' as const, id })),
              { type: 'UsersList', id: 'LIST' },
            ]
          : [{ type: 'UsersList', id: 'LIST' }],
    }),

    updateUserStatus: builder.mutation<
      { id: string; username: string; email: string; status: string },
      { userId: string; status: string }
    >({
      query: ({ userId, status }) => ({
        url: `/admin/users/${userId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'UserDetail', id: userId },
        { type: 'UsersList', id: 'LIST' },
        'PlatformStats',
      ],
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'UserDetail', id: userId },
        { type: 'UsersList', id: 'LIST' },
        'PlatformStats',
      ],
    }),

    // ── Brand Verifications ──────────────────────────
    getPendingBrandVerifications: builder.query<BrandVerificationPending[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: '/admin/brands/pending-verification',
        params: { limit },
      }),
      providesTags: ['PendingVerifications'],
    }),

    verifyBrand: builder.mutation<
      { message: string },
      { brandId: string; action: 'approve' | 'reject'; notes?: string }
    >({
      query: ({ brandId, action, notes }) => ({
        url: `/admin/brands/${brandId}/verify`,
        method: 'PATCH',
        body: { action, notes },
      }),
      invalidatesTags: ['PendingVerifications', 'PlatformStats'],
    }),

    // ── Moderation Queue ─────────────────────────────
    getModerationQueue: builder.query<
      ModerationQueueItem[],
      {
        entity_type?: string;
        limit?: number;
        page?: number;
      }
    >({
      query: (params) => ({
        url: '/admin/moderation/queue',
        params: {
          entity_type: params.entity_type,
          limit: params.limit ?? 20,
          page: params.page ?? 1,
        },
      }),
      providesTags: ['ModerationQueue'],
    }),

    // You can add more endpoints later, e.g.:
    // approveContestEntry
    // resolveReport
    // assignModerator
    // etc.
  }),
});

// ── Auto-generated hooks ───────────────────────────────────────
export const {
  useGetPlatformStatsQuery,
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetPendingBrandVerificationsQuery,
  useVerifyBrandMutation,
  useGetModerationQueueQuery,
} = adminApi;
