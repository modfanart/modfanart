// backend/src/models/product.js
const { db } = require('../config');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

// Zod schemas — copy these from frontend/validation/model-validation.js
const z = require('zod');

const ProductStatusEnum = z.enum(['active', 'inactive', 'draft', 'archived']);

const CreateProductSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url(),
  category: z.string().min(1),
  artist: z.string().min(1),
  brand: z.string().min(1),
  status: ProductStatusEnum.default('active'),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  artistId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  inventory: z.number().int().nonnegative().optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdateProductSchema = CreateProductSchema.partial();

// ─────────────────────────────────────────────
//              Helpers
// ─────────────────────────────────────────────

function mapRowToProduct(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    category: row.category,
    artist: row.artist,
    brand: row.brand,
    status: row.status,
    isNew: !!row.is_new,
    isBestseller: !!row.is_bestseller,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    artistId: row.artist_id ?? undefined,
    brandId: row.brand_id ?? undefined,
    inventory: row.inventory ?? undefined,
    metadata: row.metadata && typeof row.metadata === 'string'
      ? JSON.parse(row.metadata)
      : row.metadata ?? undefined,
  };
}

// ─────────────────────────────────────────────
//              CRUD Operations
// ─────────────────────────────────────────────

async function createProduct(productData) {
  const validation = CreateProductSchema.safeParse(productData);
  if (!validation.success) {
    throw new Error(`Invalid product data: ${JSON.stringify(validation.error.issues)}`);
  }

  const id = uuidv4();
  const now = new Date();

  const product = {
    id,
    ...validation.data,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db
      .insertInto('products')
      .values({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        image_url: product.imageUrl,
        category: product.category,
        artist: product.artist,
        brand: product.brand,
        status: product.status,
        is_new: product.isNew,
        is_bestseller: product.isBestseller,
        created_at: product.createdAt,
        updated_at: product.updatedAt,
        artist_id: product.artistId ?? null,
        brand_id: product.brandId ?? null,
        inventory: product.inventory ?? null,
        metadata: product.metadata ?? {},
      })
      .execute();

    logger.info('Product created successfully', {
      context: 'product-model',
      productId: product.id,
    });

    return product;
  } catch (error) {
    logger.error('Failed to create product', {
      context: 'product-model',
      error: error.message,
      productId: id,
    });
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

async function getProductById(id) {
  const row = await db
    .selectFrom('products')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return row ? mapRowToProduct(row) : null;
}

async function getProductsByCategory(category) {
  const rows = await db
    .selectFrom('products')
    .selectAll()
    .where('category', '=', category)
    .where('status', '=', 'active')
    .orderBy('is_bestseller', 'desc')
    .orderBy('is_new', 'desc')
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map(mapRowToProduct);
}

async function getProductsByArtist(artistId) {
  const rows = await db
    .selectFrom('products')
    .selectAll()
    .where('artist_id', '=', artistId)
    .where('status', '=', 'active')
    .orderBy('is_bestseller', 'desc')
    .orderBy('is_new', 'desc')
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map(mapRowToProduct);
}

async function getProductsByBrand(brand) {
  const rows = await db
    .selectFrom('products')
    .selectAll()
    .where('brand', '=', brand)
    .where('status', '=', 'active')
    .orderBy('is_bestseller', 'desc')
    .orderBy('is_new', 'desc')
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map(mapRowToProduct);
}

async function getAllActiveProducts() {
  const rows = await db
    .selectFrom('products')
    .selectAll()
    .where('status', '=', 'active')
    .orderBy('is_bestseller', 'desc')
    .orderBy('is_new', 'desc')
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map(mapRowToProduct);
}

async function updateProduct(id, productData) {
  const validation = UpdateProductSchema.safeParse(productData);
  if (!validation.success) {
    throw new Error(`Invalid update data: ${JSON.stringify(validation.error.issues)}`);
  }

  const existing = await db
    .selectFrom('products')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!existing) return null;

  const updatedAt = new Date();
  const updatePayload = { updated_at: updatedAt };

  if ('title' in productData) updatePayload.title = productData.title;
  if ('description' in productData) updatePayload.description = productData.description;
  if ('price' in productData) updatePayload.price = productData.price;
  if ('imageUrl' in productData) updatePayload.image_url = productData.imageUrl;
  if ('category' in productData) updatePayload.category = productData.category;
  if ('artist' in productData) updatePayload.artist = productData.artist;
  if ('brand' in productData) updatePayload.brand = productData.brand;
  if ('status' in productData) updatePayload.status = productData.status;
  if ('isNew' in productData) updatePayload.is_new = productData.isNew;
  if ('isBestseller' in productData) updatePayload.is_bestseller = productData.isBestseller;
  if ('artistId' in productData) updatePayload.artist_id = productData.artistId ?? null;
  if ('brandId' in productData) updatePayload.brand_id = productData.brandId ?? null;
  if ('inventory' in productData) updatePayload.inventory = productData.inventory ?? null;
  if ('metadata' in productData) updatePayload.metadata = productData.metadata ?? null;

  await db.updateTable('products').set(updatePayload).where('id', '=', id).execute();

  const updated = {
    ...mapRowToProduct(existing),
    ...productData,
    updatedAt,
  };

  logger.info('Product updated', { context: 'product-model', productId: id });
  return updated;
}

async function deleteProduct(id) {
  const result = await db.deleteFrom('products').where('id', '=', id).executeTakeFirst();
  const deleted = Number(result.numDeletedRows) > 0;

  if (deleted) {
    logger.info('Product deleted', { context: 'product-model', productId: id });
  }

  return deleted;
}

module.exports = {
  createProduct,
  getProductById,
  getProductsByCategory,
  getProductsByArtist,
  getProductsByBrand,
  getAllActiveProducts,
  updateProduct,
  deleteProduct,
};