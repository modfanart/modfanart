// src/services/api/ordersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * ─────────────────────────────────────────────────────────────
 * Aligned with:
 * - OrderRow
 * - OrderItemRow
 * - LicenseRow
 * (src/db/types.js is the authoritative schema)
 * ─────────────────────────────────────────────────────────────
 */

export interface OrderItem {
  id: string;
  order_id: string;
  artwork_id?: string | null;
  license_type?: string | null;
  unit_price_cents: number;
  quantity: number;
  description?: string | null;
  metadata?: Record<string, any> | null;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id?: string | null;
  seller_id: string;
  source_type: 'license_purchase' | 'contest_prize' | 'refund' | 'manual';
  source_id?: string | null;
  status: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'disputed' | 'failed';
  currency: string;
  subtotal_cents: number;
  platform_fee_cents: number;
  tax_cents: number;
  total_cents: number;

  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  invoice_pdf_url?: string | null;
  invoice_number?: string | null;

  paid_at?: string | null;
  fulfilled_at?: string | null;
  created_at: string;
  updated_at: string;

  // joined / expanded
  items?: OrderItem[];
}

export interface CreateOrderItemInput {
  artwork_id: string;
  license_type: string;
  quantity?: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItemInput[];
}

export interface ConfirmOrderRequest {
  id: string;
  stripe_payment_intent_id?: string;
}

/**
 * License mirrors LicenseRow (duplicated here for convenience)
 */
export interface License {
  id: string;
  order_item_id: string;
  artwork_id: string;
  buyer_id: string;
  seller_id: string;
  license_type: string;
  contract_pdf_url: string;
  expires_at?: string | null;
  is_active: boolean;
  revoked_at?: string | null;
  created_at: string;

  // joined
  artwork?: {
    id: string;
    title: string;
    thumbnail_url?: string | null;
  };
}

// ─────────────────────────────────────────────────────────────

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['MyOrders', 'Order', 'MyLicenses', 'License'],

  endpoints: (builder) => ({
    // ── Orders ──────────────────────────────────────────────

    // POST /orders
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MyOrders'],
    }),

    // POST /orders/:id/confirm
    confirmOrder: builder.mutation<Order, ConfirmOrderRequest>({
      query: ({ id, ...body }) => ({
        url: `/orders/${id}/confirm`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['MyOrders', { type: 'Order', id }, 'MyLicenses'],
    }),

    // GET /orders/me
    getMyOrders: builder.query<Order[], void>({
      query: () => '/orders/me',
      providesTags: ['MyOrders'],
    }),

    // GET /orders/:id
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // ── Licenses (read-only helpers) ────────────────────────

    // GET /licenses/me
    getMyLicenses: builder.query<License[], void>({
      query: () => '/licenses/me',
      providesTags: ['MyLicenses'],
    }),

    // GET /licenses/:id
    getLicenseById: builder.query<License, string>({
      query: (id) => `/licenses/${id}`,
      providesTags: (result, error, id) => [{ type: 'License', id }],
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
