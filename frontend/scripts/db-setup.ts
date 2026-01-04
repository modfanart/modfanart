import { db, DB } from '@/lib/db/config';
async function setupPostgresTables() {
  try {
    // === Users Table ===
    await db.schema
      .createTable(DB.USERS)
      .ifNotExists()
      .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
      .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('role', 'varchar(50)', (col) => col.notNull())
      .addColumn('created_at', 'timestamp', (col) => col.notNull())
      .addColumn('updated_at', 'timestamp', (col) => col.notNull())
      .addColumn('profile_image_url', 'text')
      .addColumn('bio', 'text')
      .addColumn('website', 'text')
      .addColumn('social_links', 'jsonb')
      .addColumn('subscription', 'jsonb')
      .addColumn('settings', 'jsonb')
      .execute();

    // === Submissions Table ===
    await db.schema
      .createTable(DB.SUBMISSIONS)
      .ifNotExists()
      .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
      .addColumn('title', 'varchar(255)', (col) => col.notNull())
      .addColumn('description', 'text', (col) => col.notNull())
      .addColumn('category', 'varchar(100)', (col) => col.notNull())
      .addColumn('original_ip', 'varchar(255)', (col) => col.notNull())
      .addColumn('tags', 'jsonb')
      .addColumn('status', 'varchar(50)', (col) => col.notNull())
      .addColumn('image_url', 'text', (col) => col.notNull())
      .addColumn('license_type', 'varchar(100)', (col) => col.notNull())
      .addColumn('submitted_at', 'timestamp', (col) => col.notNull())
      .addColumn('updated_at', 'timestamp', (col) => col.notNull())
      .addColumn('user_id', 'varchar(36)', (col) => col.notNull())
      .addForeignKeyConstraint('submissions_user_fk', ['user_id'], DB.USERS, ['id'])
      .addColumn('analysis', 'jsonb')
      .addColumn('review_notes', 'text')
      .addColumn('reviewed_by', 'varchar(36)')
      .addColumn('reviewed_at', 'timestamp')
      .execute();

    // === Licenses Table ===
    await db.schema
      .createTable(DB.LICENSES)
      .ifNotExists()
      .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
      .addColumn('submission_id', 'varchar(36)', (col) => col.notNull())
      .addForeignKeyConstraint('licenses_submission_fk', ['submission_id'], DB.SUBMISSIONS, ['id'])
      .addColumn('user_id', 'varchar(36)', (col) => col.notNull())
      .addForeignKeyConstraint('licenses_user_fk', ['user_id'], DB.USERS, ['id'])
      .addColumn('license_type', 'varchar(50)', (col) => col.notNull())
      .addColumn('status', 'varchar(50)', (col) => col.notNull())
      .addColumn('terms', 'jsonb', (col) => col.notNull())
      .addColumn('created_at', 'timestamp', (col) => col.notNull())
      .addColumn('updated_at', 'timestamp', (col) => col.notNull())
      .addColumn('expires_at', 'timestamp')
      .addColumn('payment_id', 'varchar(36)')
      .addColumn('metadata', 'jsonb')
      .execute();

    // === Orders Table ===
    await db.schema
      .createTable(DB.ORDERS)
      .ifNotExists()
      .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
      .addColumn('user_id', 'varchar(36)')
      .addForeignKeyConstraint('orders_user_fk', ['user_id'], DB.USERS, ['id'])
      .addColumn('status', 'varchar(50)', (col) => col.notNull())
      .addColumn('total_amount', 'numeric', (col) => col.notNull())
      .addColumn('items', 'jsonb', (col) => col.notNull())
      .addColumn('shipping_address', 'jsonb')
      .addColumn('billing_address', 'jsonb')
      .addColumn('payment_intent_id', 'varchar(255)')
      .addColumn('created_at', 'timestamp', (col) => col.notNull())
      .addColumn('updated_at', 'timestamp', (col) => col.notNull())
      .addColumn('completed_at', 'timestamp')
      .addColumn('notes', 'text')
      .execute();

    // === Payments Table ===
    await db.schema
      .createTable(DB.PAYMENTS)
      .ifNotExists()
      .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
      .addColumn('user_id', 'varchar(36)')
      .addForeignKeyConstraint('payments_user_fk', ['user_id'], DB.USERS, ['id'])
      .addColumn('amount', 'numeric', (col) => col.notNull())
      .addColumn('currency', 'varchar(10)', (col) => col.notNull())
      .addColumn('status', 'varchar(20)', (col) => col.notNull())
      .addColumn('payment_method', 'varchar(50)', (col) => col.notNull())
      .addColumn('payment_intent_id', 'varchar(255)')
      .addColumn('metadata', 'jsonb')
      .addColumn('created_at', 'timestamp', (col) => col.notNull())
      .addColumn('updated_at', 'timestamp', (col) => col.notNull())
      .execute();

    // === Analytics Table ===
    await db.schema
      .createTable(DB.ANALYTICS)
      .ifNotExists()
      .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
      .addColumn('user_id', 'varchar(36)')
      .addForeignKeyConstraint('analytics_user_fk', ['user_id'], DB.USERS, ['id'])
      .addColumn('event_type', 'varchar(100)', (col) => col.notNull())
      .addColumn('event_data', 'jsonb', (col) => col.notNull())
      .addColumn('created_at', 'timestamp', (col) => col.notNull())
      .addColumn('ip_address', 'varchar(50)')
      .addColumn('user_agent', 'text')
      .addColumn('referrer', 'text')
      .execute();

    // === Audit Logs Table ===
    await db.schema
      .createTable(DB.AUDIT_LOGS)
      .ifNotExists()
      .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
      .addColumn('user_id', 'varchar(36)')
      .addForeignKeyConstraint('audit_logs_user_fk', ['user_id'], DB.USERS, ['id'])
      .addColumn('action', 'varchar(255)', (col) => col.notNull())
      .addColumn('entity_type', 'varchar(100)', (col) => col.notNull())
      .addColumn('entity_id', 'varchar(36)')
      .addColumn('details', 'jsonb', (col) => col.notNull())
      .addColumn('ip_address', 'varchar(50)')
      .addColumn('user_agent', 'text')
      .addColumn('created_at', 'timestamp', (col) => col.notNull())
      .execute();

    console.log('All PostgreSQL tables created successfully!');
  } catch (error: unknown) {
    console.error(
      'Error setting up PostgreSQL tables:',
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}

// === Run Setup ===
async function main() {
  try {
    await setupPostgresTables();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error instanceof Error ? error.message : error);
  } finally {
    process.exit(0);
  }
}

main();
