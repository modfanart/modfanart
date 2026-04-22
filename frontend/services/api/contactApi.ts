// src/services/api/contactApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}
export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Contact'],
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: (body) => ({
        url: '/contact',
        method: 'POST',
        body,
      }),
    }),

    getMessages: builder.query<ContactMessage[], void>({
      query: () => '/contact',
      providesTags: ['Contact'],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Contact'],
    }),

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
