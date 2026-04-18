import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * ─────────────────────────────────────────────────────────────
 * Types aligned with backend UserRow & controller responses
 * ─────────────────────────────────────────────────────────────
 */

export interface UserStats {
  artworks_count: number;
  followers_count: number;
  following_count: number;
  likes_received: number;
  views_received: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  email_verified?: boolean;

  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';

  role?: {
    id: string;
    name: string;
    slug?: string;
    hierarchy_level?: number;
  };

  profile: {
    twitter?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
    [key: string]: any;
  };

  brands?: any[];

  avatar_url?: string | null;
  banner_url?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;

  last_login_at?: string | null;
  created_at: string;
  updated_at?: string | null;

  stats?: UserStats;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: string;

  bio?: string | null;
  location?: string | null;
  website?: string | null;

  avatar_url?: string | null;
  banner_url?: string | null;

  profile?: {
    twitter?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
  };
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

// NEW: Response type for getUsersByRoleSlug
export interface UsersByRoleResponse extends UserListResponse {
  // Same structure as UserListResponse, but we keep it explicit
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

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface UserBrandsResponse {
  success: boolean;
  brands: Brand[];
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
    target: { id: string; username: string };
    reported_by: { id: string; username: string } | null;
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

export interface CurrentUserResponse {
  success: boolean;
  user: UserProfile;
}

// ─────────────────────────────────────────────────────────────

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/users',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const tokenFromState = state?.auth?.accessToken;

      if (tokenFromState) {
        headers.set('Authorization', `Bearer ${tokenFromState}`);
      }

      return headers;
    },
  }),

  tagTypes: ['CurrentUser', 'UserList', 'UserViolations', 'PublicProfile', 'UsersByRole'],

  endpoints: (builder) => ({
    // GET /users/me
    getCurrentUser: builder.query<CurrentUserResponse, void>({
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

    getUserByUsername: builder.query<UserProfile, string>({
      query: (username) => `/by-username/${username}`,
      providesTags: (result, error, username) => [
        { type: 'PublicProfile', id: username.toLowerCase() },
      ],
      transformResponse: (response: { success: boolean; user: UserProfile }): UserProfile => {
        if (!response?.success || !response?.user) {
          throw new Error('Invalid profile response from server');
        }
        return response.user;
      },
      extraOptions: {
        refetchOnMountOrArgChange: true,
      },
    }),

    // PATCH /users/me/password
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (body) => ({
        url: '/me/password',
        method: 'PATCH',
        body,
      }),
    }),

    createUser: builder.mutation<{ message: string; user: UserProfile }, CreateUserRequest>({
      query: (body) => ({
        url: '/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UserList'],
    }),

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

    // NEW: GET /users/by-role/:roleSlug
    getUsersByRoleSlug: builder.query<
      UsersByRoleResponse,
      {
        roleSlug: string;
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
      }
    >({
      query: ({ roleSlug, ...params }) => ({
        url: `/by-role/${roleSlug}`,
        params,
      }),
      providesTags: (result, error, { roleSlug }) => [
        { type: 'UsersByRole', id: roleSlug },
        'UserList',
      ],
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

    deleteUser: builder.mutation<{ message: string }, { userId: string }>({
      query: ({ userId }) => ({
        url: `/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserList'],
    }),

    // GET /users/:id/violations
    getUserViolations: builder.query<UserViolationsResponse, string>({
      query: (userId) => `/${userId}/violations`,
      providesTags: (result, error, userId) => [
        'UserViolations',
        { type: 'UserViolations', id: userId },
      ],
    }),

    // GET /users/me/brands
    getMyBrands: builder.query<UserBrandsResponse, void>({
      query: () => '/me/brands',
      providesTags: ['CurrentUser'],
    }),
    updateUser: builder.mutation<
      { message: string; user: UserProfile },
      {
        userId: string;
        bio?: string | null;
        location?: string | null;
        website?: string | null;
        status?: UserProfile['status'];
        role_id?: string;
        profile?: Record<string, any>;
      }
    >({
      query: ({ userId, ...body }) => ({
        url: `/${userId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['UserList', 'CurrentUser'],
    }),
    // GET /users/violations → Global violations
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
  useGetUserByUsernameQuery,
  useGetMyBrandsQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  // Admin endpoints
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useGetUserViolationsQuery,
  useGetAllViolationsQuery,

  // NEW HOOK
  useGetUsersByRoleSlugQuery,
} = userApi;

export default userApi;
