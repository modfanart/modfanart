import { db } from './config';
import { logger } from '../utils/logger';
import { sql } from 'kysely';

export interface DatabaseHealthStatus {
  isHealthy: boolean;
  responseTime: number;
  connections: {
    total: number;
    active: number;
    idle: number;
    maxConnections: number;
  };
  lastError?: string;
  timestamp: Date;
}

let lastHealthStatus: DatabaseHealthStatus | null = null;
let lastCheckTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

/**
 * CHECK DATABASE HEALTH
 */
export async function checkDatabaseHealth(forceCheck = false): Promise<DatabaseHealthStatus> {
  const now = Date.now();

  if (!forceCheck && lastHealthStatus && now - lastCheckTime < CACHE_TTL) {
    return lastHealthStatus;
  }

  const startTime = now;
  let isHealthy = false;
  let lastError: string | undefined = undefined;
  let connectionStats = { total: 0, active: 0, idle: 0, maxConnections: 0 };

  try {
    // 1. Basic Ping
    const ping = await sql<{ ping: number }>`SELECT 1 as ping`.execute(db);
    isHealthy = ping.rows[0]?.ping === 1;

    // 2. Connection Pool Stats
    const poolStats = await sql<any>`
      SELECT 
        count(*)::int as total_connections,
        sum(CASE WHEN state = 'active' THEN 1 ELSE 0 END)::int as active_connections,
        sum(CASE WHEN state = 'idle' THEN 1 ELSE 0 END)::int as idle_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `.execute(db);

    if (poolStats.rows.length > 0) {
      const stats = poolStats.rows[0];
      connectionStats = {
        total: stats.total_connections,
        active: stats.active_connections,
        idle: stats.idle_connections,
        maxConnections: stats.max_connections,
      };
    }
  } catch (error: any) {
    isHealthy = false;
    lastError = error.message;
    logger.error('Database health check failed', { context: 'db-health', error });
  }

  lastHealthStatus = {
    isHealthy,
    responseTime: Date.now() - startTime,
    connections: connectionStats,
    timestamp: new Date(),
    ...(lastError ? { lastError } : {}),
  };

  lastCheckTime = now;

  if (connectionStats.total > connectionStats.maxConnections * 0.8) {
    logger.warn('Database connection pool nearing capacity', {
      context: 'db-health',
      data: {
        usage: Math.round((connectionStats.total / connectionStats.maxConnections) * 100) + '%',
      },
    });
  }

  return lastHealthStatus;
}

/**
 * GET DATABASE METRICS
 */
export async function getDatabaseMetrics(): Promise<Record<string, any>> {
  try {
    // Database size
    const dbSize = await sql<{
      size_bytes: string;
    }>`SELECT pg_database_size(current_database())`.execute(db);
    const bytes = Number(dbSize.rows[0]?.size_bytes || 0);

    // Table statistics
    const tableStats = await sql<any>`
      SELECT 
        table_name,
        pg_table_size(quote_ident(table_name))::bigint as table_size_bytes,
        pg_indexes_size(quote_ident(table_name))::bigint as index_size_bytes,
        (SELECT reltuples FROM pg_class WHERE relname = table_name) as row_estimate
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_size_bytes DESC
    `.execute(db);

    // Query performance (Requires pg_stat_statements extension)
    const queryStats = await sql<any>`
      SELECT calls, total_exec_time as total_time, rows, query 
      FROM pg_stat_statements 
      ORDER BY total_exec_time DESC LIMIT 10
    `.execute(db);

    return {
      databaseSize: { bytes, megabytes: Math.round(bytes / 1024 / 1024) },
      tables: tableStats.rows.map((row) => ({
        name: row.table_name,
        totalSizeBytes: Number(row.table_size_bytes) + Number(row.index_size_bytes),
        estimatedRows: Number(row.row_estimate),
      })),
      topQueries: queryStats.rows.map((row) => ({
        query: row.query,
        calls: Number(row.calls),
        avgTimeMs: Number(row.total_time) / Number(row.calls),
      })),
    };
  } catch (error: any) {
    logger.error('Failed to get database metrics', { context: 'db-metrics', error });
    return { error: error.message };
  }
}
