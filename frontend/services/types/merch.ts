// Types aligned with backend merch + cart + order models
// (merch_products, merch_variants, carts, cart_items, orders, seller_profiles)

export type MerchStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'archived';

export type FulfillmentType = 'print_on_demand' | 'in_house_stock' | 'dropship';

export type BaseProductType =
  | 'tshirt'
  | 'hoodie'
  | 'mug'
  | 'poster'
  | 'canvas'
  | 'sticker'
  | 'phone_case'
  | 'tote'
  | 'other';

export type SellerProfileStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type CartStatus = 'active' | 'converted' | 'abandoned';

export type CartItemType = 'license' | 'merch_variant';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'fulfilled'
  | 'refunded'
  | 'disputed'
  | 'failed';

export interface MerchVariant {
  id: string;
  merch_product_id: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  price_inr_cents: number;
  price_usd_cents: number;
  stock_qty?: number | null;
  weight_grams?: number | null;
  print_file_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MerchProduct {
  id: string;
  seller_id: string;
  brand_id?: string | null;
  artwork_id?: string | null;
  license_id?: string | null;
  title: string;
  description?: string | null;
  base_product_type: BaseProductType | string;
  fulfillment_type: FulfillmentType;
  print_provider_id?: string | null;
  status: MerchStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // joined / expanded by API
  variants?: MerchVariant[];
  seller?: {
    id: string;
    username?: string;
    name?: string;
    avatar_url?: string | null;
  };
  brand?: {
    id: string;
    name: string;
    slug?: string;
  };
  artwork?: {
    id: string;
    title: string;
    thumbnail_url?: string | null;
  };
  // convenience for UI (derived from first active variant or min)
  price_inr_cents?: number;
  price_usd_cents?: number;
  primary_image_url?: string | null;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string | null;
  status: SellerProfileStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email?: string;
    username?: string;
  };
}

export interface CartItem {
  id: string;
  cart_id: string;
  item_type: CartItemType;
  artwork_id?: string | null;
  license_type?: string | null;
  merch_variant_id?: string | null;
  quantity: number;
  created_at?: string;
  // joined from getCartItems
  sku?: string | null;
  price_inr_cents?: number | null;
  price_usd_cents?: number | null;
  title?: string | null;
  seller_id?: string | null;
  size?: string | null;
  color?: string | null;
  merch_title?: string | null;
  merch_seller_id?: string | null;
  merch_status?: MerchStatus | null;
  merch_stock_qty?: number | null;
  merch_is_active?: boolean | null;
}

export interface Cart {
  id: string;
  user_id: string;
  status: CartStatus;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  artwork_id?: string | null;
  license_type?: string | null;
  merch_variant_id?: string | null;
  unit_price_cents: number;
  quantity: number;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id?: string | null;
  seller_id: string;
  source_type: string;
  source_id?: string | null;
  status: OrderStatus;
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
  items?: OrderItem[];
}

// Request payloads

export interface CreateMerchProductPayload {
  title: string;
  description?: string;
  base_product_type: string;
  fulfillment_type: FulfillmentType;
  brand_id?: string | null;
  artwork_id?: string | null;
  license_id?: string | null;
  print_provider_id?: string | null;
}

export interface UpdateMerchProductPayload {
  title?: string;
  description?: string;
  base_product_type?: string;
  fulfillment_type?: FulfillmentType;
  print_provider_id?: string | null;
  brand_id?: string | null;
}

export interface CreateVariantPayload {
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  price_inr_cents: number;
  price_usd_cents: number;
  stock_qty?: number | null;
  weight_grams?: number | null;
  print_file_url?: string | null;
  is_active?: boolean;
}

export interface UpdateVariantPayload {
  sku?: string;
  size?: string;
  color?: string;
  material?: string;
  price_inr_cents?: number;
  price_usd_cents?: number;
  stock_qty?: number | null;
  weight_grams?: number | null;
  print_file_url?: string | null;
  is_active?: boolean;
}

export interface ModerateProductPayload {
  decision: 'approve' | 'reject';
  notes?: string;
}

export interface ApplySellerPayload {
  display_name: string;
  bio?: string;
}

export interface DecideSellerPayload {
  status: 'approved' | 'rejected' | 'suspended';
  notes?: string;
}

export interface CheckoutPayload {
  address_id?: string;
  currency?: 'INR' | 'USD';
}
