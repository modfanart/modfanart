// migrate.ts
// Run with: npx tsx migrate.ts

import { promises as fs } from 'node:fs';
import path from 'node:path';

import {
  FileMigrationProvider,
  Migrator,
  type MigrationResult,
  type MigrationInfo,
} from 'kysely';
import { db } from '../config/index.js'; // Adjust path if needed

const migrationFolder = path.join(process.cwd(), 'src/migrations');

async function main() {
  const command = process.argv[2]?.toLowerCase() || 'latest';

  console.log('🚀 Kysely Migration Tool');
  console.log('Migration folder:', migrationFolder);

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder,
    }),
  });

  try {
    switch (command) {
      case 'up':
      case 'latest':
        await migrateToLatest(migrator);
        break;

      case 'down':
      case 'rollback':
        await rollbackLast(migrator);
        break;

      case 'reset':
        await resetDatabase(migrator);
        break;

      case 'status':
        await showStatus(migrator);
        break;

      default:
        console.log(`
Usage: npx tsx migrate.ts [command]

Commands:
  up | latest     → Migrate to latest version (default)
  down | rollback → Rollback last migration
  reset           → ⚠️  Drop and recreate entire schema (dev only)
  status          → Show current migration status
        `);
    }
  } catch (err) {
    console.error('❌ Unexpected error in migration script:', err);
    process.exit(1);
  } finally {
    await db.destroy(); // Clean up DB connection
  }
}

async function migrateToLatest(migrator: Migrator) {
  console.log('📤 Migrating database to latest version...');

  const { error, results } = await migrator.migrateToLatest();
  handleMigrationResults(error, results, 'applied');
}

async function rollbackLast(migrator: Migrator) {
  console.log('⏪ Rolling back last migration...');

  const { error, results } = await migrator.migrateDown();
  handleMigrationResults(error, results, 'rolled back');
}

function handleMigrationResults(
  error: unknown,
  results: readonly MigrationResult[] | undefined,
  action: string
) {
  if (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }

  if (!results || results.length === 0) {
    console.log(`ℹ️  No migrations to ${action}. Database is up to date.`);
    return;
  }

  console.log(`✅ Successfully ${action} ${results.length} migration(s):`);
  for (const res of results) {
    if (res.status === 'Success') {
      console.log(`   ✅ ${res.migrationName}`);
    } else {
      console.error(`   ❌ ${res.migrationName} - ${res.status}`);
    }
  }
}

async function resetDatabase(migrator: Migrator) {
  console.warn('⚠️  DANGER: You are about to DROP ALL TABLES!');
  console.log('This is only recommended in development environments.');

  const answer = await promptConfirm('Type "yes" to confirm reset: ');

  if (answer !== 'yes') {
    console.log('❌ Reset cancelled.');
    return;
  }

  console.log('🗑️  Dropping all tables in reverse order...');

  const tablesToDrop = [
    'brand_post_upvotes',
    'brand_post_comments',
    'brand_post_likes',
    'brand_posts',
    'brand_artworks',
    'brand_managers',
    'brand_followers',
    'collection_items',
    'collections',
    'contest_judge_scores',
    'contest_judges',
    'contest_votes',
    'contest_entries',
    'contest_categories',
    'contests',
    'artwork_pricing_tiers',
    'artwork_categories',
    'artwork_likes',
    'artworks',
    'taggings',
    'tags',
    'categories',
    'brand_verification_requests',
    'refunds',
    'order_items',
    'orders',
    'licenses',
    'moderation_queue',
    'user_violations',
    'favorites',
    'notifications',
    'audited_events',
    'refresh_tokens',
    'auth_tokens',
    'user_roles',
    'users',
    'roles',
    'contact_messages',
  ];

  for (const table of tablesToDrop) {
    await db.schema.dropTable(table).ifExists().execute();
    console.log(`   Dropped → ${table}`);
  }

  console.log('🔄 Running all migrations...');
  const { error } = await migrator.migrateToLatest();

  if (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }

  console.log('🎉 Database fully reset and migrated!');
}

async function showStatus(migrator: Migrator) {
  console.log('\n📊 Migration Status:');

  const migrations = await migrator.getMigrations(); // Returns readonly MigrationInfo[]

  if (migrations.length === 0) {
    console.log('No migrations found.');
    return;
  }

  for (const m of migrations) {
    const status = m.executedAt
      ? `✅ Applied (${new Date(m.executedAt).toLocaleString()})`
      : '⏳ Pending';
    console.log(`   ${status} → ${m.migration}`);
  }
}

async function promptConfirm(question: string): Promise<string> {
  const readline = await import('node:readline/promises');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question(question);
  rl.close();
  return answer.trim().toLowerCase();
}

main();
