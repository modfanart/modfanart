const { db } = require('../../config');
const { randomBytes } = require('crypto');
const model = require('./models/cart.model');
const merchModel = require('../merch/models/merch.model');
const addressModel = require('../address/models/address.model');
const Order = require('../licenses/models/order.model');
const OrderItem = require('../licenses/models/orderItem.model');

const MAX_LINE_QUANTITY = 50;

function assertValidQuantity(quantity) {
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_LINE_QUANTITY
  ) {
    throw new Error(
      `Quantity must be a whole number between 1 and ${MAX_LINE_QUANTITY}`
    );
  }
}

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
  assertValidQuantity(quantity);

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

  // Adding the same variant again bumps the existing line instead of
  // creating a duplicate row — and the stock check must cover the total.
  const existing = await model.findItemByVariant(cart.id, variantId);

  if (existing) {
    const total = existing.quantity + quantity;

    if (
      product.fulfillment_type === 'in_house_stock' &&
      variant.stock_qty !== null &&
      variant.stock_qty < total
    ) {
      throw new Error('Insufficient stock');
    }

    return model.updateItemQuantity(existing.id, total);
  }

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

  // A license is a one-off grant — re-adding it is a no-op, not quantity 2.
  const existing = await model.findLicenseItem(
    cart.id,
    artworkId,
    licenseType
  );

  if (existing) return existing;

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

  if (Number.isInteger(quantity) && quantity < 1) {
    return model.removeItem(itemId);
  }

  assertValidQuantity(quantity);

  if (item.item_type === 'merch_variant') {
    const variant = await merchModel.findVariantById(item.merch_variant_id);

    if (
      !variant ||
      !variant.is_active ||
      (variant.stock_qty !== null && variant.stock_qty < quantity)
    ) {
      throw new Error('Insufficient stock');
    }
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
// each order row represents one seller's fulfillment/payout unit.
//
// Everything — reading the cart, validating, reserving stock, writing the
// orders — happens inside ONE transaction that holds a row lock on the cart.
// That makes a double-click / retry / second tab safe: the second checkout
// waits for the lock, then finds the cart already converted and fails with
// "No active cart" instead of creating duplicate orders or double-reserving
// stock.
//
// Prices are always USD, read from the database at this moment — nothing
// price-related is accepted from the client.
//
// source_type is left as 'manual' rather than introducing a new
// 'cart_checkout' value: the orders.source_type check constraint predates
// the marketplace migration. `cart_id` on the order is the real signal.
const CURRENCY = 'USD';

async function checkout(userId, { addressId } = {}) {
  return db.transaction().execute(async (trx) => {
    const cart = await model.lockActiveCart(userId, trx);

    if (!cart) {
      throw new Error('No active cart');
    }

    const items = await model.getCartItemsForCheckout(cart.id, trx);

    if (!items.length) {
      throw new Error('Cart is empty');
    }

    const hasMerch = items.some((i) => i.item_type === 'merch_variant');

    // A shipping address is mandatory for physical goods, and it must be
    // one of the buyer's own (never trust a client-supplied address id).
    if (hasMerch) {
      if (!addressId) {
        throw new Error('A shipping address is required for merch items');
      }

      const address = await addressModel.findById(addressId, trx);

      if (!address || address.user_id !== userId) {
        throw new Error('Shipping address not found');
      }
    }

    // Merch printed from someone else's artwork is only sellable while the
    // licence behind it is still valid. A licence can expire or be revoked
    // after the product went live, so check at the moment of sale.
    const licenseIds = [
      ...new Set(items.map((i) => i.merch_license_id).filter(Boolean)),
    ];

    if (licenseIds.length) {
      const valid = await trx
        .selectFrom('licenses')
        .select('id')
        .where('id', 'in', licenseIds)
        .where('is_active', '=', true)
        .where('revoked_at', 'is', null)
        .where((eb) =>
          eb.or([
            eb('expires_at', 'is', null),
            eb('expires_at', '>', new Date().toISOString()),
          ])
        )
        .execute();

      const validIds = new Set(valid.map((v) => v.id));

      for (const item of items) {
        if (item.merch_license_id && !validIds.has(item.merch_license_id)) {
          throw new Error(
            `"${item.merch_title}" is no longer available (artwork licence ended)`
          );
        }
      }
    }

    // Validate + resolve seller + unit price for every line before writing
    // anything, so checkout fails atomically rather than partially.
    const resolved = items.map((item) => {
      let sellerId;
      let unitPrice;
      let description;

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

        sellerId = item.merch_seller_id;
        unitPrice = item.merch_price_usd_cents;
        description = item.merch_title;
      } else {
        if (item.artwork_status !== 'published') {
          throw new Error('An artwork in your cart is no longer available');
        }

        if (!item.license_tier_is_active) {
          throw new Error('A license price in your cart is no longer active');
        }

        sellerId = item.license_seller_id;
        unitPrice = item.license_price_usd_cents;
        description = `${item.license_type} license`;
      }

      if (!sellerId) {
        throw new Error(`"${description}" has no seller and can't be purchased`);
      }

      // Buying your own listing would just loop money through payouts.
      if (sellerId === userId) {
        throw new Error(`You can't purchase your own item ("${description}")`);
      }

      if (!Number.isInteger(unitPrice) || unitPrice < 0) {
        throw new Error(`Pricing not found for "${description}"`);
      }

      return {
        ...item,
        seller_id: sellerId,
        unit_price_cents: unitPrice,
        description,
      };
    });

    const bySeller = new Map();

    for (const item of resolved) {
      if (!bySeller.has(item.seller_id)) {
        bySeller.set(item.seller_id, []);
      }

      bySeller.get(item.seller_id).push(item);
    }

    const orders = [];

    for (const [sellerId, sellerItems] of bySeller) {
      const subtotalCents = sellerItems.reduce(
        (sum, item) => sum + item.unit_price_cents * item.quantity,
        0
      );

      const sellerHasMerch = sellerItems.some(
        (i) => i.item_type === 'merch_variant'
      );

      const order = await Order.create(
        {
          order_number: generateOrderNumber(),
          buyer_id: userId,
          seller_id: sellerId,
          cart_id: cart.id,
          // Only orders that actually ship carry an address.
          shipping_address_id: sellerHasMerch ? addressId : null,
          source_type: 'manual',
          source_id: cart.id,
          status: 'pending',
          currency: CURRENCY,
          subtotal_cents: subtotalCents,
          platform_fee_cents: 0, // computed per-line at payout time, not here
          tax_cents: 0, // tax is out of scope — see migration notes
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

          // decrementStock's WHERE only matches tracked variants with
          // enough stock, so `undefined` means either "not tracked" (pure
          // POD, stock_qty null) or "just sold out from under us".
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
