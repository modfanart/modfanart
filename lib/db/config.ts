import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import { S3Client } from "@aws-sdk/client-s3"

interface Database {
  users: UsersTable
  submissions: SubmissionsTable
  licenses: LicensesTable
  products: ProductsTable
  orders: OrdersTable
  analytics: AnalyticsTable
  audit_logs: AuditLogsTable
}

interface UsersTable {
  id: string
  email: string
  name: string
  role: string
  created_at: Date
  updated_at: Date
  profile_image_url: string | null
  bio: string | null
  website: string | null
  social_links: any
  subscription: any
  settings: any
}

interface SubmissionsTable {
  id: string
  title: string
  description: string
  category: string
  original_ip: string
  tags: any
  status: string
  image_url: string
  license_type: string
  submitted_at: Date
  updated_at: Date
  user_id: string
  analysis: any
  review_notes: string | null
  reviewed_by: string | null
  reviewed_at: Date | null
}

interface LicensesTable {
  id: string
  submission_id: string
  user_id: string
  license_type: string
  status: string
  terms: any
  created_at: Date
  updated_at: Date
  expires_at: Date | null
  payment_id: string | null
  metadata: any
}

interface ProductsTable {
  id: string
  title: string
  description: string
  price: number
  image_url: string
  category: string
  artist: string
  brand: string
  status: string
  is_new: boolean
  is_bestseller: boolean
  created_at: Date
  updated_at: Date
  artist_id: string | null
  brand_id: string | null
  inventory: number | null
  metadata: any
}

interface OrdersTable {
  id: string
  user_id: string
  status: string
  total_amount: number
  items: any
  shipping_address: any
  billing_address: any
  payment_intent_id: string | null
  created_at: Date
  updated_at: Date
  completed_at: Date | null
  notes: string | null
}

interface AnalyticsTable {
  id: string
  user_id: string
  event_type: string
  event_data: any
  created_at: Date
  ip_address: string | null
  user_agent: string | null
  referrer: string | null
}

interface AuditLogsTable {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: Date
}

export const DB = {
  USERS: "users",
  SUBMISSIONS: "submissions",
  LICENSES: "licenses",
  PRODUCTS: "products",
  ORDERS: "orders",
  ANALYTICS: "analytics",
  AUDIT_LOGS: "audit_logs",
}

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
})

export const postgresClient = new Kysely<Database>({
  dialect,
})

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1", // Replace with your AWS region
})

