import { db, DB } from '../config';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateProductSchema,
  UpdateProductSchema,
  validateModel,
} from '../../validation/model-validation';
import { logger } from '../../utils/logger';
import type { Database } from '../config';

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  artist: string;
  brand: string;
  status: ProductStatus;
  isNew: boolean;
  isBestseller: boolean;
  createdAt: Date;
  updatedAt: Date;
  artistId?: string;
  brandId?: string;
  inventory?: number;
  metadata?: Record<string, any>;
}

/**
 * CREATE PRODUCT
 */
export async function createProduct(
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Product> {
  const validation = validateModel(productData, CreateProductSchema, 'createProduct');
  if (!validation.success) {
    throw new Error(`Invalid product data: ${JSON.stringify(validation.errors)}`);
  }

  const id = uuidv4();
  const now = new Date();

  const product: Product = {
    id,
    ...productData,
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
        metadata: product.metadata ?? {}, // ← Pass object directly (or null if column allows)
      })
      .execute();

    logger.info('Product created successfully', {
      context: 'product-model',
      productId: product.id,
    });

    return product;
  } catch (error: any) {
    logger.error('Failed to create product', {
      context: 'product-model',
      error,
      productId: id,
    });
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

/**
 * GET BY ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const row = await db.selectFrom('products').selectAll().where('id', '=', id).executeTakeFirst();

  return row ? mapRowToProduct(row) : null;
}

/**
 * GET BY CATEGORY
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
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

/**
 * UPDATE PRODUCT
 */
export async function updateProduct(
  id: string,
  productData: Partial<Product>
): Promise<Product | null> {
  const validation = validateModel(productData, UpdateProductSchema, 'updateProduct');
  if (!validation.success) {
    throw new Error(`Invalid update data: ${JSON.stringify(validation.errors)}`);
  }

  return await db.transaction().execute(async (trx) => {
    const existing = await trx
      .selectFrom('products')
      .selectAll()
      .where('id', '=', id)
      .forUpdate()
      .executeTakeFirst();

    if (!existing) return null;

    const updatedAt = new Date();

    const updatePayload: Partial<Database['products']> = {
      updated_at: updatedAt,
    };

    if (productData.title !== undefined) updatePayload.title = productData.title;
    if (productData.description !== undefined) updatePayload.description = productData.description;
    if (productData.price !== undefined) updatePayload.price = productData.price;
    if (productData.imageUrl !== undefined) updatePayload.image_url = productData.imageUrl;
    if (productData.category !== undefined) updatePayload.category = productData.category;
    if (productData.artist !== undefined) updatePayload.artist = productData.artist;
    if (productData.brand !== undefined) updatePayload.brand = productData.brand;
    if (productData.status !== undefined) updatePayload.status = productData.status;
    if (productData.isNew !== undefined) updatePayload.is_new = productData.isNew;
    if (productData.isBestseller !== undefined)
      updatePayload.is_bestseller = productData.isBestseller;
    if (productData.artistId !== undefined) updatePayload.artist_id = productData.artistId ?? null;
    if (productData.brandId !== undefined) updatePayload.brand_id = productData.brandId ?? null;
    if (productData.inventory !== undefined)
      updatePayload.inventory = productData.inventory ?? null;

    // JSON field — pass object directly
    if (productData.metadata !== undefined) {
      updatePayload.metadata = productData.metadata ?? null;
    }

    await trx.updateTable('products').set(updatePayload).where('id', '=', id).execute();

    const current = mapRowToProduct(existing);
    const updated: Product = {
      ...current,
      ...productData,
      updatedAt,
      ...(productData.metadata !== undefined ? { metadata: productData.metadata } : {}),
    };

    logger.info('Product updated', { context: 'product-model', productId: id });
    return updated;
  });
}

/**
 * DELETE PRODUCT
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const result = await db.deleteFrom('products').where('id', '=', id).executeTakeFirst();

  const deleted = Number(result.numDeletedRows) > 0;
  if (deleted) {
    logger.info('Product deleted', { context: 'product-model', productId: id });
  }
  return deleted;
}

/**
 * MAPPER
 */
function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    category: row.category,
    artist: row.artist,
    brand: row.brand,
    status: row.status as ProductStatus,
    isNew: !!row.is_new,
    isBestseller: !!row.is_bestseller,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    artistId: row.artist_id ?? undefined,
    brandId: row.brand_id ?? undefined,
    inventory: row.inventory ?? undefined,
    metadata:
      row.metadata && typeof row.metadata === 'string'
        ? JSON.parse(row.metadata)
        : (row.metadata ?? undefined),
  };
}
/**
 * GET PRODUCTS BY ARTIST ID
 */
export async function getProductsByArtist(artistId: string): Promise<Product[]> {
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

/**
 * GET PRODUCTS BY BRAND NAME
 */
export async function getProductsByBrand(brand: string): Promise<Product[]> {
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

/**
 * GET ALL ACTIVE PRODUCTS (Optional - for default marketplace view)
 */
export async function getAllActiveProducts(): Promise<Product[]> {
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
