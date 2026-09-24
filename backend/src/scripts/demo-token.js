// Mints a real Firebase ID token for a local account, with no password required.
//
//   node src/scripts/demo-token.js [email]
//
// Signing in with email/password only works if the account has a password credential — most of
// these accounts are OAuth, and the demo user seeded by demo-seed.js has none at all. The Admin SDK
// solves it: mint a custom token for the user's firebase_uid, then exchange it for a genuine ID
// token through the same public endpoint the web app uses.
//
// The resulting token is verified by `authenticateToken` exactly like a browser's, so nothing about
// the auth path is stubbed or weakened for the demo.
process.env.DB_QUIET = process.env.DB_QUIET ?? "true";

require("dotenv").config({ quiet: true });

const fs = require("node:fs");
const path = require("node:path");

const admin = require("../config/firebase");
const { sql } = require("kysely");
const { db } = require("../config");

const DEMO_EMAIL = "demo@modfanart.test";
const REQUIRED = ["moderation.review", "screening.manage"];

/**
 * The web API key is public by design (it ships in the browser bundle), so reading it from the
 * frontend's env file is not a secret leak — it is the same value any visitor already has.
 */
function webApiKey() {
  if (process.env.FIREBASE_WEB_API_KEY) return process.env.FIREBASE_WEB_API_KEY;

  const envPath = path.join(__dirname, "../../../frontend/.env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(
      "Set FIREBASE_WEB_API_KEY, or make frontend/.env.local available so the key can be read from it."
    );
  }

  const match = fs
    .readFileSync(envPath, "utf8")
    .match(/^NEXT_PUBLIC_FIREBASE_API_KEY=(.+)$/m);

  if (!match) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY not found in frontend/.env.local");
  }

  return match[1].trim().replace(/^["']|["']$/g, "");
}

async function ensurePermissions(user) {
  const held = user.permissions ?? {};
  const missing = REQUIRED.filter(
    (p) => held[p] !== true && held["*"] !== true && held.all !== true
  );

  if (!missing.length) return user.role;

  const merged = { ...held };
  for (const p of REQUIRED) merged[p] = true;

  const role = await db
    .insertInto("roles")
    .values({ name: "SCREENING_DEMO", permissions: JSON.stringify(merged) })
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

  console.log(`Granted ${missing.join(", ")} via role ${role.name}.`);
  return role.name;
}

async function main() {
  const email = process.argv[2] ?? DEMO_EMAIL;

  const user = await db
    .selectFrom("users as u")
    .leftJoin("roles as r", "r.id", "u.role_id")
    .select([
      "u.id",
      "u.email",
      "u.firebase_uid",
      "u.status",
      "r.name as role",
      "r.permissions as permissions",
    ])
    .where("u.email", "=", email)
    .executeTakeFirst();

  if (!user) {
    throw new Error(`No user with email ${email}. Run: npm run demo:seed`);
  }

  if (!user.firebase_uid) {
    throw new Error(`${email} has no firebase_uid, so no token can be minted for it.`);
  }

  if (user.status !== "active") {
    await db
      .updateTable("users")
      .set({ status: "active", updated_at: sql`NOW()` })
      .where("id", "=", user.id)
      .execute();
    console.log(`Activated ${email} (was '${user.status}').`);
  }

  const role = await ensurePermissions(user);

  const customToken = await admin.auth().createCustomToken(user.firebase_uid);

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${webApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );

  const body = await response.json();

  if (!response.ok || !body.idToken) {
    throw new Error(
      `Firebase refused the exchange (${response.status}): ${JSON.stringify(body.error ?? body)}`
    );
  }

  console.log(`\n${user.email}  role=${role}  uid=${user.firebase_uid}`);
  console.log(`Token valid for ~${Math.round((body.expiresIn ?? 3600) / 60)} minutes.\n`);
  console.log("Shell:");
  console.log(`  export TOKEN='${body.idToken}'\n`);
  console.log("Postman: paste into the id_token collection variable.\n");
}

main()
  .catch((error) => {
    console.error("\ndemo-token failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
