// src/services/api/notifyApi.js

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';
import { API_BASE_URL } from '..';

export const notifyApi = createApi({
  reducerPath: 'notifyApi',

  baseQuery: createBaseQuery('/notifications'),

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