import { postgresClient } from "./config"
import { logger } from "../utils/logger"

export interface DatabaseHealthStatus {
  isHealthy: boolean
  responseTime: number
  connections: {
    total: number
    active: number
    idle: number
    maxConnections: number
  }
  lastError?: string
  timestamp: Date
}

let lastHealthStatus: DatabaseHealthStatus | null = null
let lastCheckTime = 0
const CACHE_TTL = 60000 // 1 minute cache

export async function checkDatabaseHealth(forceCheck = false): Promise<DatabaseHealthStatus> {
  const now = Date.now()

  // Return cached result if available and not expired
  if (!forceCheck && lastHealthStatus && now - lastCheckTime < CACHE_TTL) {
    return lastHealthStatus
  }

  const startTime = now
  let isHealthy = false
  let lastError = undefined
  let connectionStats = {
    total: 0,
    active: 0,
    idle: 0,
    maxConnections: 0,
  }

  try {
    // Basic connectivity check
    const pingResult = await postgresClient.query("SELECT 1 as ping")
    isHealthy = pingResult.rows[0]?.ping === 1

    // Get connection pool stats
    const poolStatsResult = await postgresClient.query(`
      SELECT 
        count(*) as total_connections,
        sum(CASE WHEN state = 'active' THEN 1 ELSE 0 END) as active_connections,
        sum(CASE WHEN state = 'idle' THEN 1 ELSE 0 END) as idle_connections,
        max_connections
      FROM pg_stat_activity, 
        (SELECT setting::int as max_connections FROM pg_settings WHERE name = 'max_connections') as settings
      WHERE datname = current_database()
    `)

    if (poolStatsResult.rows.length > 0) {
      const stats = poolStatsResult.rows[0]
      connectionStats = {
        total: Number.parseInt(stats.total_connections),
        active: Number.parseInt(stats.active_connections),
        idle: Number.parseInt(stats.idle_connections),
        maxConnections: Number.parseInt(stats.max_connections),
      }
    }
  } catch (error) {
    isHealthy = false
    lastError = error.message
    logger.error("Database health check failed", { context: "db-health", error })
  }

  const responseTime = Date.now() - startTime

  // Update cache
  lastHealthStatus = {
    isHealthy,
    responseTime,
    connections: connectionStats,
    lastError,
    timestamp: new Date(),
  }
  lastCheckTime = now

  // Log warning if connection pool is getting full
  if (connectionStats.total > connectionStats.maxConnections * 0.8) {
    logger.warn("Database connection pool nearing capacity", {
      context: "db-health",
      data: {
        connections: connectionStats.total,
        maxConnections: connectionStats.maxConnections,
        usagePercentage: Math.round((connectionStats.total / connectionStats.maxConnections) * 100),
      },
    })
  }

  return lastHealthStatus
}

export async function getDatabaseMetrics(): Promise<Record<string, any>> {
  try {
    // Get database size
    const dbSizeResult = await postgresClient.query(`
      SELECT pg_database_size(current_database()) as size_bytes
    `)
    const dbSizeBytes = Number.parseInt(dbSizeResult.rows[0]?.size_bytes || "0")

    // Get table sizes and row counts
    const tableSizesResult = await postgresClient.query(`
      SELECT 
        table_name,
        pg_table_size(quote_ident(table_name)) as table_size_bytes,
        pg_indexes_size(quote_ident(table_name)) as index_size_bytes,
        (SELECT reltuples FROM pg_class WHERE relname = table_name) as row_estimate
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY pg_table_size(quote_ident(table_name)) DESC
    `)

    // Get query statistics
    const queryStatsResult = await postgresClient.query(`
      SELECT 
        calls, 
        total_time, 
        rows, 
        query
      FROM pg_stat_statements
      ORDER BY total_time DESC
      LIMIT 10
    `)

    return {
      databaseSize: {
        bytes: dbSizeBytes,
        megabytes: Math.round((dbSizeBytes / 1024 / 1024) * 100) / 100,
      },
      tables: tableSizesResult.rows.map((row) => ({
        name: row.table_name,
        sizeBytes: Number.parseInt(row.table_size_bytes),
        indexSizeBytes: Number.parseInt(row.index_size_bytes),
        totalSizeBytes: Number.parseInt(row.table_size_bytes) + Number.parseInt(row.index_size_bytes),
        estimatedRows: Number.parseInt(row.row_estimate),
      })),
      topQueries: queryStatsResult.rows.map((row) => ({
        query: row.query,
        calls: Number.parseInt(row.calls),
        totalTimeMs: Number.parseFloat(row.total_time),
        averageTimeMs: Number.parseFloat(row.total_time) / Number.parseInt(row.calls),
        rows: Number.parseInt(row.rows),
      })),
    }
  } catch (error) {
    logger.error("Failed to get database metrics", { context: "db-metrics", error })
    return {
      error: "Failed to get database metrics",
      message: error.message,
    }
  }
}

