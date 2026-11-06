// src/migrations/20261028000000_grant_marketplace_manage_permission.js
//
// marketplace.manage gates the marketplace admin *configuration* endpoints
// (platform fee rules, print providers, admin order cancellation, review
// removal). Product and seller management reuse merch.moderate and
// sellers.manage. Granted to the admin-tier roles; merged with `||`, so
// re-running is a no-op and hand-made grants are untouched.

const { sql } = require('kysely');

async function up(db) {
  await sql`
    UPDATE roles
    SET permissions = COALESCE(permissions, '{}'::jsonb) || '{"marketplace.manage": true}'::jsonb
    WHERE upper(name) IN ('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'DEVELOPER')
  `.execute(db);
}

async function down() {}

module.exports = { up, down };
