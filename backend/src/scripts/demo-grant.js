// Grants a local account the permissions the screening and moderation routes require.
//
//   node src/scripts/demo-grant.js someone@example.com
//
// Screening routes check `moderation.review` and `screening.manage` against roles.permissions. A
// freshly synced account gets whatever the default seed role is, which holds neither, so every new
// route answers 403 until this runs.
//
// Deliberately does not edit the user's existing role in place: that role is shared, and widening it
// would quietly grant moderation rights to everyone who holds it. Instead it creates a dedicated
// role carrying the existing permissions plus the two new ones, and points this one account at it.
process.env.DB_QUIET = process.env.DB_QUIET ?? "true";

require("dotenv").config({ quiet: true });

const { sql } = require("kysely");
const { db } = require("../config");

const REQUIRED = ["moderation.review", "screening.manage"];
const DEMO_ROLE = "SCREENING_DEMO";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: node src/scripts/demo-grant.js <email>");
    process.exit(1);
  }

  const user = await db
    .selectFrom("users as u")
    .leftJoin("roles as r", "r.id", "u.role_id")
    .select([
      "u.id",
      "u.email",
      "u.status",
      "u.firebase_uid",
      "r.name as role",
      "r.permissions as permissions",
    ])
    .where("u.email", "=", email)
    .executeTakeFirst();

  if (!user) {
    console.error(
      `No user with email ${email}.\n` +
        "Sign in through Postman request 01, then run request 02 (POST /api/auth/sync) to create the row, then re-run this."
    );
    process.exit(1);
  }

  if (!user.firebase_uid) {
    console.warn(
      `Warning: ${email} has no firebase_uid, so authenticateToken will not match it. ` +
        "Run POST /api/auth/sync while signed in as this account."
    );
  }

  const existing = user.permissions ?? {};
  const merged = { ...existing };
  for (const permission of REQUIRED) merged[permission] = true;

  const role = await db
    .insertInto("roles")
    .values({
      name: DEMO_ROLE,
      permissions: JSON.stringify(merged),
    })
    .onConflict((oc) =>
      oc.column("name").doUpdateSet({ permissions: JSON.stringify(merged) })
    )
    .returning(["id", "name"])
    .executeTakeFirst();

  await db
    .updateTable("users")
    .set({ role_id: role.id, updated_at: sql`NOW()` })
    .where("id", "=", user.id)
    .execute();

  // authenticateToken also requires status 'active', which is easy to miss on a fresh sync.
  if (user.status !== "active") {
    await db
      .updateTable("users")
      .set({ status: "active", updated_at: sql`NOW()` })
      .where("id", "=", user.id)
      .execute();
    console.log(`Activated ${email} (was '${user.status}').`);
  }

  console.log(`\n${email}`);
  console.log(`  user id  : ${user.id}`);
  console.log(`  was role : ${user.role ?? "(none)"}`);
  console.log(`  now role : ${role.name}`);
  console.log(`  granted  : ${REQUIRED.join(", ")}`);
  console.log("\nRe-run Postman request 01 to mint a fresh token, then the screening routes will pass.\n");
}

main()
  .catch((error) => {
    console.error("demo-grant failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
