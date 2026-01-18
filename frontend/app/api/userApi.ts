// src/services/api/userApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * ─────────────────────────────────────────────────────────────
 * Types aligned with backend UserRow & controller responses
 * ─────────────────────────────────────────────────────────────
 */

// src/services/api/userApi.ts

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  email_verified: boolean;

  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';

  // Make role optional — it's enriched only on /me or admin endpoints
  role?: {
    id: string;
    name: string;
    hierarchy_level?: number;
  };

  profile: Record<string, any>;

  avatar_url?: string | null;
  banner_url?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;

  last_login_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UpdateProfileRequest {
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  profile?: Record<string, any>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UploadAvatarResponse {
  message: string;
  avatar_url: string;
}

export interface UserListResponse {
  users: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface UserViolationResponse {
  id: string;
  violation_type: string;
  description: string | null;
  entity_type: string | null;
  entity_id: string | null;
  status: string;
  strike_issued: boolean;
  reported_by: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface UserViolationsResponse {
  user: {
    id: string;
    username: string;
  };
  violations: UserViolationResponse[];
  total: number;
}

export interface AllViolationsResponse {
  violations: Array<{
    id: string;
    target: {
      id: string;
      username: string;
    };
    reported_by: {
      id: string;
      username: string;
    } | null;
    violation_type: string;
    description: string | null;
    entity_type: string | null;
    entity_id: string | null;
    status: string;
    strike_issued: boolean;
    resolved_by: string | null;
    resolved_at: string | null;
    created_at: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ─────────────────────────────────────────────────────────────

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/users',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['CurrentUser', 'UserList', 'UserViolations'],

  endpoints: (builder) => ({
    // GET /users/me
    getCurrentUser: builder.query<UserProfile, void>({
      query: () => '/me',
      providesTags: ['CurrentUser'],
    }),

    // PATCH /users/me
    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: (body) => ({
        url: '/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    // PATCH /users/me/password
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (body) => ({
        url: '/me/password',
        method: 'PATCH',
        body,
      }),
    }),

    // POST /users/me/avatar
    uploadAvatar: builder.mutation<UploadAvatarResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return {
          url: '/me/avatar',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['CurrentUser'],
    }),

    // DELETE /users/me/avatar
    removeAvatar: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/me/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    // GET /users/all → Admin: List all users
    getAllUsers: builder.query<
      UserListResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        sort?: string;
        order?: 'asc' | 'desc';
      }
    >({
      query: (params) => ({
        url: '/all',
        params,
      }),
      providesTags: ['UserList'],
    }),

    // GET /users/:id → Admin: Get user by ID
    getUserById: builder.query<UserProfile, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'CurrentUser', id }],
    }),

    // PATCH /users/:id/status → Admin: Update user status
    updateUserStatus: builder.mutation<
      { message: string; user: { id: string; username: string; status: string } },
      { userId: string; status: UserProfile['status'] }
    >({
      query: ({ userId, status }) => ({
        url: `/${userId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['UserList', 'CurrentUser'],
    }),

    // GET /users/:id/violations → Admin: Get violations for a user
    getUserViolations: builder.query<UserViolationsResponse, string>({
      query: (userId) => `/${userId}/violations`,
      providesTags: (result, error, userId) => [
        'UserViolations',
        { type: 'UserViolations', id: userId },
      ],
    }),

    // GET /users/violations → Admin: Global violations list
    getAllViolations: builder.query<
      AllViolationsResponse,
      {
        page?: number;
        limit?: number;
        status?: 'open' | 'resolved' | 'all';
        user_id?: string;
      }
    >({
      query: (params) => ({
        url: '/violations',
        params,
      }),
      providesTags: ['UserViolations'],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,

  // Admin endpoints
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useGetUserViolationsQuery,
  useGetAllViolationsQuery,
} = userApi;

export default userApi;
