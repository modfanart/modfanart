const { db } = require('../../config');
const model = require('./models/merch.model');
const BrandManager = require('../brands/models/brandManager.model');
const Artwork = require('../artworks/models/artwork.model');
const License = require('../licenses/models/license.model');
const sellerProfileModel = require('./models/sellerProfile.model');
const ModerationQueue = require('../moderation/models/moderation.model');

const VALID_FULFILLMENT_TYPES = [
  'print_on_demand',
  'in_house_stock',
  'dropship',
];

// Resolved open question #1: any user can sell, but an individual (no
// brand_id) needs an approved seller_profile first — a brand-backed listing
// is implicitly trusted the same way brand_verification_requests already
// vouches for brands elsewhere in the app.
async function assertCanSell(userId, brandId, trx) {
  if (brandId) {
    const access = await BrandManager.hasAccess(brandId, userId, [
      'owner',
      'manager',
    ]);

    if (!access) {
      throw new Error('You do not manage this brand');
    }

    return;
  }

  const profile = await sellerProfileModel.findByUser(userId, trx);

  if (!profile || profile.status !== 'approved') {
    throw new Error(
      'You need an approved seller profile before listing standalone merch'
    );
  }
}

// Resolved open question #2: printing your own artwork onto merch needs no
// license — you already own the rights. Printing someone else's artwork
// requires a commercial or exclusive license you (the merch seller) hold
// for that exact artwork; merch_products.license_id records which one.
async function assertArtworkUsageAllowed(userId, artworkId, licenseId, trx) {
  const artwork = await Artwork.findById(artworkId);

  if (!artwork) {
    throw new Error('Artwork not found');
  }

  if (artwork.creator_id === userId) {
    return null; // own artwork, no license needed
  }

  if (!licenseId) {
    throw new Error(
      'A commercial or exclusive license for this artwork is required to print it on merch'
    );
  }

  const license = await License.findById(licenseId);

  if (!license || license.artwork_id !== artworkId) {
    throw new Error('License does not match this artwork');
  }

  if (license.buyer_id !== userId) {
    throw new Error('This license does not belong to you');
  }

  if (!license.is_active || license.revoked_at) {
    throw new Error('This license is not active');
  }

  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    throw new Error('This license has expired');
  }

  if (!['commercial', 'exclusive'].includes(license.license_type)) {
    throw new Error(
      'A personal-use license does not grant merch printing rights'
    );
  }

  return licenseId;
}

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
    await assertCanSell(userId, payload.brand_id || null, trx);

    if (payload.print_provider_id) {
      const provider = await model.findPrintProviderById(
        payload.print_provider_id,
        trx
      );

      if (!provider) {
        throw new Error('Print provider not found');
      }
    }

    let licenseId = null;

    if (payload.artwork_id) {
      licenseId = await assertArtworkUsageAllowed(
        userId,
        payload.artwork_id,
        payload.license_id,
        trx
      );
    }

    const product = await model.createProduct(
      {
        ...payload,
        seller_id: userId,
        license_id: licenseId,
        status: 'draft',
      },
      trx
    );

    return product;
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

  if (payload.status === 'published') {
    throw new Error(
      'Products go live through moderation review, not a direct status update — call submitForReview instead'
    );
  }

  return model.updateProduct(productId, payload);
}

// Reuses the existing generic moderation_queue (entity_type/entity_id)
// rather than a merch-specific table — per the doc's §04 note that it's
// already reusable for this.
async function submitForReview(userId, productId) {
  const product = await model.findProductById(productId);

  if (!product) {
    throw new Error('Merch product not found');
  }

  if (product.seller_id !== userId) {
    throw new Error('You do not own this product');
  }

  if (!['draft', 'rejected'].includes(product.status)) {
    throw new Error(`Cannot submit a product in "${product.status}" status`);
  }

  const variants = await model.findVariantsByProduct(productId);

  if (!variants.length) {
    throw new Error('Add at least one variant before submitting for review');
  }

  return db.transaction().execute(async (trx) => {
    const updated = await model.updateProduct(
      productId,
      { status: 'pending_review' },
      trx
    );

    await ModerationQueue.enqueue('merch_product', productId);

    return updated;
  });
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

// Admin decision on a merch listing that was submitted for review. This
// talks to the shared moderation_queue directly rather than through
// modules/moderation's HTTP layer — that controller/routes pairing has
// unrelated pre-existing wiring bugs (wrong middleware import paths) and is
// effectively unreachable today; wiring this straight to the model keeps
// merch moderation working without depending on fixing that separately.
async function moderateProduct(reviewerId, productId, decision, notes) {
  if (!['approved', 'rejected'].includes(decision)) {
    throw new Error('Decision must be "approved" or "rejected"');
  }

  const product = await model.findProductById(productId);

  if (!product) {
    throw new Error('Merch product not found');
  }

  if (product.status !== 'pending_review') {
    throw new Error(`Product is not pending review (status: ${product.status})`);
  }

  const queueItem = await ModerationQueue.findPendingFor(
    'merch_product',
    productId
  );

  return db.transaction().execute(async (trx) => {
    if (queueItem) {
      await ModerationQueue.decide(queueItem.id, reviewerId, decision, notes);
    }

    return model.updateProduct(
      productId,
      { status: decision === 'approved' ? 'published' : 'rejected' },
      trx
    );
  });
}

module.exports = {
  createProduct,
  getProduct,
  getSellerProducts,
  getPublishedProducts,
  updateProduct,
  submitForReview,
  moderateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
};
