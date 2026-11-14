// src/migrations/20261114030000_normalise_admin_role_names.js
//
// GA-11: environments had both SUPERADMIN and SUPER_ADMIN, and different
// parts of the code checked different spellings. Canonical name: SUPER_ADMIN.
//   - only SUPERADMIN exists  -> rename it
//   - both exist              -> merge permissions into SUPER_ADMIN and move
//                                its users; the old row is left in place
//                                (unused) so nothing referencing it breaks.
// Code still accepts both spellings (require-admin.js), so this is safe to
// run before or after deploying.

const { sql } = require('kysely');

async function up(db) {
  await sql`
    DO $$
    DECLARE old_id uuid; new_id uuid;
    BEGIN
      SELECT id INTO old_id FROM roles WHERE upper(name) = 'SUPERADMIN' LIMIT 1;
      SELECT id INTO new_id FROM roles WHERE upper(name) = 'SUPER_ADMIN' LIMIT 1;
      IF old_id IS NULL THEN
        RETURN;
      ELSIF new_id IS NULL THEN
        UPDATE roles SET name = 'SUPER_ADMIN' WHERE id = old_id;
      ELSE
        UPDATE roles
           SET permissions = COALESCE((SELECT permissions FROM roles WHERE id = old_id), '{}'::jsonb)
                             || COALESCE(permissions, '{}'::jsonb)
         WHERE id = new_id;
        UPDATE users SET role_id = new_id WHERE role_id = old_id;
      END IF;
    END $$
  `.execute(db);
}

async function down() {}

module.exports = { up, down };
