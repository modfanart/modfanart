// src/services/api/authApi.js
<<<<<<< HEAD

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { setCredentials, logout } from './features/authSlice';

import { API_BASE_URL } from '..';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/auth`,

  credentials: 'include',

  prepareHeaders: headers => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

=======
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "./features/authSlice";
import { API_BASE_URL } from "..";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/auth`,
  credentials: "include",

  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) headers.set("Authorization", `Bearer ${token}`);
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error &&
    (result.error.status === 401 || result.error.originalStatus === 401)
  ) {
<<<<<<< HEAD
    console.warn('[RTK Query] 401 detected — attempting refresh');

    const refreshToken = localStorage.getItem('refreshToken');

=======
    console.warn("[RTK Query] 401 detected — attempting refresh");

    const refreshToken = localStorage.getItem("refreshToken");
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await rawBaseQuery(
<<<<<<< HEAD
      {
        url: '/refresh',
        method: 'POST',
        body: { refreshToken },
      },
=======
      { url: "/refresh", method: "POST", body: { refreshToken } },
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
      api,
      extraOptions
    );

    if (refreshResult.data?.accessToken) {
      const { accessToken } = refreshResult.data;
<<<<<<< HEAD

      localStorage.setItem('accessToken', accessToken);

=======
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
      api.dispatch(
        setCredentials({
          accessToken,
          user: api.getState()?.auth?.user ?? null,
        })
      );
<<<<<<< HEAD

      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      console.error('[RTK Query] Refresh failed');

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      api.dispatch(logout());
=======
      localStorage.setItem("accessToken", accessToken);

      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      console.error("[RTK Query] Refresh failed");
      api.dispatch(logout());
      localStorage.clear(); // safer
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
    }
  }

  return result;
};

export const authApi = createApi({
<<<<<<< HEAD
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

    // ========================================
    // LOGOUT
    // ========================================

    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),

      invalidatesTags: ['CurrentUser'],

=======
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CurrentUser"],

  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: "/register", method: "POST", body }),
      invalidatesTags: ["CurrentUser"],
    }),

    // In login mutation - remove onQueryStarted or keep minimal
    login: builder.mutation({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentUser"],
      // Remove onQueryStarted - we're handling it in AuthContext
    }),

    logout: builder.mutation({
      query: () => ({ url: "/logout", method: "POST" }),
      invalidatesTags: ["CurrentUser"],
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
<<<<<<< HEAD
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

=======
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
          dispatch(logout());
        }
      },
    }),

<<<<<<< HEAD
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
=======
    // Other endpoints...
    forgotPassword: builder.mutation({
      query: (body) => ({ url: "/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: "/reset-password", method: "POST", body }),
    }),
    verifyEmail: builder.mutation({
      query: ({ token }) => ({
        url: "/verify-email",
        method: "POST",
        body: { token },
      }),
      invalidatesTags: ["CurrentUser"],
    }),
    resendVerificationEmail: builder.mutation({
      query: () => ({ url: "/verify-email/resend", method: "POST" }),
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
<<<<<<< HEAD
  useWorkspaceLoginMutation,
=======
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
} = authApi;

export default authApi;
