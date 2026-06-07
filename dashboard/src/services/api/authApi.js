// src/services/api/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '@/services/api/features/authSlice';
import { API_BASE_URL } from '..';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/auth`,
  credentials: 'include',

  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && (result.error.status === 401 || result.error.originalStatus === 401)) {
    console.warn('[RTK Query] 401 detected — attempting refresh');

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await rawBaseQuery(
      { url: '/refresh', method: 'POST', body: { refreshToken } },
      api,
      extraOptions
    );

    if (refreshResult.data?.accessToken) {
      const { accessToken } = refreshResult.data;
      api.dispatch(setCredentials({ accessToken, user: api.getState()?.auth?.user ?? null }));
      localStorage.setItem('accessToken', accessToken);

      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      console.error('[RTK Query] Refresh failed');
      api.dispatch(logout());
      localStorage.clear(); // safer
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CurrentUser'],

  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/register', method: 'POST', body }),
      invalidatesTags: ['CurrentUser'],
    }),

 // In login mutation - remove onQueryStarted or keep minimal
login: builder.mutation({
  query: (body) => ({ 
    url: '/login', 
    method: 'POST', 
    body 
  }),
  invalidatesTags: ['CurrentUser'],
  // Remove onQueryStarted - we're handling it in AuthContext
}),

    logout: builder.mutation({
      query: () => ({ url: '/logout', method: 'POST' }),
      invalidatesTags: ['CurrentUser'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          dispatch(logout());
        }
      },
    }),

    // Other endpoints...
    forgotPassword: builder.mutation({
      query: (body) => ({ url: '/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: '/reset-password', method: 'POST', body }),
    }),
    verifyEmail: builder.mutation({
      query: ({ token }) => ({ url: '/verify-email', method: 'POST', body: { token } }),
      invalidatesTags: ['CurrentUser'],
    }),
    resendVerificationEmail: builder.mutation({
      query: () => ({ url: '/verify-email/resend', method: 'POST' }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
} = authApi;

export default authApi;