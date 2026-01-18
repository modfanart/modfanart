// src/services/api/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

// ────────────────────────────────────────────────
// Full User shape aligned with UserRow from src/db/types.js
// ────────────────────────────────────────────────
export interface User {
  id: string; // UUID
  username: string;
  email: string; // citext
  email_verified: boolean;
  role_id: string; // UUID reference to roles
  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';
  profile: Record<string, any>; // JSONB
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  payout_method: { type: 'stripe' | 'upi'; [key: string]: any } | null;
  stripe_connect_id: string | null;
  last_login_at: string | null; // ISO timestamptz
  created_at: string; // ISO
  updated_at: string; // ISO
  deleted_at: string | null; // soft delete
}

// ────────────────────────────────────────────────
// Request / Response shapes
// ────────────────────────────────────────────────
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  // Optional fields depending on your signup flow
  referral_key?: string; // if using signup_key_used
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token?: string; // if sent in body (less common now)
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refresh_token?: string; // if using separate refresh tokens
  user: User;
  expires_in?: number; // seconds — optional
}

// Common success shape for non-token endpoints
interface ApiMessageResponse {
  success: boolean;
  message: string;
}

// ────────────────────────────────────────────────
// Base query with automatic token attachment + re-auth logic
// ────────────────────────────────────────────────
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api/auth',
  credentials: 'include', // important for refresh cookies if using httpOnly refresh tokens
  prepareHeaders: (headers, { getState }) => {
    // Support different slice shapes
    const token =
      (getState() as any)?.auth?.accessToken ?? (getState() as any)?.auth?.token ?? null;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Automatic 401 → refresh → retry logic (very common pattern)
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt refresh
    const refreshResult = await rawBaseQuery(
      { url: '/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Assume your auth slice has a setCredentials / setTokens action
      api.dispatch({
        type: 'auth/setTokens',
        payload: refreshResult.data, // { access_token, refresh_token?, user?, ... }
      });

      // Retry original request with new token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Refresh failed → logout
      api.dispatch({ type: 'auth/logout' });
      // Optional: redirect to login page via custom middleware or listener
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CurrentUser'],

  endpoints: (builder) => ({
    // POST /api/auth/register
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: '/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    // POST /api/auth/login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    // POST /api/auth/logout
    logout: builder.mutation<ApiMessageResponse, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    // POST /api/auth/refresh
    refreshToken: builder.mutation<{ access_token: string; refresh_token?: string }, void>({
      query: () => ({
        url: '/refresh',
        method: 'POST',
      }),
    }),

    // POST /api/auth/forgot-password
    forgotPassword: builder.mutation<ApiMessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    // POST /api/auth/reset-password
    resetPassword: builder.mutation<ApiMessageResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: '/reset-password',
        method: 'POST',
        body,
      }),
    }),

    // Usually GET /api/auth/verify-email?token=xxx
    // but many APIs now use POST for security (CSRF protection)
    verifyEmail: builder.mutation<ApiMessageResponse, { token: string }>({
      query: ({ token }) => ({
        url: '/verify-email',
        method: 'POST',
        body: { token },
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    // Optional: resend verification email
    resendVerificationEmail: builder.mutation<ApiMessageResponse, void>({
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
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
} = authApi;

export default authApi;
