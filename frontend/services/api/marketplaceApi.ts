// src/services/api/marketplaceApi.ts
//
// One RTK Query slice for the whole merch marketplace, mirroring the backend
// modules it talks to:
//   /merch            catalog, seller products, variants, moderation
//   /cart             cart + multi-seller checkout
//   /addresses        buyer address book
//   /orders           buyer / seller / admin orders, payment, fulfillments
//   /seller-profiles  seller onboarding + approval
//   /payout           seller payouts, admin settlement, Stripe Connect
//   /review           product reviews
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '..';

// ────────────────────────────────────────────────
// Types (aligned with the backend rows / joins)
// ────────────────────────────────────────────────

export type Currency = 'INR' | 'USD';

export type FulfillmentType = 'print_on_demand' | 'in_house_stock' | 'dropship';

export type MerchStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'suspended'
  | 'archived';

export interface MerchVariant {
  id: string;
  merch_product_id: string;
  sku: string;
  size: string | null;
  color: string | null;
  material: string | null;
  price_inr_cents: number;
  price_usd_cents: number;
  stock_qty: number | null; // null = unlimited (print on demand)
  weight_grams: number | null;
  print_file_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MerchProduct {
  id: string;
  seller_id: string;
  brand_id: string | null;
  artwork_id: string | null;
  license_id: string | null;
  title: string;
  description: string | null;
  base_product_type: string;
  fulfillment_type: FulfillmentType;
  print_provider_id: string | null;
  status: MerchStatus;
  created_at: string;
  updated_at: string;

  // joined
  seller_username: string | null;
  seller_name: string | null;
  brand_name: string | null;
  brand_slug: string | null;
  artwork_title: string | null;
  image_url: string | null;
  min_price_inr_cents: number | null;
  max_price_inr_cents: number | null;
  min_price_usd_cents: number | null;
  max_price_usd_cents: number | null;
  variant_count: number;
  rating_avg: number;
  rating_count: number;

  // only on GET /merch/:id
  variants?: MerchVariant[] | undefined;
}

export interface MerchFilters {
  search?: string | undefined;
  type?: string | undefined;
  fulfillment_type?: FulfillmentType | undefined;
  brand_id?: string | undefined;
  seller_id?: string | undefined;
  artwork_id?: string | undefined;
  sort?: 'newest' | 'oldest' | 'title' | undefined;
}

export interface CreateMerchProductRequest {
  title: string;
  description?: string | undefined;
  base_product_type: string;
  fulfillment_type: FulfillmentType;
  print_provider_id?: string | null | undefined;
  brand_id?: string | null | undefined;
  artwork_id?: string | null | undefined;
  license_id?: string | null | undefined;
}

export interface VariantInput {
  sku: string;
  size?: string | null | undefined;
  color?: string | null | undefined;
  material?: string | null | undefined;
  price_inr_cents: number;
  price_usd_cents: number;
  stock_qty?: number | null | undefined;
  weight_grams?: number | null | undefined;
  print_file_url?: string | null | undefined;
  is_active?: boolean | undefined;
}

export interface PrintProvider {
  id: string;
  name: string;
  integration_type: 'printful' | 'printify' | 'manual';
  is_active: boolean;
}

export interface SellerSummary {
  orders_count: number;
  units_sold: number;
  gross_cents: number;
  products_total: number;
  products_by_status: Partial<Record<MerchStatus, number>>;
}

// ── Cart ────────────────────────────────────────

export interface CartItem {
  id: string;
  cart_id: string;
  item_type: 'license' | 'merch_variant';
  artwork_id: string | null;
  license_type: string | null;
  merch_variant_id: string | null;
  quantity: number;
  sku: string | null;
  size: string | null;
  color: string | null;
  material: string | null;
  stock_qty: number | null;
  variant_is_active: boolean | null;
  merch_product_id: string | null;
  product_status: MerchStatus | null;
  fulfillment_type: FulfillmentType | null;
  seller_id: string | null;
  title: string | null;
  price_inr_cents: number | null;
  price_usd_cents: number | null;
  image_url: string | null;
}

export interface Cart {
  id: string;
  user_id: string;
  status: 'active' | 'converted' | 'abandoned';
  items: CartItem[];
}

// ── Addresses ───────────────────────────────────

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'user_id' | 'is_default'> & {
  is_default?: boolean | undefined;
};

// ── Orders ──────────────────────────────────────

export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'disputed' | 'failed';

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: 'license' | 'merch_variant';
  artwork_id: string | null;
  license_type: string | null;
  merch_variant_id: string | null;
  seller_id: string | null;
  unit_price_cents: number;
  quantity: number;
  description: string | null;

