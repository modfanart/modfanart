/**
 * Mock data + the single seam that lets the seller UI run before the
 * marketplace backend (branch `features/marketplace`) is merged and migrated.
 *
 * How the seam works: every seller RTK Query endpoint (sellerApi / merchApi /
 * payoutApi) is defined with a `queryFn` that returns one of these fixtures
 * when `isSellerMockEnabled()` is true, and otherwise calls the real
 * `fetchBaseQuery` against the intended endpoint. To go live, set
 * NEXT_PUBLIC_MOCK_SELLER to anything other than 'true' (or delete it) — the
 * components, hooks and cache tags never change. Every mock branch is marked
 * `TODO(marketplace)` so the seam is greppable for removal.
 *
 * Shapes mirror backend/src/db/types.js on `features/marketplace` @ 855570c
 * (SellerProfileRow, MerchProductRow, MerchVariantRow, PayoutRow), so field
 * names match the server the day it connects.
 */

/** Mock mode is opt-in and defaults OFF, so production never serves fixtures. */
export function isSellerMockEnabled(): boolean {
  return process.env['NEXT_PUBLIC_MOCK_SELLER'] === 'true';
}

/* ── Types (aligned to backend/src/db/types.js) ─────────────────────────── */

/** Mirrors SellerProfileStatus in backend/src/db/types.js. */
export type SellerProfileStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface SellerPayoutMethod {
  type: 'stripe' | 'upi';
  /** UPI id, or a Stripe Connect account reference — kept opaque here. */
  detail: string;
}

/**
 * Mirrors SellerProfileRow (seller_profiles table). The required fields are
 * exactly what `GET /sellers/mine` returns today. The optional block is what the
 * onboarding wizard collects per the ticket (payout details, KYC documents) and
 * sends alongside `display_name`; the server does not persist or return them
 * yet, so the UI must treat them as absent on real data.
 */
export interface SellerProfile {
  id: string;
  user_id: string;
  display_name: string;
  status: SellerProfileStatus;
  payout_ready: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Forward-compatible, not returned by the current backend. TODO(marketplace)
  contact_email?: string | null;
  contact_phone?: string | null;
  description?: string | null;
  payout_method?: SellerPayoutMethod | null;
  documents?: string[];
}

export type MerchFulfillmentType = 'print_on_demand' | 'in_house_stock' | 'dropship';

export interface MerchVariant {
  id: string;
  merch_product_id: string;
  sku: string;
  size: string | null;
  color: string | null;
  material: string | null;
  price_inr_cents: number;
  price_usd_cents: number;
  stock_qty: number | null;
  weight_grams: number | null;
  print_file_url: string | null;
  is_active: boolean;
}

export interface MerchProduct {
  id: string;
  seller_id: string | null;
  brand_id: string | null;
  artwork_id: string | null;
  title: string;
  description: string | null;
  base_product_type: string;
  fulfillment_type: MerchFulfillmentType;
  print_provider_id: string | null;
  /** Mirrors the merch_products status CHECK constraint. */
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'suspended' | 'archived';
  created_at: string;
  /** Not returned by GET /merch/mine today (bare rows); render only when present. */
  variants?: MerchVariant[];
}

export type SellerPayoutStatus = 'pending' | 'paid' | 'failed';

export interface SellerPayout {
  id: string;
  seller_id: string;
  order_item_id: string;
  gross_cents: number;
  platform_fee_cents: number;
  net_cents: number;
  status: SellerPayoutStatus;
  stripe_transfer_id: string | null;
  created_at: string;
}

/* ── Fixtures ───────────────────────────────────────────────────────────── */

const SELLER_ID = 'mock-seller-1';

export const mockSellerProducts: MerchProduct[] = [
  {
    id: 'mock-prod-1',
    seller_id: SELLER_ID,
    brand_id: null,
    artwork_id: 'mock-art-1',
    title: 'Sample Poster — "Nightfall"',
    description: 'A3 matte poster printed on demand.',
    base_product_type: 'poster',
    fulfillment_type: 'print_on_demand',
    print_provider_id: null,
    status: 'published',
    created_at: '2026-09-10T10:00:00.000Z',
    variants: [
      {
        id: 'mock-var-1',
        merch_product_id: 'mock-prod-1',
        sku: 'NF-POSTER-A3',
        size: 'A3',
        color: null,
        material: 'matte',
        price_inr_cents: 79900,
        price_usd_cents: 1200,
        stock_qty: null,
        weight_grams: 120,
        print_file_url: null,
        is_active: true,
      },
    ],
  },
  {
    id: 'mock-prod-2',
    seller_id: SELLER_ID,
    brand_id: null,
    artwork_id: 'mock-art-2',
    title: 'Sample Tee — "Circuit"',
    description: 'Unisex cotton tee.',
    base_product_type: 'tshirt',
    fulfillment_type: 'print_on_demand',
    print_provider_id: null,
    status: 'draft',
    created_at: '2026-09-12T14:30:00.000Z',
    variants: [],
  },
];

export const mockSellerPayouts: SellerPayout[] = [
  {
    id: 'mock-payout-1',
    seller_id: SELLER_ID,
    order_item_id: 'mock-oi-1',
    gross_cents: 79900,
    platform_fee_cents: 7990,
    net_cents: 71910,
    status: 'paid',
    stripe_transfer_id: 'tr_mock_1',
    created_at: '2026-09-14T09:00:00.000Z',
  },
  {
    id: 'mock-payout-2',
    seller_id: SELLER_ID,
    order_item_id: 'mock-oi-2',
    gross_cents: 120000,
    platform_fee_cents: 12000,
    net_cents: 108000,
    status: 'pending',
    stripe_transfer_id: null,
    created_at: '2026-09-16T09:00:00.000Z',
  },
];

/**
 * No seller profile yet, so mock mode shows the onboarding wizard by default.
 * Swap to `mockSellerProfile` here to preview the status view.
 */
export const mockNoSellerProfile = null;

export const mockSellerProfile: SellerProfile = {
  id: 'mock-profile-1',
  user_id: SELLER_ID,
  display_name: 'Mock Studio',
  status: 'pending',
  payout_ready: false,
  reviewed_by: null,
  reviewed_at: null,
  notes: null,
  created_at: '2026-09-15T12:00:00.000Z',
  updated_at: '2026-09-15T12:00:00.000Z',
  contact_email: 'seller@example.com',
  contact_phone: null,
  description: 'Individual creator selling prints.',
  payout_method: { type: 'upi', detail: 'mockstudio@upi' },
  documents: ['https://mock.local/kyc/id-proof.pdf'],
};
