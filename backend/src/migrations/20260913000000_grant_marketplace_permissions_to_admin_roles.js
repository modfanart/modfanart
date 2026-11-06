// src/migrations/20260913000000_grant_marketplace_permissions_to_admin_roles.js
//
// The marketplace routes are gated on role permission keys that no role had
// been granted, so every admin-only endpoint answered 403:
//   merch.moderate   – approve / reject merch listings
//   sellers.manage   – approve / reject seller applications
//   payouts.manage   – create / settle seller payouts, see all payouts
//   orders.view_all  – read every order on the platform
// Grants them to the admin-tier roles. Merged with `||` so existing
// permissions are untouched, and re-running is a no-op.

const { sql } = require('kysely');

async function up(db) {
  await sql`
    UPDATE roles
    SET permissions = COALESCE(permissions, '{}'::jsonb) || ${sql.lit(
      JSON.stringify({
        'merch.moderate': true,
        'sellers.manage': true,
        'payouts.manage': true,
        'orders.view_all': true,
      })
    )}::jsonb
    WHERE upper(name) IN ('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'DEVELOPER')
  `.execute(db);
}

// Not reversed — revoking would also strip grants an operator made by hand.
async function down() {}

module.exports = { up, down };
