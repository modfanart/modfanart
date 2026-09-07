// src/services/api/authApi.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { setCredentials, logout } from './features/authSlice';

import { firebaseAuth } from '../../lib/firebase';

import { API_BASE_URL } from '..';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/auth`,

  credentials: 'include',

  prepareHeaders: headers => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

// ============================================================
// REAUTH
//
// There are two independent auth systems sharing the same
// `accessToken` localStorage key:
//
//   - "firebase"  -> refreshed via the Firebase SDK
//                    (credential.user.getIdToken(true))
//   - "workspace" -> refreshed via our own
//                    POST /auth/workspace/refresh endpoint
//                    using the stored refreshToken
//
// `authType` is set at login time (see AuthContext.jsx /
// workspaceLogin) so we know which path to take on a 401.
// ============================================================

const refreshFirebaseToken = async () => {
  const currentUser = firebaseAuth.currentUser;

  if (!currentUser) {
    return null;
  }

  try {
    // Force refresh — this is what was missing before. Without
    // `true` here, getIdToken() just returns the cached
    // (possibly expired) token and the request 401s again.
    const freshIdToken = await currentUser.getIdToken(true);

    localStorage.setItem('accessToken', freshIdToken);

    return freshIdToken;
  } catch (err) {
    console.error('[RTK Query] Firebase token refresh failed:', err);
    return null;
  }
};

const refreshWorkspaceToken = async (api, extraOptions) => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return null;
  }

  const refreshResult = await rawBaseQuery(
    {
      url: '/workspace/refresh',
      method: 'POST',
      body: { refreshToken },
    },
    api,
    extraOptions
  );

  const newAccessToken = refreshResult.data?.accessToken;
  const newRefreshToken = refreshResult.data?.refreshToken;

  if (!newAccessToken) {
    return null;
  }

  localStorage.setItem('accessToken', newAccessToken);

  // Refresh tokens are rotated server-side — store the new one.
  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  }

  api.dispatch(
    setCredentials({
      accessToken: newAccessToken,
      user: api.getState()?.auth?.user ?? null,
    })
  );

  return newAccessToken;
};

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error &&
    (result.error.status === 401 || result.error.originalStatus === 401)
  ) {
    console.warn('[RTK Query] 401 detected — attempting refresh');

    const authType = localStorage.getItem('authType');

    let newAccessToken = null;

    if (authType === 'firebase') {
      newAccessToken = await refreshFirebaseToken();
    } else if (authType === 'workspace') {
      newAccessToken = await refreshWorkspaceToken(api, extraOptions);
    } else {
      // authType wasn't set (e.g. stale session from before this
      // fix shipped) — try Firebase first since currentUser will
      // simply be null if it isn't a Firebase session, then fall
      // back to a workspace refresh.
      newAccessToken =
        (await refreshFirebaseToken()) ||
        (await refreshWorkspaceToken(api, extraOptions));
    }

    if (newAccessToken) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      console.error('[RTK Query] Refresh failed — logging out');

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authType');

      api.dispatch(logout());
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',

  baseQuery: baseQueryWithReauth,

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
