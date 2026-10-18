// src/migrations/20260816000000_create_ai_screening.js
//
// Schema for the AI screening pipeline: screening_runs (one row per pipeline execution),
// rulesets (immutable, versioned brand/platform config) and style_guides (brand creative rules
// compiled into a prompt block).
//
// Everything here is written to be idempotent and additive, because the two schema sources in
// this repo disagree about what the live database contains. `001_baseline.js` was introspected
// from the live dev DB and has no `audited_events` table and no moderation columns on
// `contest_entries`; the `mod_dev_test_backup.sql` dump at the repo root has both. Application
// code (`src/db/types.js`, `src/scripts/migrate.js`'s reset list) assumes they exist. Rather than
// pick a winner, this migration creates/adds them only when absent, so it converges either
// database onto the shape the pipeline needs.

const { sql } = require('kysely');

async function up(db) {
  // --- Prerequisites the pipeline depends on but cannot assume are present -----------------

  // Audit trail. The single write path in transition.service.js logs every screening decision
  // and human override here. Column list matches AuditedEventRow in src/db/types.js.
  await sql`
    CREATE TABLE IF NOT EXISTS audited_events (
      id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
      actor_id uuid,
      action text NOT NULL,
      entity_type text,
      entity_id uuid,
      old_values jsonb,
      new_values jsonb,
      ip_address text,
      user_agent text,
      created_at timestamptz DEFAULT now() NOT NULL
    )
  `.execute(db);

  // Contest entries carry their own moderation verdict, separate from the brand's
  // approve/reject of `status`. Present in the backup dump, absent from the live-DB baseline.
  await sql`
    ALTER TABLE contest_entries
      ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS moderated_by uuid,
      ADD COLUMN IF NOT EXISTS moderated_at timestamptz
  `.execute(db);

  // --- Rulesets ----------------------------------------------------------------------------

  // Immutable and versioned: editing thresholds inserts a new version so that every historical
  // run can still be explained by the exact config it ran under. Nothing UPDATEs `config`.
  await db.schema
    .createTable('rulesets')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    // NULL brand_id is the platform default, used when an artwork has no brand context.
    .addColumn('brand_id', 'uuid', (col) =>
      col.references('brands.id').onDelete('cascade')
    )
    .addColumn('version', 'integer', (col) => col.notNull())
    .addColumn('config', 'jsonb', (col) => col.notNull())
    .addColumn('created_by', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addCheckConstraint('rulesets_version_positive', sql`version > 0`)
    .execute();

  await db.schema
    .createIndex('rulesets_brand_version_idx')
    .ifNotExists()
    .on('rulesets')
    .columns(['brand_id', 'version'])
    .unique()
    .execute();

  // A plain UNIQUE (brand_id, version) does NOT constrain platform rows: Postgres treats NULLs
  // as distinct, so it would happily accept two `brand_id IS NULL, version = 1` rows. This
  // partial index is what actually enforces one platform default per version.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS rulesets_platform_version_idx
      ON rulesets (version) WHERE brand_id IS NULL
  `.execute(db);

  // --- Style guides ------------------------------------------------------------------------

  await db.schema
    .createTable('style_guides')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('brand_id', 'uuid', (col) =>
      col.notNull().references('brands.id').onDelete('cascade')
    )
    .addColumn('source_file_url', 'text')
    // Raw text supplied inline instead of as a file upload.
    .addColumn('source_text', 'text')
    .addColumn('parsed_rules', 'jsonb')
    // Compiled once at upload and injected verbatim into the style stage, so the per-artwork
    // path never re-parses the guide.
    .addColumn('prompt_block', 'text')
    .addColumn('parse_status', 'text', (col) =>
      col.notNull().defaultTo('pending')
    )
    .addColumn('parse_error', 'text')
    .addColumn('created_by', 'uuid', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addCheckConstraint(
      'style_guides_parse_status_check',
      sql`parse_status IN ('pending','parsed','failed')`
    )
    .execute();

  await db.schema
    .createIndex('style_guides_brand_idx')
    .ifNotExists()
    .on('style_guides')
    .column('brand_id')
    .execute();

  // --- Screening runs ----------------------------------------------------------------------

  await db.schema
    .createTable('screening_runs')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('artwork_id', 'uuid', (col) =>
      col.notNull().references('artworks.id').onDelete('cascade')
    )
    .addColumn('contest_entry_id', 'uuid', (col) =>
      col.references('contest_entries.id').onDelete('set null')
    )
    .addColumn('ruleset_id', 'uuid', (col) =>
      col.notNull().references('rulesets.id')
    )
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('running'))
    // One column per stage. Each is written exactly once, and only while still NULL, which is
    // what makes a retried job resume at the incomplete stage instead of re-billing the
    // completed ones. Each blob carries its own { status: 'ok' | 'unavailable' }.
    .addColumn('aiornot', 'jsonb')
    .addColumn('moderation', 'jsonb')
    .addColumn('style', 'jsonb')
    .addColumn('decision', 'text')
    .addColumn('decision_reasons', 'jsonb')
    .addColumn('error', 'text')
    .addColumn('started_at', 'timestamptz')
    .addColumn('finished_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addCheckConstraint(
      'screening_runs_status_check',
      sql`status IN ('running','complete','failed')`
    )
    .addCheckConstraint(
      'screening_runs_decision_check',
      sql`decision IS NULL OR decision IN ('auto_approved','auto_rejected','flagged_manual')`
    )
    .execute();

  await db.schema
    .createIndex('screening_runs_artwork_idx')
    .ifNotExists()
    .on('screening_runs')
    .columns(['artwork_id', 'created_at'])
    .execute();

  await db.schema
    .createIndex('screening_runs_contest_entry_idx')
    .ifNotExists()
    .on('screening_runs')
    .column('contest_entry_id')
    .execute();

  // --- Link the human review queue back to the run that flagged it -------------------------

  await sql`
    ALTER TABLE moderation_queue
      ADD COLUMN IF NOT EXISTS screening_run_id uuid REFERENCES screening_runs(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS rule_matches jsonb
  `.execute(db);

  // --- Seed the platform default ruleset ---------------------------------------------------

  // Values mirror `defaultComplianceRules` in frontend/lib/db/config-service.ts plus the
  // toggles in frontend/app/compliance/ai-screening/page.tsx, so the settings UI can be pointed
  // at this row later without a migration. Guarded so re-running never stacks duplicates.
  await sql`
    INSERT INTO rulesets (brand_id, version, config)
    SELECT NULL, 1, ${sql.lit(
      JSON.stringify({
        enabled: true,
        aiDetectionThreshold: 0.7,
        contentSafetyThreshold: 0.8,
        ipComplianceThreshold: 0.75,
        autoRejectThreshold: 0.9,
        autoApproveThreshold: 0.2,
        requireHumanReview: true,
        confidenceThreshold: 75,
        autoRejectAI: false,
        notifyArtist: true,
        sensitivityLevel: 'balanced',
        styleEnabled: true,
        styleViolationAction: 'flag',
        authenticityFailAction: 'flag',
      })
    )}::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM rulesets WHERE brand_id IS NULL)
  `.execute(db);
}

async function down(db) {
  await sql`
    ALTER TABLE moderation_queue
      DROP COLUMN IF EXISTS screening_run_id,
      DROP COLUMN IF EXISTS rule_matches
  `.execute(db);

  await db.schema.dropTable('screening_runs').ifExists().execute();
  await db.schema.dropTable('style_guides').ifExists().execute();
  await db.schema.dropTable('rulesets').ifExists().execute();

  // `audited_events` and the contest_entries moderation columns are deliberately NOT dropped.
  // They are pre-existing concepts that this migration only backfilled where missing; dropping
  // them on rollback would destroy data the rest of the application depends on.
}

module.exports = { up, down };