  // joined
  sku: string | null;
  size: string | null;
  color: string | null;
  material: string | null;
  merch_product_id: string | null;
  product_title: string | null;
  artwork_title: string | null;
  image_url: string | null;
  license_id: string | null;
  contract_pdf_url: string | null;
  license_active: boolean | null;
  seller_username: string | null;
  review_id: string | null;
  review_rating: number | null;
}

export type FulfillmentStatus =
  | 'pending'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'failed'
  | 'returned';

export interface Fulfillment {
  id: string;
  order_id: string;
  seller_id: string | null;
  address_id: string | null;
  print_provider_id: string | null;
  status: FulfillmentStatus;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  items?: OrderItem[] | undefined;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string | null;
  seller_id: string | null;
  cart_id: string | null;
  shipping_address_id: string | null;
  source_type: string;
  status: OrderStatus;
  currency: Currency;
  subtotal_cents: number;
  platform_fee_cents: number;
  tax_cents: number;
  total_cents: number;
  stripe_payment_intent_id: string | null;
  invoice_pdf_url: string | null;
  invoice_number: string | null;
  paid_at: string | null;
  fulfilled_at: string | null;
  created_at: string;
  updated_at: string;

  items: OrderItem[];
  fulfillments: Fulfillment[];
  shipping_address: Address | null;
  buyer_username?: string | null | undefined;
  buyer_email?: string | null | undefined;
  viewer_role?: 'buyer' | 'seller' | 'admin' | undefined;
}

export interface AdminOrdersResponse {
  orders: Order[];
  totals: { status: OrderStatus; count: number; total_cents: number }[];
}

export interface PaymentSession {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: Currency;
  orderIds: string[];
}

// ── Sellers / payouts / reviews ─────────────────

export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface SellerProfile {
  id: string;
  user_id: string;
  display_name: string;
  status: SellerStatus;
  payout_ready: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  username?: string | null | undefined;
  email?: string | null | undefined;
}

export type PayoutStatus = 'pending' | 'paid' | 'failed';

export interface Payout {
  id: string;
  seller_id: string;
  order_item_id: string;
  gross_cents: number;
  platform_fee_cents: number;
  net_cents: number;
  status: PayoutStatus;
  stripe_transfer_id: string | null;
  created_at: string;
  // admin list only
  seller_username?: string | null | undefined;
  seller_email?: string | null | undefined;
  seller_stripe_connect_id?: string | null | undefined;
  order_number?: string | null | undefined;
  currency?: Currency | null | undefined;
  item_description?: string | null | undefined;
}

export interface ConnectStatus {
  connected: boolean;
  charges_enabled?: boolean | undefined;
  payouts_enabled?: boolean | undefined;
  details_submitted?: boolean | undefined;
}

export type ReviewTarget = 'artwork' | 'merch_product';

export interface ProductReview {
  id: string;
  reviewer_id: string;
  target_type: ReviewTarget;
  target_id: string;
  order_item_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  reviewer_username?: string | null | undefined;
  reviewer_avatar_url?: string | null | undefined;
}

export interface RatingSummary {
  review_count: number;
  average_rating: number | null;
}

// Helper so UI code can surface the backend's `{ error }` message.
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as { data?: { error?: string | undefined; message?: string }; error?: string } | undefined;
  return e?.data?.error || e?.data?.message || e?.error || fallback;
}

// ────────────────────────────────────────────────
// API
// ────────────────────────────────────────────────

