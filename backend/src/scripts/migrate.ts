import { promises as fs } from 'fs';
import path from 'path';
import { FileMigrationProvider, Migrator, NO_MIGRATIONS } from 'kysely';
import { db } from '../config';

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, '../migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`Migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('Failed to run migrations');
    console.error(error);
    process.exit(1);
  }

  console.log('All migrations completed successfully!');
  process.exit(0);
}

migrateToLatest();