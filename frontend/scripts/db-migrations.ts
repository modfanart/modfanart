import { logger } from '../lib/utils/logger';
import fs from 'fs';
import path from 'path';
import { Pool, PoolClient } from 'pg';

const MIGRATIONS_TABLE = 'schema_migrations';

// Initialize Postgres pool locally
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
});

/**
 * Create the migrations table if it doesn't exist
 */
async function createMigrationsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    logger.info('Migrations table created or verified', { context: 'db-migration' });
  } catch (error: unknown) {
    logger.error('Failed to create migrations table', {
      context: 'db-migration',
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
}

/**
 * Get all previously applied migrations
 */
async function getAppliedMigrations(): Promise<string[]> {
  try {
    const result = await pool.query(`SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id`);
    return result.rows.map((row) => row.name);
  } catch (error: unknown) {
    logger.error('Failed to get applied migrations', {
      context: 'db-migration',
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
}

/**
 * Mark a migration as applied in the database
 */
async function markMigrationAsApplied(name: string, client: PoolClient) {
  try {
    await client.query(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`, [name]);
    logger.info(`Migration marked as applied: ${name}`, { context: 'db-migration' });
  } catch (error: unknown) {
    logger.error(`Failed to mark migration as applied: ${name}`, {
      context: 'db-migration',
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
}

/**
 * Run a single migration inside a transaction
 */
async function runMigration(name: string, sql: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    logger.info(`Running migration: ${name}`, { context: 'db-migration' });

    await client.query(sql);
    await markMigrationAsApplied(name, client);

    await client.query('COMMIT');
    logger.info(`Migration completed: ${name}`, { context: 'db-migration' });
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    logger.error(`Migration failed: ${name}`, {
      context: 'db-migration',
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run all migrations from the ../migrations directory
 */
async function runMigrations() {
  try {
    await createMigrationsTable();
    const appliedMigrations = await getAppliedMigrations();

    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        await runMigration(file, sql);
      }
    }

    logger.info('All migrations completed successfully', { context: 'db-migration' });
  } catch (error: unknown) {
    logger.error('Migration process failed', {
      context: 'db-migration',
      error: error instanceof Error ? error : new Error(String(error)),
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration script completed', { context: 'db-migration' });
      process.exit(0);
    })
    .catch((error: unknown) => {
      logger.error('Migration script failed', {
        context: 'db-migration',
        error: error instanceof Error ? error : new Error(String(error)),
      });
      process.exit(1);
    });
}

export { runMigrations };
