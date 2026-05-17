// src/config/index.js  (or wherever this file is)
require('dotenv').config(); // Use the same as in index.js

const { Kysely, PostgresDialect } = require('kysely');
const { Pool } = require('pg');
const { S3Client } = require('@aws-sdk/client-s3');

// ==================== POSTGRES POOL ====================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: true }
      : false,
});

pool.on('connect', () => console.log('✅ New database client connected'));
pool.on('acquire', () =>
  console.log('🔗 Database connection acquired from pool')
);
pool.on('error', (err) =>
  console.error('❌ Database pool error:', err.message)
);

// Test connection once at startup
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

// ==================== Kysely ====================
const db = new Kysely({
  dialect: new PostgresDialect({ pool }),
});

// ==================== S3 ====================
let s3Client = null;
try {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn('⚠️ S3 client: AWS credentials missing');
  } else {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log('☁️ S3 client initialized successfully');
  }
} catch (err) {
  console.warn('⚠️ S3 client initialization failed:', err.message);
}
// At the bottom of your config file
(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('🎉 Successfully connected to PostgreSQL database!');

    const res = await client.query('SELECT current_database(), version()');
    console.log(`📍 Connected to: ${res.rows[0].current_database}`);
    console.log(`🐘 Version: ${res.rows[0].version.split(',')[0]}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // Only exit if DB is critical
  } finally {
    if (client) client.release();
  }
})();
module.exports = { db, s3Client, pool };
