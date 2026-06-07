require('dotenv').config();

const { Kysely, PostgresDialect } = require('kysely');
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

let pool;

if (isProduction) {
  console.log('🚀 Using VPS PostgreSQL');

  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'modfanart',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'modfanart',
  });
} else {
  console.log('🧪 Using Neon PostgreSQL');

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

pool.on('connect', () => console.log('✅ New database client connected'));

pool.on('acquire', () =>
  console.log('🔗 Database connection acquired from pool')
);

pool.on('error', (err) =>
  console.error('❌ Database pool error:', err.message)
);

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

const db = new Kysely({
  dialect: new PostgresDialect({
    pool,
  }),
});

module.exports = { db, pool };
