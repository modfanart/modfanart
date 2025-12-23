import { postgresClient, DB } from "../config"
import { v4 as uuidv4 } from "uuid"
import { CreateProductSchema, UpdateProductSchema, validateModel } from "../../validation/model-validation"
import { logger } from "../../utils/logger"

export type ProductStatus = "active" | "inactive" | "draft" | "archived"

export interface Product {
  id: string
  title: string
  description: string
  price: number
  imageUrl: string
  category: string
  artist: string
  brand: string
  status: ProductStatus
  isNew: boolean
  isBestseller: boolean
  createdAt: Date
  updatedAt: Date
  artistId?: string
  brandId?: string
  inventory?: number
  metadata?: Record<string, any>
}

export async function createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  // Validate input data
  const validation = validateModel(productData, CreateProductSchema, "createProduct")
  if (!validation.success) {
    throw new Error(`Invalid product data: ${JSON.stringify(validation.errors?.errors)}`)
  }

  const id = uuidv4()
  const now = new Date()

  const product: Product = {
    id,
    ...productData,
    createdAt: now,
    updatedAt: now,
  }

  try {
    await postgresClient.sql`
      INSERT INTO ${DB.PRODUCTS} (
        id, title, description, price, image_url, category, 
        artist, brand, status, is_new, is_bestseller, 
        created_at, updated_at, artist_id, brand_id, inventory, metadata
      ) VALUES (
        ${product.id}, ${product.title}, ${product.description}, 
        ${product.price}, ${product.imageUrl}, ${product.category}, 
        ${product.artist}, ${product.brand}, ${product.status}, 
        ${product.isNew}, ${product.isBestseller}, ${product.createdAt}, 
        ${product.updatedAt}, ${product.artistId || null}, 
        ${product.brandId || null}, ${product.inventory || null}, 
        ${JSON.stringify(product.metadata || {})}
      )
    `

    logger.info("Product created successfully", {
      context: "product-model",
      data: { productId: id, title: product.title },
    })

    return product
  } catch (error) {
    logger.error("Failed to create product", {
      context: "product-model",
      error,
      data: { title: product.title },
    })
    throw new Error(`Failed to create product: ${error.message}`)
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid product ID")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.PRODUCTS} WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return null
    }

    return mapRowToProduct(result.rows[0])
  } catch (error) {
    logger.error("Failed to get product by ID", {
      context: "product-model",
      error,
      data: { productId: id },
    })
    throw new Error(`Failed to get product: ${error.message}`)
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  if (!category || typeof category !== "string") {
    throw new Error("Invalid category")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.PRODUCTS} 
      WHERE category = ${category} AND status = 'active'
      ORDER BY is_bestseller DESC, is_new DESC, created_at DESC
    `

    return result.rows.map(mapRowToProduct)
  } catch (error) {
    logger.error("Failed to get products by category", {
      context: "product-model",
      error,
      data: { category },
    })
    throw new Error(`Failed to get products: ${error.message}`)
  }
}

export async function getProductsByArtist(artistId: string): Promise<Product[]> {
  if (!artistId || typeof artistId !== "string") {
    throw new Error("Invalid artist ID")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.PRODUCTS} 
      WHERE artist_id = ${artistId} AND status = 'active'
      ORDER BY is_bestseller DESC, is_new DESC, created_at DESC
    `

    return result.rows.map(mapRowToProduct)
  } catch (error) {
    logger.error("Failed to get products by artist", {
      context: "product-model",
      error,
      data: { artistId },
    })
    throw new Error(`Failed to get products: ${error.message}`)
  }
}

export async function getProductsByBrand(brandId: string): Promise<Product[]> {
  if (!brandId || typeof brandId !== "string") {
    throw new Error("Invalid brand ID")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.PRODUCTS} 
      WHERE brand_id = ${brandId} AND status = 'active'
      ORDER BY is_bestseller DESC, is_new DESC, created_at DESC
    `

    return result.rows.map(mapRowToProduct)
  } catch (error) {
    logger.error("Failed to get products by brand", {
      context: "product-model",
      error,
      data: { brandId },
    })
    throw new Error(`Failed to get products: ${error.message}`)
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
  // Validate input data
  const validation = validateModel(productData, UpdateProductSchema, "updateProduct")
  if (!validation.success) {
    throw new Error(`Invalid product data: ${JSON.stringify(validation.errors?.errors)}`)
  }

  try {
    // Start transaction
    const client = await postgresClient.connect()

    try {
      await client.sql`BEGIN`

      // Get current product data
      const getProductResult = await client.sql`
        SELECT * FROM ${DB.PRODUCTS} WHERE id = ${id} FOR UPDATE
      `

      if (getProductResult.rows.length === 0) {
        await client.sql`ROLLBACK`
        return null
      }

      const currentProduct = mapRowToProduct(getProductResult.rows[0])

      const updatedProduct = {
        ...currentProduct,
        ...productData,
        updatedAt: new Date(),
      }

      await client.sql`
        UPDATE ${DB.PRODUCTS} SET
          title = ${updatedProduct.title},
          description = ${updatedProduct.description},
          price = ${updatedProduct.price},
          image_url = ${updatedProduct.imageUrl},
          category = ${updatedProduct.category},
          artist = ${updatedProduct.artist},
          brand = ${updatedProduct.brand},
          status = ${updatedProduct.status},
          is_new = ${updatedProduct.isNew},
          is_bestseller = ${updatedProduct.isBestseller},
          updated_at = ${updatedProduct.updatedAt},
          artist_id = ${updatedProduct.artistId || null},
          brand_id = ${updatedProduct.brandId || null},
          inventory = ${updatedProduct.inventory || null},
          metadata = ${JSON.stringify(updatedProduct.metadata || {})}
        WHERE id = ${id}
      `

      await client.sql`COMMIT`

      logger.info("Product updated successfully", {
        context: "product-model",
        data: { productId: id },
      })

      return updatedProduct
    } catch (error) {
      await client.sql`ROLLBACK`
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error("Failed to update product", {
      context: "product-model",
      error,
      data: { productId: id },
    })
    throw new Error(`Failed to update product: ${error.message}`)
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid product ID")
  }

  try {
    const result = await postgresClient.sql`
      DELETE FROM ${DB.PRODUCTS} WHERE id = ${id}
    `

    const deleted = result.rowCount > 0

    if (deleted) {
      logger.info("Product deleted successfully", {
        context: "product-model",
        data: { productId: id },
      })
    } else {
      logger.warn("Product not found for deletion", {
        context: "product-model",
        data: { productId: id },
      })
    }

    return deleted
  } catch (error) {
    logger.error("Failed to delete product", {
      context: "product-model",
      error,
      data: { productId: id },
    })
    throw new Error(`Failed to delete product: ${error.message}`)
  }
}

function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    imageUrl: row.image_url,
    category: row.category,
    artist: row.artist,
    brand: row.brand,
    status: row.status,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    artistId: row.artist_id,
    brandId: row.brand_id,
    inventory: row.inventory,
    metadata: row.metadata,
  }
}

