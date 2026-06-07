// src/services/api/userApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/users`,
 prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
  }),

  tagTypes: ['CurrentUser', 'UserList', 'UserViolations', 'PublicProfile', 'UsersByRole'],

  endpoints: (builder) => ({
    // GET /users/me
getCurrentUser: builder.query({
  query: () => '/me',
  providesTags: ['CurrentUser'],
  transformResponse: (response) => response?.user || response, // Normalize here
}),

    // PATCH /users/me
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    getUserByUsername: builder.query({
      query: (username) => `/by-username/${username}`,
      providesTags: (result, error, username) => [
        { type: 'PublicProfile', id: username.toLowerCase() },
      ],
      transformResponse: (response) => {
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
    changePassword: builder.mutation({
      query: (body) => ({
        url: '/me/password',
        method: 'PATCH',
        body,
      }),
    }),

    createUser: builder.mutation({
      query: (body) => ({
        url: '/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UserList'],
    }),

    uploadAvatar: builder.mutation({
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

    removeAvatar: builder.mutation({
      query: () => ({
        url: '/me/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    // GET /users/all → Admin: List all users
    getAllUsers: builder.query({
      query: (params) => ({
        url: '/all',
        params,
      }),
      providesTags: ['UserList'],
    }),

    // GET /users/by-role/:roleSlug
    getUsersByRoleSlug: builder.query({
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
    getUserById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'CurrentUser', id }],
    }),

    // PATCH /users/:id/status → Admin: Update user status
    updateUserStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: `/${userId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['UserList', 'CurrentUser'],
    }),

    deleteUser: builder.mutation({
      query: ({ userId }) => ({
        url: `/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserList'],
    }),

    // GET /users/:id/violations
    getUserViolations: builder.query({
      query: (userId) => `/${userId}/violations`,
      providesTags: (result, error, userId) => [
        'UserViolations',
        { type: 'UserViolations', id: userId },
      ],
    }),

    // GET /users/me/brands
    getMyBrands: builder.query({
      query: () => '/me/brands',
      providesTags: ['CurrentUser'],
    }),

    updateUser: builder.mutation({
      query: ({ userId, ...body }) => ({
        url: `/${userId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['UserList', 'CurrentUser'],
    }),

    // GET /users/violations → Global violations
    getAllViolations: builder.query({
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