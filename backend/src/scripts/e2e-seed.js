// Seeds the local end-to-end environment for the AI screening flow:
//   npm run e2e:seed            create or refresh the accounts, brand, contest and categories
//   npm run e2e:seed -- --reset also delete the test artist's submissions and the brand's
//                               screening rules and style guides, for a clean run
//
// Three accounts are created in the Firebase Auth emulator and linked to database users with the
// roles the UI keys off: an artist, a brand manager who owns "Acme Comics", and a platform admin.
// Every account's password is `password123`.
//
// It refuses to run unless the Auth emulator is configured and the database is on this machine,
// so it cannot create accounts in the real Firebase project or write to a shared database.
const EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const DATABASE_URL = process.env.DATABASE_URL ?? "";

if (!EMULATOR) {
  console.error("Refusing to run: FIREBASE_AUTH_EMULATOR_HOST is not set. Use `npm run e2e:seed`.");
  process.exit(1);
}

if (!/@(localhost|127\.0\.0\.1)(:\d+)?\//.test(DATABASE_URL)) {
  console.error("Refusing to run: DATABASE_URL is not a local database. Use `npm run e2e:seed`.");
  process.exit(1);
}

process.env.DB_QUIET = "true";

const { sql } = require("kysely");
const { db } = require("../config");

const PASSWORD = "password123";
const RESET = process.argv.includes("--reset");

const ACCOUNTS = [
  { key: "artist", email: "artist@local.test", username: "local_artist", role: "ARTIST" },
  { key: "brand", email: "brand@local.test", username: "local_brand", role: "BRAND_MANAGER" },
  { key: "admin", email: "admin@local.test", username: "local_admin", role: "ADMIN" },
];

// The role names the code checks (auth sync, brand detection, dashboards). Admin carries the
// wildcard the screening permission checks honour; the rest get their access from data (brand
// ownership), not permissions.
const ROLES = [
  { name: "DEFAULT_USER", hierarchy_level: 0, permissions: {} },
  { name: "ARTIST", hierarchy_level: 10, permissions: {} },
  { name: "BRAND_MANAGER", hierarchy_level: 20, permissions: {} },
  { name: "ADMIN", hierarchy_level: 100, permissions: { "*": true } },
];

const BRAND = { name: "Acme Comics", slug: "acme-comics" };
const CONTEST = { title: "Acme Hero Fan Art Contest", slug: "acme-hero-fan-art" };
const CATEGORIES = [
  { name: "Illustration", slug: "illustration" },
  { name: "Comic", slug: "comic" },
];

async function emulator(path, body) {
  const response = await fetch(
    `http://${EMULATOR}/identitytoolkit.googleapis.com/v1/${path}?key=e2e`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }
  );
  return response.json();
}

/** Creates the emulator account, or signs in to it when it already exists. Returns its uid. */
async function firebaseUid(email) {
  const credentials = { email, password: PASSWORD, returnSecureToken: true };
  const created = await emulator("accounts:signUp", credentials);

  if (created.localId) return created.localId;

  if (created.error?.message !== "EMAIL_EXISTS") {
    throw new Error(`Auth emulator refused ${email}: ${created.error?.message ?? "no response"}`);
  }

  const signedIn = await emulator("accounts:signInWithPassword", credentials);

  if (!signedIn.localId) {
    throw new Error(`Could not sign in to the existing emulator account ${email}`);
  }

  return signedIn.localId;
}

async function ensureRoles() {
  const ids = {};

  for (const role of ROLES) {
    let row = await db.selectFrom("roles").select(["id"]).where("name", "=", role.name).executeTakeFirst();

    if (!row) {
      row = await db
        .insertInto("roles")
        .values({ ...role, is_system: true, permissions: JSON.stringify(role.permissions) })
        .returning(["id"])
        .executeTakeFirst();
    }

    ids[role.name] = row.id;
  }

  return ids;
}

async function ensureUser(account, roleId) {
  const uid = await firebaseUid(account.email);
  const existing = await db
    .selectFrom("users")
    .select(["id"])
    .where("email", "=", account.email)
    .executeTakeFirst();

  if (existing) {
    await db
      .updateTable("users")
      .set({ firebase_uid: uid, role_id: roleId, status: "active", deleted_at: null, updated_at: sql`NOW()` })
      .where("id", "=", existing.id)
      .execute();
    return existing.id;
  }

  const taken = await db
    .selectFrom("users")
    .select(["id"])
    .where("username", "=", account.username)
    .executeTakeFirst();

  const created = await db
    .insertInto("users")
    .values({
      username: taken ? `${account.username}_${Date.now() % 100000}` : account.username,
      email: account.email,
      email_verified: true,
      firebase_uid: uid,
      role_id: roleId,
      status: "active",
    })
    .returning(["id"])
    .executeTakeFirst();

  return created.id;
}