export const marketplaceApi = createApi({
  reducerPath: 'marketplaceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.auth?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: [
    'Catalog',
    'Product',
    'MyProducts',
    'PendingProducts',
    'SellerSummary',
    'Cart',
    'Addresses',
    'MyOrders',
    'SellerOrders',
    'AdminOrders',
    'Order',
    'Fulfillments',
    'SellerProfile',
    'SellerProfiles',
    'MyPayouts',
    'AllPayouts',
    'Reviews',
    'ConnectStatus',
  ],

  endpoints: (builder) => ({
    // ═════════════ Catalog ═════════════
    getMerchProducts: builder.query<MerchProduct[], MerchFilters | void>({
      query: (filters) => ({ url: '/merch', params: (filters || {}) as Record<string, string> }),
      transformResponse: (res: { products: MerchProduct[] }) => res.products,
      providesTags: ['Catalog'],
    }),

    getMerchProduct: builder.query<MerchProduct, string>({
      query: (id) => `/merch/${id}`,
      transformResponse: (res: { product: MerchProduct }) => res.product,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),

    getPrintProviders: builder.query<PrintProvider[], void>({
      query: () => '/merch/print-providers',
      transformResponse: (res: { providers: PrintProvider[] }) => res.providers,
    }),

    // ═════════════ Seller: products ═════════════
    getMyMerchProducts: builder.query<MerchProduct[], void>({
      query: () => '/merch/mine',
      transformResponse: (res: { products: MerchProduct[] }) => res.products,
      providesTags: ['MyProducts'],
    }),

    getMySellerSummary: builder.query<SellerSummary, void>({
      query: () => '/merch/mine/summary',
      transformResponse: (res: { summary: SellerSummary }) => res.summary,
      providesTags: ['SellerSummary'],
    }),

    createMerchProduct: builder.mutation<MerchProduct, CreateMerchProductRequest>({
      query: (body) => ({ url: '/merch', method: 'POST', body }),
      transformResponse: (res: { product: MerchProduct }) => res.product,
      invalidatesTags: ['MyProducts', 'SellerSummary'],
    }),

    updateMerchProduct: builder.mutation<
      MerchProduct,
      { id: string } & Partial<CreateMerchProductRequest> & { status?: MerchStatus }
    >({
      query: ({ id, ...body }) => ({ url: `/merch/${id}`, method: 'PATCH', body }),
      transformResponse: (res: { product: MerchProduct }) => res.product,
      invalidatesTags: (_r, _e, { id }) => ['MyProducts', { type: 'Product', id }, 'Catalog'],
    }),

    deleteMerchProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/merch/${id}`, method: 'DELETE' }),
      invalidatesTags: ['MyProducts', 'Catalog', 'SellerSummary'],
    }),

    submitMerchForReview: builder.mutation<MerchProduct, string>({
      query: (id) => ({ url: `/merch/${id}/submit-for-review`, method: 'POST' }),
      transformResponse: (res: { product: MerchProduct }) => res.product,
      invalidatesTags: (_r, _e, id) => [
        'MyProducts',
        'PendingProducts',
        'SellerSummary',
        { type: 'Product', id },
      ],
    }),

    addMerchVariant: builder.mutation<MerchVariant, { productId: string } & VariantInput>({
      query: ({ productId, ...body }) => ({
        url: `/merch/${productId}/variants`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: { variant: MerchVariant }) => res.variant,
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Product', id: productId },
        'MyProducts',
      ],
    }),

    updateMerchVariant: builder.mutation<
      MerchVariant,
      { productId: string; variantId: string } & Partial<VariantInput>
    >({
      query: ({ variantId, productId: _p, ...body }) => ({
        url: `/merch/variants/${variantId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: { variant: MerchVariant }) => res.variant,
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Product', id: productId },
        'MyProducts',
        'Catalog',
        'Cart',
      ],
    }),

    deleteMerchVariant: builder.mutation<void, { productId: string; variantId: string }>({
      query: ({ variantId }) => ({ url: `/merch/variants/${variantId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Product', id: productId },
        'MyProducts',
        'Catalog',
      ],
    }),

    // ═════════════ Admin: moderation ═════════════
    getPendingMerchProducts: builder.query<MerchProduct[], void>({
      query: () => '/merch/pending',
      transformResponse: (res: { products: MerchProduct[] }) => res.products,
      providesTags: ['PendingProducts'],
    }),

    moderateMerchProduct: builder.mutation<
      MerchProduct,
      { id: string; decision: 'approved' | 'rejected'; notes?: string | undefined }
    >({
      query: ({ id, ...body }) => ({ url: `/merch/${id}/moderate`, method: 'POST', body }),
      transformResponse: (res: { product: MerchProduct }) => res.product,
      invalidatesTags: (_r, _e, { id }) => [
        'PendingProducts',
        'Catalog',
        'MyProducts',
        { type: 'Product', id },
      ],
    }),

    // ═════════════ Cart ═════════════
    getCart: builder.query<Cart, void>({
      query: () => '/cart',
      transformResponse: (res: { cart: Cart }) => res.cart,
      providesTags: ['Cart'],
    }),

    addMerchToCart: builder.mutation<void, { merch_variant_id: string; quantity?: number }>({
      query: (body) => ({ url: '/cart/merch', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),

    addLicenseToCart: builder.mutation<
      void,
      { artwork_id: string; license_type: string; quantity?: number }
    >({
      query: (body) => ({ url: '/cart/license', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),

    updateCartItem: builder.mutation<void, { itemId: string; quantity: number }>({
      query: ({ itemId, quantity }) => ({
        url: `/cart/items/${itemId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    removeCartItem: builder.mutation<void, string>({
      query: (itemId) => ({ url: `/cart/items/${itemId}`, method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),

    // Splits the cart into one *pending* order per seller. Payment is a
    // separate step (createOrderPayment).
    checkoutCart: builder.mutation<Order[], { address_id?: string | null | undefined; currency: Currency }>({
      query: (body) => ({ url: '/cart/checkout', method: 'POST', body }),
      transformResponse: (res: { orders: Order[] }) => res.orders,
      invalidatesTags: ['Cart', 'MyOrders'],
    }),

    // ═════════════ Addresses ═════════════
    getAddresses: builder.query<Address[], void>({
      query: () => '/addresses',
      transformResponse: (res: { addresses: Address[] }) => res.addresses,
      providesTags: ['Addresses'],
    }),

    createAddress: builder.mutation<Address, AddressInput>({
      query: (body) => ({ url: '/addresses', method: 'POST', body }),
      transformResponse: (res: { address: Address }) => res.address,
      invalidatesTags: ['Addresses'],
    }),

    updateAddress: builder.mutation<Address, { id: string } & Partial<AddressInput>>({
      query: ({ id, ...body }) => ({ url: `/addresses/${id}`, method: 'PATCH', body }),
      transformResponse: (res: { address: Address }) => res.address,
      invalidatesTags: ['Addresses'],
    }),

    deleteAddress: builder.mutation<void, string>({
      query: (id) => ({ url: `/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Addresses'],
    }),

    // ═════════════ Orders ═════════════
    getMyOrders: builder.query<Order[], void>({
      query: () => '/orders/me',
      transformResponse: (res: { orders: Order[] }) => res.orders,
      providesTags: ['MyOrders'],
    }),

    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (res: { order: Order }) => res.order,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),

    getSellerOrders: builder.query<Order[], void>({
      query: () => '/orders/seller/mine',
      transformResponse: (res: { orders: Order[] }) => res.orders,
      providesTags: ['SellerOrders'],
    }),

    getAdminOrders: builder.query<
      AdminOrdersResponse,
      { status?: OrderStatus | undefined; limit?: number | undefined; offset?: number } | void
    >({
      query: (params) => ({ url: '/orders/admin/all', params: (params || {}) as any }),
      providesTags: ['AdminOrders'],
    }),

    createOrderPayment: builder.mutation<PaymentSession, { order_ids: string[] }>({
      query: (body) => ({ url: '/orders/pay', method: 'POST', body }),
    }),

    confirmOrderPayment: builder.mutation<
      { payment_status: string; orders: Order[] },
      { payment_intent_id: string }
    >({
      query: (body) => ({ url: '/orders/confirm-payment', method: 'POST', body }),
      invalidatesTags: ['MyOrders', 'Order', 'Cart', 'SellerOrders', 'AdminOrders'],
    }),

    cancelOrder: builder.mutation<Order, string>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'POST' }),
      transformResponse: (res: { order: Order }) => res.order,
      invalidatesTags: (_r, _e, id) => ['MyOrders', { type: 'Order', id }, 'Catalog'],
    }),

    // ═════════════ Fulfillments ═════════════
    getOrderFulfillments: builder.query<Fulfillment[], string>({
      query: (orderId) => `/orders/${orderId}/fulfillments`,
      transformResponse: (res: { fulfillments: Fulfillment[] }) => res.fulfillments,
      providesTags: (_r, _e, orderId) => [{ type: 'Fulfillments', id: orderId }],
    }),

    createFulfillment: builder.mutation<
      Fulfillment,
      {
        orderId: string;
        order_item_ids: string[];
        address_id?: string | null | undefined;
        print_provider_id?: string | null | undefined;
      }
    >({
      query: ({ orderId, ...body }) => ({
        url: `/orders/${orderId}/fulfillments`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: { fulfillment: Fulfillment }) => res.fulfillment,
      invalidatesTags: (_r, _e, { orderId }) => [
        { type: 'Fulfillments', id: orderId },
        { type: 'Order', id: orderId },
        'SellerOrders',
      ],
    }),

    updateFulfillmentStatus: builder.mutation<
      Fulfillment,
      { orderId: string; id: string; status: FulfillmentStatus }
    >({
      query: ({ orderId, id, status }) => ({
        url: `/orders/${orderId}/fulfillments/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (res: { fulfillment: Fulfillment }) => res.fulfillment,
      invalidatesTags: (_r, _e, { orderId }) => [
        { type: 'Fulfillments', id: orderId },
        { type: 'Order', id: orderId },
        'SellerOrders',
        'MyOrders',
        'MyPayouts',
        'AdminOrders',
      ],
    }),

    updateFulfillmentTracking: builder.mutation<
      Fulfillment,
      {
        orderId: string;
        id: string;
        carrier?: string | undefined;
        tracking_number?: string | undefined;
        tracking_url?: string | undefined;
      }
    >({
      query: ({ orderId, id, ...body }) => ({
        url: `/orders/${orderId}/fulfillments/${id}/tracking`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: { fulfillment: Fulfillment }) => res.fulfillment,
      invalidatesTags: (_r, _e, { orderId }) => [
        { type: 'Fulfillments', id: orderId },
        { type: 'Order', id: orderId },
        'SellerOrders',
      ],
    }),

    // ═════════════ Seller profiles ═════════════
    getMySellerProfile: builder.query<SellerProfile | null, void>({
      query: () => '/seller-profiles/mine',
      transformResponse: (res: { profile: SellerProfile | null }) => res.profile,
      providesTags: ['SellerProfile'],
    }),

    applyAsSeller: builder.mutation<SellerProfile, { display_name: string }>({
      query: (body) => ({ url: '/seller-profiles', method: 'POST', body }),
      transformResponse: (res: { profile: SellerProfile }) => res.profile,
      invalidatesTags: ['SellerProfile', 'SellerProfiles'],
    }),

    getSellerProfiles: builder.query<SellerProfile[], { status?: SellerStatus } | void>({
      query: (params) => ({ url: '/seller-profiles', params: (params || {}) as any }),
      transformResponse: (res: { profiles: SellerProfile[] }) => res.profiles,
      providesTags: ['SellerProfiles'],
    }),

    decideSellerProfile: builder.mutation<
      SellerProfile,
      { id: string; status: Exclude<SellerStatus, 'pending'>; notes?: string | undefined }
    >({
      query: ({ id, ...body }) => ({ url: `/seller-profiles/${id}`, method: 'PATCH', body }),
      transformResponse: (res: { profile: SellerProfile }) => res.profile,
      invalidatesTags: ['SellerProfiles', 'SellerProfile'],
    }),

    // ═════════════ Payouts ═════════════
    getMyPayouts: builder.query<Payout[], void>({
      query: () => '/payout/mine',
      transformResponse: (res: { payouts: Payout[] }) => res.payouts,
      providesTags: ['MyPayouts'],
    }),

    getAllPayouts: builder.query<Payout[], { status?: PayoutStatus } | void>({
      query: (params) => ({ url: '/payout', params: (params || {}) as any }),
      transformResponse: (res: { payouts: Payout[] }) => res.payouts,
      providesTags: ['AllPayouts'],
    }),

    generateOrderPayouts: builder.mutation<void, string>({
      query: (orderId) => ({ url: `/payout/orders/${orderId}/generate`, method: 'POST' }),
      invalidatesTags: ['AllPayouts', 'MyPayouts'],
    }),

    markPayoutPaid: builder.mutation<Payout, { id: string; stripe_transfer_id?: string }>({
      query: ({ id, ...body }) => ({ url: `/payout/${id}/paid`, method: 'PATCH', body }),
      transformResponse: (res: { payout: Payout }) => res.payout,
      invalidatesTags: ['AllPayouts', 'MyPayouts'],
    }),

    markPayoutFailed: builder.mutation<Payout, string>({
      query: (id) => ({ url: `/payout/${id}/failed`, method: 'PATCH' }),
      transformResponse: (res: { payout: Payout }) => res.payout,
      invalidatesTags: ['AllPayouts', 'MyPayouts'],
    }),

    getConnectStatus: builder.query<ConnectStatus, void>({
      query: () => '/payout/status',
      providesTags: ['ConnectStatus'],
    }),

    createConnectAccount: builder.mutation<{ url: string }, void>({
      query: () => ({ url: '/payout/connect', method: 'POST' }),
      invalidatesTags: ['ConnectStatus'],
    }),

    // ═════════════ Reviews ═════════════
    getReviews: builder.query<ProductReview[], { targetType: ReviewTarget; targetId: string }>({
      query: ({ targetType, targetId }) => `/review/${targetType}/${targetId}`,
      transformResponse: (res: { reviews: ProductReview[] }) => res.reviews,
      providesTags: (_r, _e, { targetId }) => [{ type: 'Reviews', id: targetId }],
    }),

    getRatingSummary: builder.query<RatingSummary, { targetType: ReviewTarget; targetId: string }>({
      query: ({ targetType, targetId }) => `/review/${targetType}/${targetId}/summary`,
      transformResponse: (res: { summary: RatingSummary }) => res.summary,
      providesTags: (_r, _e, { targetId }) => [{ type: 'Reviews', id: targetId }],
    }),

    createReview: builder.mutation<
      ProductReview,
      {
        target_type: ReviewTarget;
        target_id: string;
        order_item_id: string;
        rating: number;
        body?: string | undefined;
      }
    >({
      query: (body) => ({ url: '/review', method: 'POST', body }),
      transformResponse: (res: { review: ProductReview }) => res.review,
      invalidatesTags: (_r, _e, { target_id }) => [
        { type: 'Reviews', id: target_id },
        'MyOrders',
        'Catalog',
        { type: 'Product', id: target_id },
      ],
    }),
  }),
});

export const {
  // catalog
  useGetMerchProductsQuery,
  useGetMerchProductQuery,
  useGetPrintProvidersQuery,
  // seller products
  useGetMyMerchProductsQuery,
  useGetMySellerSummaryQuery,
  useCreateMerchProductMutation,
  useUpdateMerchProductMutation,
  useDeleteMerchProductMutation,
  useSubmitMerchForReviewMutation,
  useAddMerchVariantMutation,
  useUpdateMerchVariantMutation,
  useDeleteMerchVariantMutation,
  // moderation
  useGetPendingMerchProductsQuery,
  useModerateMerchProductMutation,
  // cart
  useGetCartQuery,
  useAddMerchToCartMutation,
  useAddLicenseToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useCheckoutCartMutation,
  // addresses
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  // orders
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useGetSellerOrdersQuery,
  useGetAdminOrdersQuery,
  useCreateOrderPaymentMutation,
  useConfirmOrderPaymentMutation,
  useCancelOrderMutation,
  // fulfillments
  useGetOrderFulfillmentsQuery,
  useCreateFulfillmentMutation,
  useUpdateFulfillmentStatusMutation,
  useUpdateFulfillmentTrackingMutation,
  // seller profiles
  useGetMySellerProfileQuery,
  useApplyAsSellerMutation,
  useGetSellerProfilesQuery,
  useDecideSellerProfileMutation,
  // payouts
  useGetMyPayoutsQuery,
  useGetAllPayoutsQuery,
  useGenerateOrderPayoutsMutation,
  useMarkPayoutPaidMutation,
  useMarkPayoutFailedMutation,
  useGetConnectStatusQuery,
  useCreateConnectAccountMutation,
  // reviews
  useGetReviewsQuery,
  useGetRatingSummaryQuery,
  useCreateReviewMutation,
} = marketplaceApi;

export default marketplaceApi;
