const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const { db, requireDatabase } = require('../helpers/db');
const { sql } = require('kysely');
const ContestController = require('../../src/modules/contests/controller/contest.controller');

/** Minimal Express res double capturing the status/body the controller sends. */
function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      if (this.statusCode === null) this.statusCode = 200;
      return this;
    },
  };
}

/**
 * contests.gallery is a TEXT column holding a JSON array string. createContest
 * has always honoured that (JSON.stringify, or "[]" when empty) and the public
 * contest page JSON.parses it back out, but updateContest handed kysely the raw
 * JS array. node-pg then serialised it as a Postgres array literal - "{}" for an
 * empty gallery - which is not JSON at all.
 *
 * The damage was invisible from the backend: the write succeeded, returned 200,
 * and only surfaced when the brand reopened the edit page, which read the string
 * into state typed string[] and threw `form.gallery.map is not a function`,
 * taking the whole page down behind the global error boundary.
 *
 * These assertions parse the value straight out of the column rather than
 * trusting the controller's own response, because the response echoed back
 * exactly the corruption it had just written.
 */
describe('contest gallery survives a write as valid JSON', () => {
  const tag = `cg${Date.now()}`;
  let ownerId;
  let brandId;
  let contestBrandId;
  let contestId;
  // The local public schema predates hero_image/gallery entirely, so these
  // tests cannot mean anything there. Detect it and say so rather than fail
  // for a reason unrelated to the bug.
  let schemaMatchesProduction = false;

  before(async () => {
    await requireDatabase();

    const role = await db
      .selectFrom('roles')
      .select('id')
      .where('name', '=', 'BRAND_OWNER')
      .executeTakeFirst();
    const owner = await db
      .insertInto('users')
      .values({ username: `${tag}_owner`, email: `${tag}@example.com`, role_id: role?.id, status: 'active' })
      .returning('id')
      .executeTakeFirstOrThrow();
    ownerId = owner.id;

    const brand = await db
      .insertInto('brands')
      .values({ name: `${tag} Brand`, slug: `${tag}-brand`, user_id: ownerId })
      .returning('id')
      .executeTakeFirstOrThrow();
    brandId = brand.id;

    // public references users(id), prodmirror references brands(id). Follow
    // whichever the connected database declares.
    const fk = await sql`
      SELECT confrelid::regclass::text AS refs
      FROM pg_constraint
      WHERE conname = 'contests_brand_id_fkey'
        AND connamespace = current_schema()::regnamespace
    `.execute(db);
    contestBrandId = /(^|\.)users$/.test(fk.rows[0]?.refs || '') ? ownerId : brandId;

    const cols = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'contests' AND table_schema = current_schema()
    `.execute(db);
    const names = new Set(cols.rows.map((r) => r.column_name));
    schemaMatchesProduction = ['hero_image', 'gallery'].every((c) => names.has(c));
  });

  after(async () => {
    if (contestId) await db.deleteFrom('contests').where('id', '=', contestId).execute();
    if (brandId) await db.deleteFrom('brands').where('id', '=', brandId).execute();
    if (ownerId) await db.deleteFrom('users').where('id', '=', ownerId).execute();
  });

  /** Read the column itself, not the controller's echo of what it sent. */
  const storedGallery = async () => {
    const row = await db
      .selectFrom('contests')
      .select('gallery')
      .where('id', '=', contestId)
      .executeTakeFirst();
    return row.gallery;
  };

  const createContest = async (gallery) => {
    const res = makeRes();
    await ContestController.createContest(
      {
        user: { id: ownerId, brands: [{ id: contestBrandId }], permissions: { 'contests.manage': true } },
        body: {
          brand_id: contestBrandId,
          title: `${tag} Contest`,
          slug: `${tag}-contest`,
          description: 'fixture',
          start_date: new Date().toISOString(),
          submission_end_date: new Date(Date.now() + 86_400_000).toISOString(),
          visibility: 'public',
          status: 'live',
          max_entries_per_user: 3,
          ...(gallery === undefined ? {} : { gallery }),
        },
      },
      res
    );
    assert.equal(res.statusCode, 201, `create failed: ${JSON.stringify(res.body)}`);
    contestId = (res.body.data || res.body).id;
  };

  const updateGallery = async (gallery) => {
    const res = makeRes();
    await ContestController.updateContest({ params: { id: contestId }, body: { gallery } }, res);
    return res;
  };

  it('stores a JSON array, not a Postgres array literal', async (t) => {
    if (!schemaMatchesProduction) {
      return t.skip('connected schema predates production columns; run against prodmirror');
    }
    await createContest(['https://cdn/1.png']);

    const res = await updateGallery(['https://cdn/1.png', 'https://cdn/2.png']);
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));

    const raw = await storedGallery();
    // Before the fix this read {"https://cdn/1.png","https://cdn/2.png"}, and
    // JSON.parse throws on it - which is what the public contest page calls.
    assert.doesNotThrow(
      () => JSON.parse(raw),
      `gallery is not valid JSON: ${raw}`
    );
    assert.deepEqual(JSON.parse(raw), ['https://cdn/1.png', 'https://cdn/2.png']);
  });

  it('stores an empty gallery as [] rather than {}', async (t) => {
    if (!schemaMatchesProduction) {
      return t.skip('connected schema predates production columns; run against prodmirror');
    }
    // This is the exact write that broke production: the brand edit page always
    // sends gallery: [], and it landed as the string "{}".
    const res = await updateGallery([]);
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));

    const raw = await storedGallery();
    assert.notEqual(raw, '{}', 'empty gallery was written as a Postgres array literal');
    assert.deepEqual(JSON.parse(raw), []);
  });

  it('round-trips: what createContest writes, updateContest can rewrite unchanged', async (t) => {
    if (!schemaMatchesProduction) {
      return t.skip('connected schema predates production columns; run against prodmirror');
    }
    // A save that changes nothing must leave the column byte-identical.
    // Saving repeatedly is the normal case, and each save used to corrupt further.
    await updateGallery(['https://cdn/a.png']);
    const first = await storedGallery();

    await updateGallery(JSON.parse(first));
    const second = await storedGallery();

    assert.equal(second, first, 'a no-op save rewrote the value');
  });

  it('still rejects a non-array, so a raw string cannot round-trip the corruption', async (t) => {
    if (!schemaMatchesProduction) {
      return t.skip('connected schema predates production columns; run against prodmirror');
    }
    const res = await updateGallery('{}');

    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /gallery must be an array/);
  });
});
