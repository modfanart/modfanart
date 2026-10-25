// Orders API — aligned with backend /orders (licenses module)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Order } from '@/types/merch';
import { API_BASE_URL } from '..';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/orders`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Orders', 'Order'],
  endpoints: (builder) => ({
    getMyOrders: builder.query<{ orders: Order[] }, void>({
      query: () => '/me',
      providesTags: (result) =>
        result
          ? [
              ...result.orders.map(({ id }) => ({
                type: 'Orders' as const,
                id,
              })),
              { type: 'Orders', id: 'LIST' },
            ]
          : [{ type: 'Orders', id: 'LIST' }],
    }),

    confirmOrder: builder.mutation<
      { order: Order },
      { id: string; stripe_payment_intent_id?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}/confirm`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Order', id },
        { type: 'Orders', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetMyOrdersQuery, useConfirmOrderMutation } = ordersApi;
