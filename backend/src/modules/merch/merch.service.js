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

  if (artwork.status !== 'published') {
    throw new Error('This artwork is not published and cannot be used on merch');
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

// The seller who created a product may always manage it; so may any owner or
// manager of the brand it is listed under (a brand's catalogue belongs to
// the brand, not to whichever manager happened to click "create").
async function assertCanManage(userId, product, message = 'You do not own this product') {
  if (!product) throw new Error('Merch product not found');
  if (product.seller_id === userId) return;

  if (product.brand_id) {
    const access = await BrandManager.hasAccess(product.brand_id, userId, [
      'owner',
      'manager',
    ]);

    if (access) return;
  }

  throw new Error(message);
}

function assertValidPrice(cents) {
  if (!Number.isInteger(cents) || cents < 0) {
    throw new Error('A USD price (in cents) of 0 or more is required');
  }
}

function assertValidStock(qty) {
  if (qty == null) return;

  if (!Number.isInteger(qty) || qty < 0) {
    throw new Error('Stock must be a whole number of 0 or more');
  }
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
  const product = await model.findEnrichedById(id);

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
  return model.findEnrichedManagedBy(userId);
}

async function getPublishedProducts(filters = {}) {
  return model.findEnrichedPublished(filters);
}

// Admin moderation queue: everything a seller has submitted for review.
async function getPendingReviewProducts() {
  return model.findEnrichedByStatus('pending_review');
}

async function listPrintProviders() {
  return model.listPrintProviders();
}

async function getSellerSummary(userId) {
  const sales = await model.getSellerSalesSummary(userId);
  const products = await model.findProductsBySeller(userId);

  const byStatus = products.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return {
    orders_count: sales?.orders_count ?? 0,
    units_sold: sales?.units_sold ?? 0,
    gross_cents: Number(sales?.gross_cents ?? 0),
    products_total: products.length,
    products_by_status: byStatus,
  };
}

async function updateProduct(userId, productId, payload) {
  const product = await model.findProductById(productId);

  if (!product) {
    throw new Error('Merch product not found');
  }

  await assertCanManage(userId, product);

  if (payload.status === 'published') {
    throw new Error(
      'Products go live through moderation review, not a direct status update — call submitForReview instead'
    );
  }

  // Whitelist editable fields. Status, seller_id, license_id etc. are
  // controlled by the moderation / ownership flows, not the request body.
  const patch = {};

  // Listing copy is what moderation approved. Changing it on a live or
  // in-review product would bypass review, so it's only editable while the
  // product is a draft, rejected or archived. Prices and stock (variants)
  // stay editable at any time.
  if (
    (payload.title !== undefined || payload.description !== undefined) &&
    !['draft', 'rejected', 'archived'].includes(product.status)
  ) {
    throw new Error(
      'Title and description can only be edited on a draft, rejected or archived product. Archive it, edit, then submit for review again.'
    );
  }

  if (payload.title !== undefined) {
    if (!String(payload.title).trim()) throw new Error('Title cannot be empty');
    patch.title = String(payload.title).trim();
  }

  if (payload.description !== undefined) patch.description = payload.description;

  // A suspended listing was pulled by an admin; the seller can't archive or
  // restore it to get around that.
  if (product.status === 'suspended') {
    throw new Error('This product was suspended by an admin. Contact support to have it reviewed.');
  }

  if (payload.status !== undefined) {
    if (!['draft', 'archived'].includes(payload.status)) {
      throw new Error(
        'Status can only be set to draft or archived here; use submit-for-review to go live'
      );
    }
    patch.status = payload.status;
  }

  if (!Object.keys(patch).length) {
    throw new Error('Nothing to update');
  }

  patch.updated_at = new Date().toISOString();

  return model.updateProduct(productId, patch);
}

// Reuses the existing generic moderation_queue (entity_type/entity_id)
// rather than a merch-specific table — per the doc's §04 note that it's
// already reusable for this.
async function submitForReview(userId, productId) {
  const product = await model.findProductById(productId);

  if (!product) {
    throw new Error('Merch product not found');
  }

  await assertCanManage(userId, product);

  if (!['draft', 'rejected'].includes(product.status)) {
    throw new Error(`Cannot submit a product in "${product.status}" status`);
  }

  const variants = await model.findVariantsByProduct(productId);

  if (!variants.length) {
    throw new Error('Add at least one variant before submitting for review');
  }

  // The artwork/licence link was checked when it was made; re-check now so a
  // licence that has since expired or been revoked can't slip into review.
  if (product.artwork_id) {
    await assertArtworkUsageAllowed(
      product.seller_id,
      product.artwork_id,
      product.license_id,
      db
    );
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

  await assertCanManage(userId, product);

  // A product that has already sold can't be hard-deleted without orphaning
  // order history (and the buyer's receipt). Archive it instead.
  if (await model.countSoldItemsForProduct(productId)) {
    throw new Error(
      'This product has orders against it and cannot be deleted. Archive it instead.'
    );
  }

  return model.deleteProduct(productId);
}

async function addVariant(userId, productId, payload) {
  const product = await model.findProductById(productId);

  if (!product) {
    throw new Error('Merch product not found');
  }

  await assertCanManage(userId, product);

  if (!payload.sku) {
    throw new Error('SKU is required');
  }

  assertValidPrice(payload.price_usd_cents);
  assertValidStock(payload.stock_qty);

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

  await assertCanManage(userId, product, 'You do not own this variant');

  // Whitelist: never pass the raw body to the UPDATE (it could re-parent
  // the variant onto another product or rewrite its id/created_at).
  const patch = {};

  if (payload.price_usd_cents !== undefined) {
    assertValidPrice(payload.price_usd_cents);
    patch.price_usd_cents = payload.price_usd_cents;
  }

  if (payload.stock_qty !== undefined) {
    assertValidStock(payload.stock_qty);
    patch.stock_qty = payload.stock_qty;
  }

  for (const key of [
    'sku',
    'size',
    'color',
    'material',
    'weight_grams',
    'print_file_url',
    'is_active',
  ]) {
    if (payload[key] !== undefined) patch[key] = payload[key];
  }

  if (!Object.keys(patch).length) {
    throw new Error('Nothing to update');
  }

  return model.updateVariant(variantId, patch);
}

async function deleteVariant(userId, variantId) {
  const variant = await model.findVariantById(variantId);

  if (!variant) {
    throw new Error('Variant not found');
  }

  const product = await model.findProductById(variant.merch_product_id);

  await assertCanManage(userId, product, 'You do not own this variant');

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

// Artworks a user may print on merch: their own, plus artworks they hold an
// active commercial/exclusive licence for. For a brand listing, access to the
// brand is verified first. Each row carries the license_id the client must
// send back when linking a licensed artwork.
async function getEligibleArtworks(userId, brandId = null) {
  if (brandId) {
    const access = await BrandManager.hasAccess(brandId, userId, [
      'owner',
      'manager',
    ]);

    if (!access) throw new Error('You do not manage this brand');
  }

  const own = await db
    .selectFrom('artworks')
    .select(['id', 'title', 'thumbnail_url'])
    .where('creator_id', '=', userId)
    .where('status', '=', 'published')
    .where('deleted_at', 'is', null)
    .orderBy('created_at', 'desc')
    .execute();

  const licensed = await db
    .selectFrom('licenses as l')
    .innerJoin('artworks as a', 'a.id', 'l.artwork_id')
    .select([
      'a.id as id',
      'a.title as title',
      'a.thumbnail_url as thumbnail_url',
      'l.id as license_id',
      'l.license_type as license_type',
      'l.expires_at as license_expires_at',
    ])
    .where('l.buyer_id', '=', userId)
    .where('l.is_active', '=', true)
    .where('l.revoked_at', 'is', null)
    .where('l.license_type', 'in', ['commercial', 'exclusive'])
    .where('a.status', '=', 'published')
    .where('a.deleted_at', 'is', null)
    .where('a.creator_id', '!=', userId)
    .where((eb) =>
      eb.or([
        eb('l.expires_at', 'is', null),
        eb('l.expires_at', '>', new Date().toISOString()),
      ])
    )
    .orderBy('l.created_at', 'desc')
    .execute();

  return [
    ...own.map((a) => ({ ...a, source: 'own', license_id: null })),
    ...licensed.map((a) => ({ ...a, source: 'licensed' })),
  ];
}

// Link (or unlink, with artwork_id = null) an artwork on an existing product.
// Only while the product is a draft/rejected: changing the artwork on a live
// or in-review listing would sidestep moderation.
async function setArtwork(userId, productId, { artwork_id, license_id } = {}) {
  const product = await model.findProductById(productId);

  await assertCanManage(userId, product);

  if (!['draft', 'rejected'].includes(product.status)) {
    throw new Error(
      'The artwork can only be changed while the product is a draft or has been rejected'
    );
  }

  if (!artwork_id) {
    return model.updateProduct(productId, {
      artwork_id: null,
      license_id: null,
      updated_at: new Date().toISOString(),
    });
  }

  // Licences are held by whoever bought them; for a brand product that is
  // the acting manager, so validate against the person making the change.
  const licenseId = await assertArtworkUsageAllowed(
    userId,
    artwork_id,
    license_id,
    db
  );

  return model.updateProduct(productId, {
    artwork_id,
    license_id: licenseId,
    updated_at: new Date().toISOString(),
  });
}

module.exports = {
  getEligibleArtworks,
  setArtwork,
  createProduct,
  getProduct,
  getSellerProducts,
  getPublishedProducts,
  getPendingReviewProducts,
  listPrintProviders,
  getSellerSummary,
  updateProduct,
  submitForReview,
  moderateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
};
