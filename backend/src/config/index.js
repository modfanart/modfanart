// backend/src/config/index.js
require('dotenv').config();

const { Kysely, PostgresDialect } = require('kysely');
const { Pool } = require('pg');
const { S3Client } = require('@aws-sdk/client-s3');

const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    }),
  }),
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = { db, s3Client };