// Restores two schema objects the application relies on but 001_baseline does not create.
//
// Both were defined by the original migrations (202601060002_categories_tags.ts created
// `taggings`; 202601060004_contests.ts added `contest_entries.submission_notes`), which were
// later deleted. The baseline was introspected without them, so a database built from this
// folder alone rejects every contest entry (ContestEntry.create writes submission_notes) and
// every tag lookup. The definitions below are copied from those original migrations.
//
// IF NOT EXISTS throughout: on databases that already have them — the live ones — this is a
// no-op, matching the convention of the other migrations here.
const { sql } = require('kysely');

async function up(db) {
  await sql`
    ALTER TABLE contest_entries
      ADD COLUMN IF NOT EXISTS submission_notes text
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS taggings (
      tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      taggable_type text NOT NULL,
      taggable_id uuid NOT NULL,
      created_by uuid REFERENCES users(id),
      created_at timestamptz NOT NULL DEFAULT NOW(),
      CONSTRAINT taggings_pk PRIMARY KEY (tag_id, taggable_type, taggable_id)
    )
  `.execute(db);
}

// Not reversed, matching this repo's convention for IF NOT EXISTS migrations: on a database where
// these predated this migration, a down() would drop live data.
async function down() {}

module.exports = { up, down };
