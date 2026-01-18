// 202601060005_orders_and_licenses.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('orders')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('order_number', 'text', (col) => col.notNull().unique())
    .addColumn('buyer_id', 'uuid', (col) => col.references('users.id'))
    .addColumn('seller_id', 'uuid', (col) => col.references('users.id').notNull())
    .addColumn('source_type', 'text', (col) => col.notNull().check(sql`source_type IN ('license_purchase', 'contest_prize', 'refund', 'manual')`))
    .addColumn('source_id', 'uuid')
    .addColumn('status', 'text', (col) => col.notNull().check(sql`status IN ('pending', 'paid', 'fulfilled', 'refunded', 'disputed', 'failed')`))
    .addColumn('currency', 'text', (col) => col.notNull())
    .addColumn('subtotal_cents', 'integer', (col) => col.notNull())
    .addColumn('platform_fee_cents', 'integer', (col) => col.notNull())
    .addColumn('tax_cents', 'integer', (col) => col.notNull())
    .addColumn('total_cents', 'integer', (col) => col.notNull())
    .addColumn('stripe_payment_intent_id', 'text')
    .addColumn('stripe_charge_id', 'text')
    .addColumn('invoice_pdf_url', 'text')
    .addColumn('invoice_number', 'text')
    .addColumn('paid_at', 'timestamptz')
    .addColumn('fulfilled_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();

  await db.schema
    .createTable('order_items')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('order_id', 'uuid', (col) => col.references('orders.id').onDelete('cascade').notNull())
    .addColumn('artwork_id', 'uuid', (col) => col.references('artworks.id'))
    .addColumn('license_type', 'text')
    .addColumn('unit_price_cents', 'integer', (col) => col.notNull())
    .addColumn('quantity', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('description', 'text')
    .addColumn('metadata', 'jsonb')
    .execute();

  await db.schema
    .createTable('refunds')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('order_id', 'uuid', (col) => col.references('orders.id').onDelete('cascade').notNull())
    .addColumn('amount_cents', 'integer', (col) => col.notNull())
    .addColumn('reason', 'text')
    .addColumn('status', 'text', (col) => col.notNull())
    .addColumn('stripe_refund_id', 'text')
    .addColumn('approved_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('processed_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();

  await db.schema
    .createTable('licenses')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('order_item_id', 'uuid', (col) => col.references('order_items.id').onDelete('cascade').notNull())
    .addColumn('artwork_id', 'uuid', (col) => col.references('artworks.id').onDelete('cascade').notNull())
    .addColumn('buyer_id', 'uuid', (col) => col.references('users.id').notNull())
    .addColumn('seller_id', 'uuid', (col) => col.references('users.id').notNull())
    .addColumn('license_type', 'text', (col) => col.notNull())
    .addColumn('contract_pdf_url', 'text', (col) => col.notNull())
    .addColumn('expires_at', 'timestamptz')
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('revoked_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('licenses').execute();
  await db.schema.dropTable('refunds').execute();
  await db.schema.dropTable('order_items').execute();
  await db.schema.dropTable('orders').execute();
}