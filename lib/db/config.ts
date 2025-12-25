import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { S3Client } from '@aws-sdk/client-s3';

// === Database Interface ===
// Use Kysely's recommended pattern: column types should reflect what comes from DB
// Use Generated<string> for UUIDs if you're using uuid_generate_v4(), etc.

interface UsersTable {
  id: string; // assuming uuid as string
  email: string;
  name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  profile_image_url: string | null;
  bio: string | null;
  website: string | null;
  social_links: Record<string, string> | null;
  subscription: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
}

interface SubmissionsTable {
  id: string;
  title: string;
  description: string;
  category: string;
  original_ip: string;
  tags: string[] | null;
  status: string;
  image_url: string;
  license_type: string;
  submitted_at: Date;
  updated_at: Date;
  user_id: string;
  analysis: Record<string, unknown> | null;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: Date | null;
}

interface LicensesTable {
  id: string;
  submission_id: string;
  user_id: string;
  license_type: string;
  status: string;
  terms: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  expires_at: Date | null;
  payment_id: string | null;
  metadata: Record<string, unknown> | null;
}

interface ProductsTable {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  artist: string;
  brand: string;
  status: string;
  is_new: boolean;
  is_bestseller: boolean;
  created_at: Date;
  updated_at: Date;
  artist_id: string | null;
  brand_id: string | null;
  inventory: number | null;
  metadata: Record<string, unknown> | null;
}

interface OrdersTable {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  items: Record<string, unknown>[];
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  payment_intent_id: string | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
  notes: string | null;
}

interface AnalyticsTable {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: Date;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
}

interface AuditLogsTable {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

// === Kysely Database Interface ===
interface Database {
  users: UsersTable;
  submissions: SubmissionsTable;
  licenses: LicensesTable;
  products: ProductsTable;
  orders: OrdersTable;
  analytics: AnalyticsTable;
  audit_logs: AuditLogsTable;
}

// === Table Name Constants ===
export const DB = {
  USERS: 'users' as const,
  SUBMISSIONS: 'submissions' as const,
  LICENSES: 'licenses' as const,
  PRODUCTS: 'products' as const,
  ORDERS: 'orders' as const,
  ANALYTICS: 'analytics' as const,
  AUDIT_LOGS: 'audit_logs' as const,
};

// === PostgreSQL Client ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optional: improve connection handling
  max: 10,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
});

const dialect = new PostgresDialect({ pool });

export const db = new Kysely<Database>({
  dialect,
});

// === S3 Client ===
export const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  // In production (esp. Vercel, AWS Lambda), it's better to rely on IAM roles
  // Only use explicit credentials in local dev if absolutely necessary
  // credentials: process.env.AWS_ACCESS_KEY_ID
  //   ? {
  //       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  //     }
  //   : undefined,
});