async function ensureBrand(ownerId) {
  let brand = await db.selectFrom("brands").select(["id"]).where("slug", "=", BRAND.slug).executeTakeFirst();

  if (brand) {
    await db
      .updateTable("brands")
      .set({ user_id: ownerId, status: "active", deleted_at: null, updated_at: sql`NOW()` })
      .where("id", "=", brand.id)
      .execute();
  } else {
    brand = await db
      .insertInto("brands")
      .values({ ...BRAND, user_id: ownerId, status: "active", description: "Local e2e test brand" })
      .returning(["id"])
      .executeTakeFirst();
  }

  const manager = await db
    .selectFrom("brand_managers")
    .select(["id"])
    .where("brand_id", "=", brand.id)
    .where("user_id", "=", ownerId)
    .executeTakeFirst();

  if (!manager) {
    await db.insertInto("brand_managers").values({ brand_id: brand.id, user_id: ownerId, role: "owner" }).execute();
  }

  return brand.id;
}

/** A contest open for submissions for the next 30 days, re-opened on every run. */
async function ensureContest(brandId) {
  const window = {
    status: "live",
    visibility: "public",
    max_entries_per_user: 25,
    start_date: sql`NOW() - INTERVAL '1 day'`,
    submission_end_date: sql`NOW() + INTERVAL '30 days'`,
    voting_end_date: sql`NOW() + INTERVAL '40 days'`,
    judging_end_date: sql`NOW() + INTERVAL '45 days'`,
  };

  const contest = await db.selectFrom("contests").select(["id"]).where("slug", "=", CONTEST.slug).executeTakeFirst();

  if (contest) {
    await db
      .updateTable("contests")
      .set({ ...window, brand_id: brandId, deleted_at: null, updated_at: sql`NOW()` })
      .where("id", "=", contest.id)
      .execute();
    return contest.id;
  }

  const created = await db
    .insertInto("contests")
    .values({ ...CONTEST, ...window, brand_id: brandId, description: "Draw the Acme hero." })
    .returning(["id"])
    .executeTakeFirst();

  return created.id;
}

async function ensureCategories() {
  for (const [index, category] of CATEGORIES.entries()) {
    const existing = await db.selectFrom("categories").select(["id"]).where("slug", "=", category.slug).executeTakeFirst();
    if (!existing) {
      await db.insertInto("categories").values({ ...category, is_active: true, sort_order: index + 1 }).execute();
    }
  }
}

/** Removes the test artist's submissions and the brand's screening setup. */
async function reset({ artistId, brandId }) {
  const artworks = await db.selectFrom("artworks").select(["id"]).where("creator_id", "=", artistId).execute();
  const entries = await db.selectFrom("contest_entries").select(["id"]).where("creator_id", "=", artistId).execute();
  const ids = [...artworks, ...entries].map((row) => row.id);

  if (ids.length) {
    await db.deleteFrom("moderation_queue").where("entity_id", "in", ids).execute();
    await db.deleteFrom("taggings").where("taggable_id", "in", ids).execute();
  }

  await db.deleteFrom("contest_entries").where("creator_id", "=", artistId).execute();
  // Screening runs go with their artwork (ON DELETE CASCADE).
  await db.deleteFrom("artworks").where("creator_id", "=", artistId).execute();
  await db.deleteFrom("notifications").where("user_id", "=", artistId).execute();
  await db.deleteFrom("style_guides").where("brand_id", "=", brandId).execute();
  await db
    .deleteFrom("rulesets")
    .where("brand_id", "=", brandId)
    .where(({ not, exists, selectFrom }) =>
      not(exists(selectFrom("screening_runs").select("id").whereRef("screening_runs.ruleset_id", "=", "rulesets.id")))
    )
    .execute();

  return artworks.length;
}

async function main() {
  const roleIds = await ensureRoles();
  const userIds = {};

  for (const account of ACCOUNTS) {
    userIds[account.key] = await ensureUser(account, roleIds[account.role]);
  }

  const brandId = await ensureBrand(userIds.brand);
  const contestId = await ensureContest(brandId);
  await ensureCategories();

  const removed = RESET ? await reset({ artistId: userIds.artist, brandId }) : null;

  const artist = await db.selectFrom("users").select(["username"]).where("id", "=", userIds.artist).executeTakeFirst();

  const platform = await db
    .selectFrom("rulesets")
    .select(["version", "config"])
    .where("brand_id", "is", null)
    .orderBy("version", "desc")
    .executeTakeFirst();

  console.log(`
Seeded the local AI screening environment${RESET ? ` (reset: removed ${removed} artwork(s))` : ""}.

  Accounts (password: ${PASSWORD})
    artist@local.test   artist      → http://localhost:3000
    brand@local.test    brand owner → http://localhost:3000/brand-manager/${BRAND.slug}
    admin@local.test    admin       → http://localhost:5173/admin/moderation

  Contest  "${CONTEST.title}"
    page   http://localhost:3000/contest/${contestId}
    upload http://localhost:3000/artist/${artist.username}/my-artworks/new?contest=${contestId}

  Platform default rules: version ${platform?.version ?? "none — run npm run e2e:migrate"}${
    platform ? `, requireHumanReview=${platform.config.requireHumanReview ?? true}` : ""
  }`);
}

main()
  .catch((error) => {
    console.error("e2e seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
