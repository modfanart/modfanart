// src/migrations/20260812000000_seed_judge_role.js
//
// The Assign Judge dialog has never worked: it creates users with role
// "judge" and filters the existing-judge dropdown by role "JUDGE", but no
// judge role has ever existed. `roles` has never been seeded by any
// migration, so its rows were inserted by hand, which is also how the
// duplicate admin/Admin pair arose. Seeding here so every environment gets
// the row instead of drifting.
//
// The role is descriptive only. Judging authorization is enforced through
// the contest_judges table, not through this role, so the permissions blob
// mirrors the Brand/Artist convention rather than granting anything.

const { sql } = require('kysely');

const ROLE_NAME = 'Judge';

async function up(db) {
  // ON CONFLICT so re-running is safe, and so environments where someone
  // already added the row by hand do not fail the migration.
  await sql`
    INSERT INTO roles (name, hierarchy_level, is_system, permissions)
    VALUES (${ROLE_NAME}, 50, false, ${sql.lit(JSON.stringify({ judge_contest: true }))}::jsonb)
    ON CONFLICT (name) DO NOTHING
  `.execute(db);
}

async function down(db) {
  // Only remove the role if nobody has been assigned it, otherwise the
  // users.role_id foreign key would break.
  await sql`
    DELETE FROM roles
    WHERE name = ${ROLE_NAME}
      AND NOT EXISTS (
        SELECT 1 FROM users WHERE users.role_id = roles.id
      )
  `.execute(db);
}

module.exports = { up, down };
