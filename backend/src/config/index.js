require('dotenv/config');

const { Kysely, PostgresDialect } = require('kysely');
const { Pool } = require('pg');
const { S3Client } = require('@aws-sdk/client-s3');

// PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: true }
      : false,
});

// Connection logs
pool.on('connect', () => console.log('✅ New database client connected'));

pool.on('acquire', () =>
  console.log('🔗 Database connection acquired from pool')
);

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

// Test connection
(async () => {
  try {
    const client = await pool.connect();
    console.log('🎉 Successfully connected to PostgreSQL database!');

    const res = await client.query('SELECT current_database(), version()');

    console.log(`📍 Connected to: ${res.rows[0].current_database}`);
    console.log(`🐘 Version: ${res.rows[0].version.split(',')[0]}`);

    client.release();
  } catch (err) {
    console.error('❌ Failed to connect to database!', err.message);
    process.exit(1);
  }
})();

// Kysely instance
const db = new Kysely({
  dialect: new PostgresDialect({ pool }),
});

// S3 Client
let s3Client = null;

try {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-north-1',

    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  console.log('☁️ S3 client initialized successfully');
} catch (err) {
  console.warn('⚠️ S3 client failed (missing credentials?)');
}

module.exports = { db, s3Client, pool };
