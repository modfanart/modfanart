// src/services/api/authApi.js

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';

import { setCredentials, logout } from './features/authSlice';

import { firebaseAuth } from '../../lib/firebase';

import { API_BASE_URL } from '..';

// Token refresh / retry lives in the shared base query now (it used to be
// implemented only here, so every other slice broke after an hour).
const baseQuery = createBaseQuery('/auth', { credentials: 'include' });

const authApi = createApi({
  reducerPath: 'authApi',

  baseQuery,

  tagTypes: ['CurrentUser'],

  endpoints: builder => ({
    // ========================================
    // PLATFORM AUTH
    // ========================================

    register: builder.mutation({
      query: body => ({
        url: '/register',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['CurrentUser'],
    }),

    // Existing platform/Firebase login.
    login: builder.mutation({
      query: body => ({
        url: '/login',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['CurrentUser'],
    }),

    // ========================================
    // WORKSPACE AUTH
    // ========================================

    // Internal workspace email/password login.
    //
    // POST /api/auth/workspace/login
    //
    // This does NOT contact Firebase.
    workspaceLogin: builder.mutation({
      query: body => ({
        url: '/workspace/login',
        method: 'POST',
        body,
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          const { user, accessToken, refreshToken } = data;

          if (!accessToken || !refreshToken) {
            throw new Error(
              'Workspace login response is missing authentication tokens'
            );
          }

          // Store workspace tokens.
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('authType', 'workspace');

          // Update Redux authentication state.
          dispatch(
            setCredentials({
              user,
              accessToken,
            })
          );
        } catch (error) {
          console.error('[Workspace Auth] Login failed:', error);
        }
      },

      invalidatesTags: ['CurrentUser'],
    }),

    // Refresh the workspace access token using the stored
    // refresh token. Called internally by baseQueryWithReauth,
    // but exported in case a caller wants to trigger it manually.
    workspaceRefresh: builder.mutation({
      query: body => ({
        url: '/workspace/refresh',
        method: 'POST',
        body,
      }),
    }),

    // ========================================
    // LOGOUT
    // ========================================

    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),

      invalidatesTags: ['CurrentUser'],

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('authType');

          dispatch(logout());
        }
      },
    }),
    sync: builder.mutation({
      query: ({ idToken, ...options }) => ({
        url: '/sync',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: options,
      }),
    }),
    // ========================================
    // PASSWORD / ACCOUNT ACTIONS
    // ========================================

    forgotPassword: builder.mutation({
      query: body => ({
        url: '/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation({
      query: body => ({
        url: '/reset-password',
        method: 'POST',
        body,
      }),
    }),

    verifyEmail: builder.mutation({
      query: ({ token }) => ({
        url: '/verify-email',
        method: 'POST',
        body: { token },
      }),

      invalidatesTags: ['CurrentUser'],
    }),

    resendVerificationEmail: builder.mutation({
      query: () => ({
        url: '/verify-email/resend',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useWorkspaceLoginMutation,
  useWorkspaceRefreshMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useSyncMutation,
  useResendVerificationEmailMutation,
} = authApi;

export default authApi;
