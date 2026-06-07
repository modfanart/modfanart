// src/services/api/contactApi.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

export const contactApi = createApi({
  reducerPath: 'contactApi',

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
     prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
  }),

  tagTypes: ['Contact'],

  endpoints: (builder) => ({
    // POST /contact
    sendMessage: builder.mutation({
      query: (body) => ({
        url: '/contact',
        method: 'POST',
        body,
      }),
    }),

    // GET /contact
    getMessages: builder.query({
      query: () => '/contact',

      providesTags: ['Contact'],
    }),

    // PATCH /contact/:id/read
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}/read`,
        method: 'PATCH',
      }),

      invalidatesTags: ['Contact'],
    }),

    // DELETE /contact/:id
    deleteMessage: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['Contact'],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetMessagesQuery,
  useMarkAsReadMutation,
  useDeleteMessageMutation,
} = contactApi;

export default contactApi;