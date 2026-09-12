const { db } = require('../../config');
const model = require('./models/merch.model');

const VALID_FULFILLMENT_TYPES = [
  'print_on_demand',
  'in_house_stock',
  'dropship',
];

async function createProduct(userId, payload) {
  if (!payload.title) {
    throw new Error('Product title is required');
  }

  if (!payload.base_product_type) {
    throw new Error('Base product type is required');
  }

  if (!VALID_FULFILLMENT_TYPES.includes(payload.fulfillment_type)) {
    throw new Error('Invalid fulfillment type');
  }

  if (
    payload.fulfillment_type === 'print_on_demand' &&
    !payload.print_provider_id
  ) {
    throw new Error('Print provider is required for print-on-demand products');
  }

  return db.transaction().execute(async (trx) => {
    if (payload.print_provider_id) {
      const provider = await model.findPrintProviderById(
        payload.print_provider_id,
        trx
      );

      if (!provider) {
        throw new Error('Print provider not found');
      }
    }

    return model.createProduct(
      {
        ...payload,
        seller_id: userId,
      },
      trx
    );
  });
}

async function getProduct(id) {
  const product = await model.findProductById(id);

  if (!product) {
    throw new Error('Merch product not found');
  }

  const variants = await model.findVariantsByProduct(id);

  return {
    ...product,
    variants,
  };
}

async function getSellerProducts(userId) {
  return model.findProductsBySeller(userId);
}

async function getPublishedProducts() {
  return model.findPublishedProducts();
}

async function updateProduct(userId, productId, payload) {
  const product = await model.findProductById(productId);

  if (!product) {
    throw new Error('Merch product not found');
  }

  if (product.seller_id !== userId) {
    throw new Error('You do not own this product');
  }

  return model.updateProduct(productId, payload);
}

async function deleteProduct(userId, productId) {
  const product = await model.findProductById(productId);

  if (!product) {
    throw new Error('Merch product not found');
  }

  if (product.seller_id !== userId) {
    throw new Error('You do not own this product');
  }

  return model.deleteProduct(productId);
}

async function addVariant(userId, productId, payload) {
  const product = await model.findProductById(productId);

  if (!product) {
    throw new Error('Merch product not found');
  }

  if (product.seller_id !== userId) {
    throw new Error('You do not own this product');
  }

  if (!payload.sku) {
    throw new Error('SKU is required');
  }

  if (payload.price_inr_cents == null || payload.price_usd_cents == null) {
    throw new Error('Both INR and USD prices are required');
  }

  return model.createVariant({
    ...payload,
    merch_product_id: productId,
  });
}

async function updateVariant(userId, variantId, payload) {
  const variant = await model.findVariantById(variantId);

  if (!variant) {
    throw new Error('Variant not found');
  }

  const product = await model.findProductById(variant.merch_product_id);

  if (!product || product.seller_id !== userId) {
    throw new Error('You do not own this variant');
  }

  return model.updateVariant(variantId, payload);
}

async function deleteVariant(userId, variantId) {
  const variant = await model.findVariantById(variantId);

  if (!variant) {
    throw new Error('Variant not found');
  }

  const product = await model.findProductById(variant.merch_product_id);

  if (!product || product.seller_id !== userId) {
    throw new Error('You do not own this variant');
  }

  return model.deleteVariant(variantId);
}

module.exports = {
  createProduct,
  getProduct,
  getSellerProducts,
  getPublishedProducts,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
};
