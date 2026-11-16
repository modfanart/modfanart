// src/migrations/20261115000000_audit_events_and_staff_permissions.js
//
// Activity logs (workspace) + RBAC matrix support.
//
// 1. audited_events: the model and middleware wrote to this table but no
//    migration ever created it. Create it if missing; if it exists, add the
//    new columns and make entity_id text (ids can be slugs or composite).
// 2. Seed `workspace.access` on admin-tier roles (harmless: they hold every
//    permission implicitly) and normalise any array-shaped `permissions`
//    values written by the old workspace modal into { key: true } objects.

const { sql } = require('kysely');

async function up(db) {
  await sql`
    CREATE TABLE IF NOT EXISTS audited_events (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_id    uuid,
      action      text NOT NULL,
      entity_type text,
      entity_id   text,
      old_values  jsonb,
      new_values  jsonb,
      ip_address  text,
      user_agent  text,
      created_at  timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);

  await sql`
    ALTER TABLE audited_events
      ADD COLUMN IF NOT EXISTS source      text NOT NULL DEFAULT 'api',
      ADD COLUMN IF NOT EXISTS summary     text,
      ADD COLUMN IF NOT EXISTS status_code integer
  `.execute(db);

  // Per-row safe JSON parse for legacy text/json columns: valid JSON is kept
  // as-is, anything else becomes a JSON string, so no row is lost and one bad
  // row doesn't stringify the whole column.
  await sql`
    CREATE OR REPLACE FUNCTION pg_temp.mod_try_jsonb(v text) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE AS $f$
    BEGIN
      RETURN v::jsonb;
    EXCEPTION WHEN others THEN
      RETURN to_jsonb(v);
    END
    $f$
  `.execute(db);

  // entity_id must hold non-UUID ids too (slugs, "me", composite keys).
  await sql`
    DO $$
    BEGIN
      IF (SELECT data_type FROM information_schema.columns
           WHERE table_name = 'audited_events' AND column_name = 'entity_id') <> 'text' THEN
        ALTER TABLE audited_events ALTER COLUMN entity_id TYPE text USING entity_id::text;
      END IF;
      IF (SELECT data_type FROM information_schema.columns
           WHERE table_name = 'audited_events' AND column_name = 'old_values') <> 'jsonb' THEN
        ALTER TABLE audited_events ALTER COLUMN old_values TYPE jsonb USING pg_temp.mod_try_jsonb(old_values::text);
      END IF;
      IF (SELECT data_type FROM information_schema.columns
           WHERE table_name = 'audited_events' AND column_name = 'new_values') <> 'jsonb' THEN
        ALTER TABLE audited_events ALTER COLUMN new_values TYPE jsonb USING pg_temp.mod_try_jsonb(new_values::text);
      END IF;
    END $$
  `.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS audited_events_created_idx ON audited_events (created_at DESC)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS audited_events_actor_idx ON audited_events (actor_id, created_at DESC)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS audited_events_entity_idx ON audited_events (entity_type, entity_id)`.execute(db);

  // Old workspace modal saved permissions as a JSON array of keys.
  await sql`
    UPDATE roles
       SET permissions = (
         SELECT COALESCE(jsonb_object_agg(k, true), '{}'::jsonb)
           FROM jsonb_array_elements_text(permissions::jsonb) AS k
       )
     WHERE jsonb_typeof(permissions::jsonb) = 'array'
  `.execute(db);

  await sql`
    UPDATE roles
       SET permissions = COALESCE(permissions::jsonb, '{}'::jsonb) || '{"workspace.access": true}'::jsonb
     WHERE upper(name) IN ('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'DEVELOPER')
  `.execute(db);
}

async function down(db) {
  await sql`DROP INDEX IF EXISTS audited_events_entity_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS audited_events_actor_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS audited_events_created_idx`.execute(db);
  await sql`
    ALTER TABLE audited_events
      DROP COLUMN IF EXISTS source,
      DROP COLUMN IF EXISTS summary,
      DROP COLUMN IF EXISTS status_code
  `.execute(db);
}

module.exports = { up, down };
