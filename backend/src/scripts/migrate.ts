// migrate.ts
// Recommended location: root or src/scripts/migrate.ts
// Run: npx tsx migrate.ts   or   npm run migrate

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { FileMigrationProvider, Migrator } from 'kysely';

import { db } from '../config/index.js'; // ← adjust path if needed (relative to this file)

// Use process.cwd() — most reliable when running via tsx / node
const migrationFolder = path.join(process.cwd(), 'src/migrations');
// or path.join(process.cwd(), 'migrations') if you put them in root/migrations

async function migrateToLatest(): Promise<void> {
  console.log('Starting Kysely migrations...');
  console.log('Migration folder:', migrationFolder);

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  // Fatal error (couldn't even start / list migrations / acquire lock / etc.)
  if (error) {
    console.error('❌ Fatal migration error (setup or lock failure):');
    console.error(error);
    process.exit(1);
  }

  if (!results || results.length === 0) {
    console.log('ℹ️  No pending migrations. Database is already up to date.');
    process.exit(0);
  }

  console.log(`Applying ${results.length} migration(s):`);

  let failed = false;

  for (const res of results) {
    if (res.status === 'Success') {
      console.log(`  ✅ ${res.migrationName} applied successfully`);
    } else if (res.status === 'Error') {
      failed = true;
      console.error(`  ❌ ${res.migrationName} FAILED`);
      // Note: the actual error was thrown earlier — you usually see it in console already
      // Kysely logs the real DB error before returning the result set
    } else {
      console.log(`  ℹ️  ${res.migrationName} → ${res.status}`);
    }
  }

  if (failed) {
    console.error(
      '\n❌ One or more migrations failed → check the error output above.'
    );
    console.error(
      '   Kysely rolled back to the last successful migration automatically.'
    );
    process.exit(1);
  }

  console.log('\n🎉 All pending migrations applied successfully!');
  process.exit(0);
}

migrateToLatest().catch((err) => {
  console.error('❌ Unexpected crash in migration script:');
  console.error(err);
  process.exit(1);
});
