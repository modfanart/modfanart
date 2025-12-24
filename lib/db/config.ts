import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { S3Client } from '@aws-sdk/client-s3';

// Define column types more precisely where possible
interface UsersTable {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  profile_image_url: string | null;
  bio: string | null;
  website: string | null;
  social_links: Record<string, string> | null; // or any if truly dynamic
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

interface Database {
  users: UsersTable;
  submissions: SubmissionsTable;
  licenses: LicensesTable;
  products: ProductsTable;
  orders: OrdersTable;
  analytics: AnalyticsTable;
  audit_logs: AuditLogsTable;
}

export const DB = {
  USERS: 'users',
  SUBMISSIONS: 'submissions',
  LICENSES: 'licenses',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ANALYTICS: 'analytics',
  AUDIT_LOGS: 'audit_logs',
} as const;

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const postgresClient = new Kysely<Database>({
  dialect,
});

// Improved S3 client with optional explicit credentials (recommended for production)
export const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  // Uncomment if you need to specify credentials explicitly
  // credentials: {
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  // },
});
