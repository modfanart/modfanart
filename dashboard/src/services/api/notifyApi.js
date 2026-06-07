// src/services/api/notifyApi.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

export const notifyApi = createApi({
  reducerPath: 'notifyApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/notifications`,

 prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
  }),

  tagTypes: ['Notifications', 'UnreadCount'],

  endpoints: (builder) => ({
    // GET /notifications
    getNotifications: builder.query({
      query: (params = {}) => {
        const {
          limit = 30,
          offset = 0,
          unreadOnly = false,
        } = params;

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

    // GET /notifications/unread-count
    getUnreadCount: builder.query({
      query: () => '/unread-count',

      providesTags: ['UnreadCount'],
    }),

    // PATCH /notifications/:id/read
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/${id}/read`,
        method: 'PATCH',
      }),

      invalidatesTags: [
        'Notifications',
        'UnreadCount',
      ],
    }),

    // PATCH /notifications/read-all
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/read-all',
        method: 'PATCH',
      }),

      invalidatesTags: [
        'Notifications',
        'UnreadCount',
      ],
    }),

    // DELETE /notifications/:id
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),

      invalidatesTags: [
        'Notifications',
        'UnreadCount',
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useLazyGetNotificationsQuery,
} = notifyApi;

export default notifyApi;