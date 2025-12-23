import { postgresClient } from "../lib/db/config"
import { logger } from "../lib/utils/logger"
import fs from "fs"
import path from "path"

// Migration tracking table
const MIGRATIONS_TABLE = "schema_migrations"

async function createMigrationsTable() {
  try {
    await postgresClient.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `)
    logger.info("Migrations table created or verified", { context: "db-migration" })
  } catch (error) {
    logger.error("Failed to create migrations table", { context: "db-migration", error })
    throw error
  }
}

async function getAppliedMigrations(): Promise<string[]> {
  try {
    const result = await postgresClient.query(`
      SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id
    `)
    return result.rows.map((row) => row.name)
  } catch (error) {
    logger.error("Failed to get applied migrations", { context: "db-migration", error })
    throw error
  }
}

async function markMigrationAsApplied(name: string) {
  try {
    await postgresClient.query(
      `
      INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)
    `,
      [name],
    )
    logger.info(`Migration marked as applied: ${name}`, { context: "db-migration" })
  } catch (error) {
    logger.error(`Failed to mark migration as applied: ${name}`, { context: "db-migration", error })
    throw error
  }
}

async function runMigration(name: string, sql: string) {
  const client = await postgresClient.connect()

  try {
    await client.query("BEGIN")

    logger.info(`Running migration: ${name}`, { context: "db-migration" })
    await client.query(sql)

    await markMigrationAsApplied(name)

    await client.query("COMMIT")
    logger.info(`Migration completed: ${name}`, { context: "db-migration" })
  } catch (error) {
    await client.query("ROLLBACK")
    logger.error(`Migration failed: ${name}`, { context: "db-migration", error })
    throw error
  } finally {
    client.release()
  }
}

async function runMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await createMigrationsTable()

    // Get list of applied migrations
    const appliedMigrations = await getAppliedMigrations()

    // Get all migration files
    const migrationsDir = path.join(__dirname, "../migrations")
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort() // Ensure migrations run in order

    // Run migrations that haven't been applied yet
    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        const filePath = path.join(migrationsDir, file)
        const sql = fs.readFileSync(filePath, "utf8")
        await runMigration(file, sql)
      }
    }

    logger.info("All migrations completed successfully", { context: "db-migration" })
  } catch (error) {
    logger.error("Migration process failed", { context: "db-migration", error })
    process.exit(1)
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info("Migration script completed", { context: "db-migration" })
      process.exit(0)
    })
    .catch((error) => {
      logger.error("Migration script failed", { context: "db-migration", error })
      process.exit(1)
    })
}

export { runMigrations }

