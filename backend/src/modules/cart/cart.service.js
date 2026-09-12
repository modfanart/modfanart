const { db } = require('../../config');
const model = require('./models/cart.model');
const merchModel = require('../merch/models/merch.model');

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
};
