import type { CartItem } from '@/services/api/marketplaceApi';

// Why a cart line can't be bought right now (mirrors the checks
// cart.service#checkout re-runs server-side, so the buyer finds out before
// paying rather than after).
export function cartItemProblem(item: CartItem): string | null {
  if (item.item_type === 'merch_variant') {
    if (item.product_status !== 'published' || item.variant_is_active === false) {
      return 'No longer available';
    }
    if (
      item.fulfillment_type === 'in_house_stock' &&
      item.stock_qty !== null &&
      item.stock_qty < item.quantity
    ) {
      return item.stock_qty === 0 ? 'Sold out' : `Only ${item.stock_qty} left`;
    }
  }
  return null;
}
