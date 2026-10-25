// Cart + Checkout API — aligned with backend /cart
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Cart, CartItem, Order, CheckoutPayload } from '../types/merch';
import { API_BASE_URL } from '..';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/cart`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    getCart: builder.query<{ cart: Cart }, void>({
      query: () => '/',
      providesTags: [{ type: 'Cart', id: 'ACTIVE' }],
    }),

    addMerchItem: builder.mutation<
      { message: string; item: CartItem },
      { merch_variant_id: string; quantity?: number }
    >({
      query: (body) => ({
        url: '/merch',
        method: 'POST',
        body: {
          merch_variant_id: body.merch_variant_id,
          quantity: body.quantity ?? 1,
        },
      }),
      invalidatesTags: [{ type: 'Cart', id: 'ACTIVE' }],
    }),

    addLicenseItem: builder.mutation<
      { message: string; item: CartItem },
      { artwork_id: string; license_type: string; quantity?: number }
    >({
      query: (body) => ({
        url: '/license',
        method: 'POST',
        body: {
          artwork_id: body.artwork_id,
          license_type: body.license_type,
          quantity: body.quantity ?? 1,
        },
      }),
      invalidatesTags: [{ type: 'Cart', id: 'ACTIVE' }],
    }),

    updateCartItem: builder.mutation<
      { message: string; item: CartItem },
      { itemId: string; quantity: number }
    >({
      query: ({ itemId, quantity }) => ({
        url: `/items/${itemId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: [{ type: 'Cart', id: 'ACTIVE' }],
    }),

    removeCartItem: builder.mutation<{ message: string }, string>({
      query: (itemId) => ({
        url: `/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Cart', id: 'ACTIVE' }],
    }),

    checkout: builder.mutation<{ message: string; orders: Order[] }, CheckoutPayload>({
      query: (body) => ({
        url: '/checkout',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Cart', id: 'ACTIVE' }],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddMerchItemMutation,
  useAddLicenseItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useCheckoutMutation,
} = cartApi;
