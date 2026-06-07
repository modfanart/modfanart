// src/services/api/adminApi.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

export const adminApi = createApi({
  reducerPath: 'adminApi',

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,

 prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
  }),

  tagTypes: [
    'PlatformStats',
    'UsersList',
    'UserDetail',
    'PendingVerifications',
    'ModerationQueue',
  ],

  endpoints: (builder) => ({
    // ─────────────────────────────────────
    // Platform Stats
    // ─────────────────────────────────────
    getPlatformStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['PlatformStats'],
    }),

    // ─────────────────────────────────────
    // Users
    // ─────────────────────────────────────
    getAdminUsers: builder.query({
      query: (params = {}) => ({
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
              ...result.data.map(({ id }) => ({
                type: 'UserDetail',
                id,
              })),
              { type: 'UsersList', id: 'LIST' },
            ]
          : [{ type: 'UsersList', id: 'LIST' }],
    }),

    updateUserStatus: builder.mutation({
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

    deleteUser: builder.mutation({
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

    // ─────────────────────────────────────
    // Brand Verification
    // ─────────────────────────────────────
    getPendingBrandVerifications: builder.query({
      query: ({ limit = 10 } = {}) => ({
        url: '/admin/brands/pending-verification',
        params: { limit },
      }),

      providesTags: ['PendingVerifications'],
    }),

    verifyBrand: builder.mutation({
      query: ({ brandId, action, notes }) => ({
        url: `/admin/brands/${brandId}/verify`,
        method: 'PATCH',
        body: {
          action,
          notes,
        },
      }),

      invalidatesTags: ['PendingVerifications', 'PlatformStats'],
    }),

    // ─────────────────────────────────────
    // Moderation Queue
    // ─────────────────────────────────────
    getModerationQueue: builder.query({
      query: (params = {}) => ({
        url: '/admin/moderation/queue',
        params: {
          entity_type: params.entity_type,
          limit: params.limit ?? 20,
          page: params.page ?? 1,
        },
      }),

      providesTags: ['ModerationQueue'],
    }),
  }),
});

// ─────────────────────────────────────
// Hooks
// ─────────────────────────────────────

export const {
  useGetPlatformStatsQuery,
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetPendingBrandVerificationsQuery,
  useVerifyBrandMutation,
  useGetModerationQueueQuery,
} = adminApi;