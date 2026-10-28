import type {
  FulfillmentStatus,
  FulfillmentType,
  MerchProduct,
  MerchStatus,
  MerchVariant,
  OrderStatus,
  PayoutStatus,
  SellerStatus,
} from '@/services/api/marketplaceApi';

// All money from the backend is integer USD cents. The platform is USD-only.
const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export function formatMoney(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(Number(cents))) return '—';

  return USD.format(Number(cents) / 100);
}

export function priceCents(row: { price_usd_cents?: number | null }): number | null {
  return row.price_usd_cents ?? null;
}

// "$12.00" or "$12.00 – $24.00" for a product with several variant prices.
export function formatProductPrice(product: MerchProduct): string {
  const min = product.min_price_usd_cents;
  const max = product.max_price_usd_cents;

  if (min == null) return 'Unavailable';
  if (max == null || max === min) return formatMoney(min);

  return `${formatMoney(min)} – ${formatMoney(max)}`;
}

// Whether a variant can be bought right now, and how many are left.
export function variantAvailability(
  variant: MerchVariant,
  fulfillmentType: FulfillmentType
): { available: boolean; label: string } {
  if (!variant.is_active) return { available: false, label: 'Unavailable' };

  if (fulfillmentType === 'in_house_stock' && variant.stock_qty !== null) {
    if (variant.stock_qty <= 0) return { available: false, label: 'Sold out' };
    if (variant.stock_qty <= 5) return { available: true, label: `Only ${variant.stock_qty} left` };
  }

  return { available: true, label: 'In stock' };
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export const FULFILLMENT_LABEL: Record<FulfillmentType, string> = {
  print_on_demand: 'Print on demand',
  in_house_stock: 'In-house stock',
  dropship: 'Dropship',
};

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground border-transparent',
  info: 'bg-blue-100 text-blue-800 border-transparent dark:bg-blue-950 dark:text-blue-200',
  success: 'bg-emerald-100 text-emerald-800 border-transparent dark:bg-emerald-950 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-transparent dark:bg-amber-950 dark:text-amber-200',
  danger: 'bg-red-100 text-red-800 border-transparent dark:bg-red-950 dark:text-red-200',
};

export const MERCH_STATUS: Record<MerchStatus, { label: string; tone: Tone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  pending_review: { label: 'In review', tone: 'warning' },
  published: { label: 'Live', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  suspended: { label: 'Suspended', tone: 'danger' },
  archived: { label: 'Archived', tone: 'neutral' },
};

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Awaiting payment', tone: 'warning' },
  paid: { label: 'Paid', tone: 'info' },
  fulfilled: { label: 'Completed', tone: 'success' },
  refunded: { label: 'Refunded', tone: 'neutral' },
  disputed: { label: 'Disputed', tone: 'danger' },
  failed: { label: 'Cancelled / failed', tone: 'danger' },
};

export const FULFILLMENT_STATUS: Record<FulfillmentStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  in_production: { label: 'In production', tone: 'info' },
  shipped: { label: 'Shipped', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  returned: { label: 'Returned', tone: 'neutral' },
};

export const SELLER_STATUS: Record<SellerStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pending review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  suspended: { label: 'Suspended', tone: 'danger' },
};

export const PAYOUT_STATUS: Record<PayoutStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
};

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const PRODUCT_TYPES = [
  'tshirt',
  'hoodie',
  'mug',
  'poster',
  'sticker',
  'phone_case',
  'tote_bag',
  'print',
  'other',
] as const;
