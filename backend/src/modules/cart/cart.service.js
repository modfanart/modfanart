const { db } = require('../../config');
const { randomBytes } = require('crypto');
const model = require('./models/cart.model');
const merchModel = require('../merch/models/merch.model');
const Order = require('../licenses/models/order.model');
const OrderItem = require('../licenses/models/orderItem.model');

async function getOrCreateCart(userId) {
  let cart = await model.findActiveCart(userId);

  if (!cart) {
    cart = await model.createCart(userId);
  }

  const items = await model.getCartItems(cart.id);

  return {
    ...cart,
    items,
  };
}

async function addMerchItem(userId, variantId, quantity = 1) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  const variant = await merchModel.findVariantById(variantId);

  if (!variant || !variant.is_active) {
    throw new Error('Variant is unavailable');
  }

  const product = await merchModel.findProductById(variant.merch_product_id);

  if (!product || product.status !== 'published') {
    throw new Error('Product is unavailable');
  }

  if (
    product.fulfillment_type === 'in_house_stock' &&
    variant.stock_qty !== null &&
    variant.stock_qty < quantity
  ) {
    throw new Error('Insufficient stock');
  }

  const cart =
    (await model.findActiveCart(userId)) || (await model.createCart(userId));

  return model.addItem({
    cart_id: cart.id,
    item_type: 'merch_variant',
    artwork_id: product.artwork_id,
    license_type: null,
    merch_variant_id: variantId,
    quantity,
  });
}

async function addLicenseItem(userId, artworkId, licenseType, quantity = 1) {
  if (!licenseType) {
    throw new Error('License type is required');
  }

  const cart =
    (await model.findActiveCart(userId)) || (await model.createCart(userId));

  return model.addItem({
    cart_id: cart.id,
    item_type: 'license',
    artwork_id: artworkId,
    license_type: licenseType,
    merch_variant_id: null,
    quantity,
  });
}

async function updateItem(userId, itemId, quantity) {
  const item = await model.findItem(itemId);

  if (!item) {
    throw new Error('Cart item not found');
  }

  const cart = await model.findCartById(item.cart_id);

  if (!cart || cart.user_id !== userId) {
    throw new Error('Cart does not belong to you');
  }

  if (quantity < 1) {
    return model.removeItem(itemId);
  }

  return model.updateItemQuantity(itemId, quantity);
}

async function removeItem(userId, itemId) {
  const item = await model.findItem(itemId);

  if (!item) {
    throw new Error('Cart item not found');
  }

  const cart = await model.findCartById(item.cart_id);

  if (!cart || cart.user_id !== userId) {
    throw new Error('Cart does not belong to you');
  }

  return model.removeItem(itemId);
}

module.exports = {
  getOrCreateCart,
  addMerchItem,
  addLicenseItem,
  updateItem,
  removeItem,
  checkout,
};

function generateOrderNumber() {
  return `CART-${Date.now()}-${randomBytes(4).toString('hex')}`;
}

// Re-validates every line item against current state (a variant can go out
// of stock or a product can be unpublished between "add to cart" and
// checkout — the checks at addMerchItem time were a courtesy, not a
// guarantee) and then fans the cart out into one order per seller, since
// orders.seller_id is no longer required to be singular but each order row
// still represents one seller's fulfillment/payout unit.
//
// source_type is left as 'manual' rather than introducing a new
// 'cart_checkout' value: this repo's `orders.source_type` check constraint
// predates this migration and its exact name/values live in a schema this
// change doesn't have visibility into, so widening it safely is left to a
// follow-up migration once that's confirmed. `cart_id` on the order is the
// real signal that this came through the cart, and source_id points back at
// the cart as well.
async function checkout(userId, { addressId, currency = 'INR' } = {}) {
  if (!['INR', 'USD'].includes(currency)) {
    throw new Error('Unsupported currency');
  }

  const cart = await model.findActiveCart(userId);

  if (!cart) {
    throw new Error('No active cart');
  }

  const items = await model.getCartItemsForCheckout(cart.id);

  if (!items.length) {
    throw new Error('Cart is empty');
  }

  const priceCol =
    currency === 'INR' ? 'price_inr_cents' : 'price_usd_cents';

  // Validate + resolve seller + unit price for every line before writing
  // anything, so checkout fails atomically rather than partially.
  const resolved = items.map((item) => {
    if (item.item_type === 'merch_variant') {
      if (!item.merch_is_active || item.merch_product_status !== 'published') {
        throw new Error(`"${item.merch_title}" is no longer available`);
      }

      if (
        item.merch_stock_qty !== null &&
        item.merch_stock_qty < item.quantity
      ) {
        throw new Error(`"${item.merch_title}" doesn't have enough stock`);
      }

      const unitPrice =
        currency === 'INR'
          ? item.merch_price_inr_cents
          : item.merch_price_usd_cents;

      return {
        ...item,
        seller_id: item.merch_seller_id,
        unit_price_cents: unitPrice,
        description: item.merch_title,
      };
    }

    // license item
    if (item.artwork_status !== 'published') {
      throw new Error('An artwork in your cart is no longer available');
    }

    if (!item.license_tier_is_active) {
      throw new Error('A license price in your cart is no longer active');
    }

    const unitPrice =
      currency === 'INR'
        ? item.license_price_inr_cents
        : item.license_price_usd_cents;

    if (unitPrice == null) {
      throw new Error('Pricing not found for a license item in your cart');
    }

    return {
      ...item,
      seller_id: item.license_seller_id,
      unit_price_cents: unitPrice,
      description: `${item.license_type} license`,
    };
  });

  const bySeller = new Map();

  for (const item of resolved) {
    if (!bySeller.has(item.seller_id)) {
      bySeller.set(item.seller_id, []);
    }

    bySeller.get(item.seller_id).push(item);
  }

  return db.transaction().execute(async (trx) => {
    const orders = [];

    for (const [sellerId, sellerItems] of bySeller) {
      const subtotalCents = sellerItems.reduce(
        (sum, item) => sum + item.unit_price_cents * item.quantity,
        0
      );

      const order = await Order.create(
        {
          order_number: generateOrderNumber(),
          buyer_id: userId,
          seller_id: sellerId,
          cart_id: cart.id,
          shipping_address_id: addressId || null,
          source_type: 'manual',
          source_id: cart.id,
          status: 'pending',
          currency,
          subtotal_cents: subtotalCents,
          platform_fee_cents: 0, // computed per-line at payout time, not here
          tax_cents: 0, // international tax explicitly out of scope — see migration notes
          total_cents: subtotalCents,
        },
        trx
      );

      for (const item of sellerItems) {
        if (item.item_type === 'merch_variant') {
          const decremented = await merchModel.decrementStock(
            item.merch_variant_id,
            item.quantity,
            trx
          );

          // A null decrement result only means "not tracked" (pure POD,
          // stock_qty is null) — decrementStock's WHERE guards against
          // going negative, so a tracked variant that failed to decrement
          // really did just sell out from under this checkout.
          if (decremented === undefined && item.merch_stock_qty !== null) {
            throw new Error(`"${item.description}" sold out during checkout`);
          }
        }

        await OrderItem.create(
          order.id,
          {
            item_type: item.item_type,
            artwork_id: item.artwork_id,
            license_type: item.license_type,
            merch_variant_id: item.merch_variant_id,
            unit_price_cents: item.unit_price_cents,
            quantity: item.quantity,
            description: item.description,
            seller_id: item.seller_id,
          },
          trx
        );
      }

      orders.push(order);
    }

    await model.markConverted(cart.id, trx);

    return orders;
  });
}
