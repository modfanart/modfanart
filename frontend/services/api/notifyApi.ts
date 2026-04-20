import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body?: string | null;
  data?: Record<string, any> | null;
  read_at?: string | null;
  created_at: string;
  deleted_at?: string | null;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  pagination?: {
    limit: number;
    offset: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

export const notifyApi = createApi({
  reducerPath: 'notifyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/notifications',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['Notifications', 'UnreadCount'],

  endpoints: (builder) => ({
    // GET /api/notifications - Get all notifications
    getNotifications: builder.query<
      NotificationsResponse,
      { limit?: number; offset?: number; unreadOnly?: boolean } | undefined
    >({
      query: (params) => {
        const { limit = 30, offset = 0, unreadOnly = false } = params || {};

        return {
          url: '/',
          params: {
            limit,
            offset,
            unreadOnly,
          },
        };
      },
      providesTags: ['Notifications'],
    }),

    // GET /api/notifications/unread-count
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => '/unread-count',
      providesTags: ['UnreadCount'],
    }),

    // PATCH /api/notifications/:id/read
    markAsRead: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

    // PATCH /api/notifications/read-all
    markAllAsRead: builder.mutation<{ success: boolean; message: string; count: number }, void>({
      query: () => ({
        url: '/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

    // DELETE /api/notifications/:id
    deleteNotification: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  // Lazy versions
  useLazyGetNotificationsQuery,
} = notifyApi;

export default notifyApi;
