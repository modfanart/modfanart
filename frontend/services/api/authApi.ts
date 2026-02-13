// src/services/api/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { setCredentials, logout } from '@/services/api/features/authSlice'; // ← make sure this import is correct
import type { RootState } from '@/store'; // ← import RootState for type safety

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
  referral_key?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string; // ← note: camelCase to match your Login response
  user: User;
  expires_in?: number;
}
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}
// ────────────────────────────────────────────────
// Base query setup
// ────────────────────────────────────────────────
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api/auth',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState)?.auth?.accessToken;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// ────────────────────────────────────────────────
// Improved re-auth logic – this is the important part
// ────────────────────────────────────────────────
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // Check for 401
  if (result.error && (result.error as any).originalStatus === 401) {
    console.warn('[RTK Query] 401 detected — attempting token refresh');

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      console.warn('[RTK Query] No refresh token found in localStorage → forcing logout');
      api.dispatch(logout());
      localStorage.removeItem('accessToken');
      // Optional: window.location.href = '/login?session=expired';
      return result; // fail the original request
    }

    // Try to refresh
    const refreshResult = await rawBaseQuery(
      {
        url: '/refresh',
        method: 'POST',
        body: { refreshToken }, // ← matches what your backend controller expects
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      console.log('[RTK Query] Refresh successful', refreshResult.data);

      const { accessToken } = refreshResult.data as { accessToken: string };

      // Update redux store with new token (keep existing user)
      api.dispatch(
        setCredentials({
          accessToken,
          user: (api.getState() as RootState).auth.user,
        })
      );

      // Persist the new access token
      localStorage.setItem('accessToken', accessToken);

      // Retry the original request with the new token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      console.error('[RTK Query] Refresh failed', refreshResult.error);
      api.dispatch(logout());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Optional: window.location.href = '/login?session=expired';
    }
  }

  return result;
};

// ────────────────────────────────────────────────
// Create the API
// ────────────────────────────────────────────────
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CurrentUser'],

  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: '/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    // You can keep this endpoint, but we are using raw fetch for refresh in baseQuery
    refreshToken: builder.mutation<{ accessToken: string }, { refreshToken: string }>({
      query: (body) => ({
        url: '/refresh',
        method: 'POST',
        body,
      }),
    }),

    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (body) => ({
        url: '/reset-password',
        method: 'POST',
        body,
      }),
    }),

    verifyEmail: builder.mutation<{ message: string }, { token: string }>({
      query: ({ token }) => ({
        url: '/verify-email',
        method: 'POST',
        body: { token },
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    resendVerificationEmail: builder.mutation<{ message: string }, void>({
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
