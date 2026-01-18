// 202601060001_extensions_and_core.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Enable extensions
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS "citext"`.execute(db);

  // Roles
  await db.schema
    .createTable('roles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'text', (col) => col.notNull().unique())
    .addColumn('hierarchy_level', 'integer', (col) => col.notNull())
    .addColumn('is_system', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('permissions', 'jsonb', (col) => col.notNull().defaultTo('{}'))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();

  // Users
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('username', 'text', (col) => col.notNull().unique())
     .addColumn('email', sql`citext`, (col) => col.notNull().unique())
    .addColumn('email_verified', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('password_hash', 'text')
    .addColumn('role_id', 'uuid', (col) => col.references('roles.id').onDelete('set null'))
    .addColumn('status', 'text', (col) => col.notNull().check(sql`status IN ('active', 'suspended', 'pending_verification', 'deactivated')`))
    .addColumn('profile', 'jsonb', (col) => col.defaultTo('{}'))
    .addColumn('avatar_url', 'text')
    .addColumn('banner_url', 'text')
    .addColumn('bio', 'text')
    .addColumn('location', 'text')
    .addColumn('website', 'text')
    .addColumn('payout_method', 'jsonb')
    .addColumn('stripe_connect_id', 'text')
    .addColumn('signup_key_used', 'text')
    .addColumn('last_login_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  await db.schema.createIndex('users_email_idx').on('users').column('email').execute();

  // User Roles (pivot if needed, though role_id is on users)
  await db.schema
    .createTable('user_roles')
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('role_id', 'uuid', (col) => col.references('roles.id').onDelete('cascade').notNull())
    .addColumn('assigned_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('assigned_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addPrimaryKeyConstraint('user_roles_pk', ['user_id', 'role_id'])
    .execute();

  // Refresh Tokens
  await db.schema
    .createTable('refresh_tokens')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('token_hash', 'text', (col) => col.notNull())
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('revoked_at', 'timestamptz')
    .execute();

  // Auth Tokens
  await db.schema
    .createTable('auth_tokens')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('type', 'text', (col) => col.notNull().check(sql`type IN ('email_verification', 'password_reset')`))
    .addColumn('token_hash', 'text', (col) => col.notNull())
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('used_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();

  // Brand Verification Requests
  await db.schema
    .createTable('brand_verification_requests')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('company_name', 'text', (col) => col.notNull())
    .addColumn('website', 'text')
    .addColumn('documents', 'jsonb')
    .addColumn('status', 'text', (col) => col.notNull().check(sql`status IN ('pending', 'approved', 'rejected', 'interview_scheduled')`))
    .addColumn('reviewed_by', 'uuid', (col) => col.references('users.id'))
    .addColumn('reviewed_at', 'timestamptz')
    .addColumn('notes', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`NOW()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('brand_verification_requests').execute();
  await db.schema.dropTable('auth_tokens').execute();
  await db.schema.dropTable('refresh_tokens').execute();
  await db.schema.dropTable('user_roles').execute();
  await db.schema.dropTable('users').execute();
  await db.schema.dropTable('roles').execute();
}