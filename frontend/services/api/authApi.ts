import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

export interface SyncedUser {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  status: string;
  role: string;
  permissions?: Record<string, any>;
  brands?: any[];
}

export interface SyncResponse {
  user: SyncedUser;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/auth` }),
  tagTypes: ['CurrentUser'],

  endpoints: (builder) => ({
    // Called after every Firebase sign-in to sync user into our DB.
    // Pass the Firebase ID token explicitly — Redux doesn't have it yet at this point.
    syncUser: builder.mutation<SyncResponse, { idToken: string; username?: string; accountType?: string }>({
      query: ({ idToken, username, accountType }) => ({
        url: '/sync',
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: { username, accountType },
      }),
      invalidatesTags: ['CurrentUser'],
    }),
  }),
});

export const { useSyncUserMutation } = authApi;
export default authApi;
