import { logger } from "../utils/logger"

type CacheItem<T> = {
  value: T
  expiresAt: number
}

class DatabaseCache {
  private cache: Map<string, CacheItem<any>> = new Map()
  private defaultTtl: number
  private maxSize: number

  constructor(options: { defaultTtl?: number; maxSize?: number } = {}) {
    this.defaultTtl = options.defaultTtl || 60000 // 1 minute default TTL
    this.maxSize = options.maxSize || 1000 // Default max 1000 items
  }

  /**
   * Get an item from the cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  /**
   * Set an item in the cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Enforce max size by removing oldest items if needed
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    const expiresAt = Date.now() + (ttl || this.defaultTtl)
    this.cache.set(key, { value, expiresAt })
  }

  /**
   * Delete an item from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get or set an item with a callback function
   */
  async getOrSet<T>(key: string, callback: () => Promise<T>, ttl?: number): Promise<T> {
    const cachedValue = this.get<T>(key)

    if (cachedValue !== null) {
      return cachedValue
    }

    try {
      const value = await callback()
      this.set(key, value, ttl)
      return value
    } catch (error) {
      logger.error("Cache callback error", { context: "db-cache", error, data: { key } })
      throw error
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this._hitRate,
    }
  }

  // Cache hit rate tracking
  private _hits = 0
  private _misses = 0

  private get _hitRate(): number {
    const total = this._hits + this._misses
    return total === 0 ? 0 : this._hits / total
  }
}

// Create a global cache instance
export const dbCache = new DatabaseCache()

// Helper function to create a cache key
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${JSON.stringify(params[key])}`)
    .join("|")

  return `${prefix}:${sortedParams}`
}

