// src/services/api/contactApi.js

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';
import { API_BASE_URL } from "..";

export const contactApi = createApi({
  reducerPath: "contactApi",

  baseQuery: createBaseQuery(''),

  tagTypes: ["Contact"],

  endpoints: (builder) => ({
    // POST /contact
    sendMessage: builder.mutation({
      query: (body) => ({
        url: "/contact",
        method: "POST",
        body,
      }),
    }),

    // GET /contact
    getMessages: builder.query({
      query: () => "/contact",

      providesTags: ["Contact"],
    }),

    // PATCH /contact/:id/read
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}/read`,
        method: "PATCH",
      }),

      invalidatesTags: ["Contact"],
    }),

    // DELETE /contact/:id
    deleteMessage: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Contact"],
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
