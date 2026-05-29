require('dotenv').config();

const { Kysely, PostgresDialect } = require('kysely');
const { Pool } = require('pg');

// ==================== POSTGRES POOL (FROM CONNECTION STRING) ====================
const connectionString =
  process.env.DATABASE_URL ||
  'postgres://modapp:Tiger%4073Blaze@mod-postgres:5432/modfanart';

const pool = new Pool({
  connectionString,
  max: 10,
});

pool.on('connect', () => console.log('✅ New database client connected'));

pool.on('acquire', () =>
  console.log('🔗 Database connection acquired from pool')
);

pool.on('error', (err) =>
  console.error('❌ Database pool error:', err.message)
);

// ==================== TEST DB CONNECTION ====================
(async () => {
  let client;

  try {
    client = await pool.connect();

    console.log('🎉 Successfully connected to PostgreSQL database!');

    const res = await client.query('SELECT current_database(), version()');

    console.log(`📍 Connected to: ${res.rows[0].current_database}`);
    console.log(`🐘 Version: ${res.rows[0].version.split(',')[0]}`);
  } catch (err) {
    console.error('❌ Failed to connect to database!', err.message);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
})();

// ==================== KYSELY ====================
const db = new Kysely({
  dialect: new PostgresDialect({
    pool,
  }),
});

module.exports = { db, pool };
