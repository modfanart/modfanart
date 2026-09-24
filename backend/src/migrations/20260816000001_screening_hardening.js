// Operational hardening for the screening pipeline: the indexes the queue and metrics endpoints
// need, and the content hash that makes resubmission of already-rejected images detectable.
//
// Split from 20260816000000 rather than folded into it because that migration has already been
// applied to the dev database; editing an applied migration would leave environments divergent.
const { sql } = require('kysely');

async function up(db) {
  // --- Review queue read paths -------------------------------------------------------------

  // GET /api/moderation/queue always filters on status and orders by priority then age, and the
  // queue is the one table a moderator hits repeatedly all day. Partial on the pending rows: the
  // resolved history grows without bound and is never what the queue view asks for.
  await sql`
    CREATE INDEX IF NOT EXISTS moderation_queue_status_idx
      ON moderation_queue (status, priority DESC, created_at)
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS moderation_queue_pending_idx
      ON moderation_queue (priority DESC, created_at)
      WHERE status = 'pending'
  `.execute(db);

  // The queue view resolves each row back to its artwork or contest entry.
  await sql`
    CREATE INDEX IF NOT EXISTS moderation_queue_entity_idx
      ON moderation_queue (entity_type, entity_id)
  `.execute(db);

  // GET /api/moderation/metrics groups runs by decision and by status.
  await sql`
    CREATE INDEX IF NOT EXISTS screening_runs_decision_idx
      ON screening_runs (decision, created_at)
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS screening_runs_status_idx
      ON screening_runs (status, created_at)
  `.execute(db);

  // --- Content-hash dedupe -----------------------------------------------------------------

  // Not UNIQUE. Two artists can legitimately submit the same public-domain scan, and a hard
  // constraint here would turn a moderation signal into a failed upload. The hash exists so the
  // pipeline can notice that these bytes were already rejected once and route the resubmission to
  // a human instead of re-running three paid API calls on it.
  await sql`
    ALTER TABLE artworks
      ADD COLUMN IF NOT EXISTS file_sha256 text
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS artworks_file_sha256_idx
      ON artworks (file_sha256)
      WHERE file_sha256 IS NOT NULL
  `.execute(db);

  // Recorded on the run so a reviewer can see the decision was inherited rather than computed,
  // and so the metrics endpoint can separate the two.
  await sql`
    ALTER TABLE screening_runs
      ADD COLUMN IF NOT EXISTS duplicate_of_artwork_id uuid REFERENCES artworks(id) ON DELETE SET NULL
  `.execute(db);
}

async function down(db) {
  await sql`ALTER TABLE screening_runs DROP COLUMN IF EXISTS duplicate_of_artwork_id`.execute(db);
  await sql`DROP INDEX IF EXISTS artworks_file_sha256_idx`.execute(db);
  await sql`ALTER TABLE artworks DROP COLUMN IF EXISTS file_sha256`.execute(db);
  await sql`DROP INDEX IF EXISTS screening_runs_status_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS screening_runs_decision_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS moderation_queue_entity_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS moderation_queue_pending_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS moderation_queue_status_idx`.execute(db);
}

module.exports = { up, down };
