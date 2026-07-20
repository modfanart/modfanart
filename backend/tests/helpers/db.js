// Test DB bootstrap.
//
// src/config only reads DATABASE_URL, but .env defines the connection as
// DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME parts. Assemble the URL from
// those parts when it is absent, before src/config is required - the pool is
// constructed at import time, so setting it afterwards has no effect.
require('dotenv').config({ quiet: true });

// src/config logs pool lifecycle events on every connect/acquire. The node:test
// runner reads a structured protocol from the child's stdout, and those stray
// writes corrupt it ("Unable to deserialize cloned data"). Redirect to stderr
// rather than discarding: the diagnostics stay available, and console.log is
// not silently made a no-op for every test written after this one.
console.log = (...args) => console.error(...args);

const DB_IS_CONFIGURED = Boolean(
  process.env.DATABASE_URL || (process.env.DB_NAME && process.env.DB_USER)
);

if (!process.env.DATABASE_URL && DB_IS_CONFIGURED) {
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
  const password = encodeURIComponent(DB_PASSWORD || '');
  process.env.DATABASE_URL = `postgres://${DB_USER}:${password}@${DB_HOST || 'localhost'}:${DB_PORT || 5432}/${DB_NAME}`;
}

const { db } = require('../../src/config');

/**
 * Decide whether integration tests may skip.
 *
 * Skipping is only legitimate when no database is configured at all - that is
 * a machine without a test DB, not a broken feature. If a database IS
 * configured but the probe fails, that is a genuine failure (bad credentials,
 * missing table, dropped column) and must not be laundered into a skip: a
 * green run with everything skipped reads as coverage while proving nothing.
 *
 * @returns {Promise<{ skip: boolean, reason: string }>} skip=false means run.
 * @throws {Error} when a configured database cannot be queried.
 */
async function requireDatabase() {
  if (!DB_IS_CONFIGURED) {
    return { skip: true, reason: 'no database configured (set DATABASE_URL or DB_NAME/DB_USER)' };
  }

  try {
    await db.selectFrom('contests').select('id').limit(1).execute();
  } catch (err) {
    throw new Error(
      `Database is configured but unusable, refusing to skip: ${err.message}`,
      { cause: err }
    );
  }

  return { skip: false, reason: '' };
}

module.exports = { db, requireDatabase };
