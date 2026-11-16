// src/services/api/ordersApi.js

import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../baseQuery';
import { API_BASE_URL } from '..';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',

  baseQuery: createBaseQuery(''),

  tagTypes: ['MyOrders', 'Order', 'MyLicenses', 'License'],

  endpoints: builder => ({
    // POST /orders
    createOrder: builder.mutation({
      query: body => ({
        url: '/orders',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['MyOrders'],
    }),

    // POST /orders/:id/confirm
    confirmOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/orders/${id}/confirm`,
        method: 'POST',
        body,
      }),

      invalidatesTags: (result, error, { id }) => [
        'MyOrders',
        { type: 'Order', id },
        'MyLicenses',
      ],
    }),

    // GET /orders/me
    getMyOrders: builder.query({
      query: () => '/orders/me',

      providesTags: ['MyOrders'],
    }),

    // GET /orders/:id
    getOrderById: builder.query({
      query: id => `/orders/${id}`,

      providesTags: (result, error, id) => [
        {
          type: 'Order',
          id,
        },
      ],
    }),

    // GET /licenses/me
    getMyLicenses: builder.query({
      query: () => '/licenses/me',

      providesTags: ['MyLicenses'],
    }),

    // GET /licenses/:id
    getLicenseById: builder.query({
      query: id => `/licenses/${id}`,

      providesTags: (result, error, id) => [
        {
          type: 'License',
          id,
        },
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useConfirmOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,

  useGetMyLicensesQuery,
  useGetLicenseByIdQuery,

  useLazyGetMyOrdersQuery,
  useLazyGetMyLicensesQuery,
} = ordersApi;

export default ordersApi;
