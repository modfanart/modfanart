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
 * updateContest used to spread req.body straight into .set(). The brand edit
 * page always sends `categories`, which is not a column on contests (they live
 * in contest_categories), so Postgres rejected the statement and every save
 * from that page returned 500 no matter which field had been edited.
 *
 * The visible consequence was that a brand could not move a contest into the
 * judging phase, and scoring is gated on exactly that, so the whole judging
 * feature was deadlocked behind it.
 */
describe('updateContest - ignores fields that are not columns', () => {
  const tag = `cu${Date.now()}`;
  let ownerId;
  let brandId;
  let contestBrandId;
  let contestId;
  // The local public schema predates several production columns (hero_image,
  // gallery). The controller whitelists what production actually has, so on a
  // stale schema these tests would fail for a reason that has nothing to do
  // with the bug. Detect it and say so rather than report a false failure.
  let schemaMatchesProduction = false;

  before(async () => {
    await requireDatabase();

    // brands.user_id is NOT NULL in the local public schema and nullable in
    // prodmirror, so always set it and the fixture works against either.
    const role = await db.selectFrom('roles').select('id').where('name', '=', 'BRAND_OWNER').executeTakeFirst();
    const owner = await db
      .insertInto('users')
      // status is NOT NULL with no default in the local public schema, and
      // defaults to pending_verification in prodmirror. Set it explicitly.
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

    // The local public schema and production disagree about what
    // contests.brand_id points at: public has it referencing users(id), while
    // prodmirror (a structural mirror of production) references brands(id).
    // Follow whichever the connected database actually declares, so this test
    // is meaningful on either and does not encode the stale one.
    const fk = await sql`
      SELECT confrelid::regclass::text AS refs
      FROM pg_constraint
      WHERE conname = 'contests_brand_id_fkey'
        AND connamespace = current_schema()::regnamespace
    `.execute(db);
    const referencesUsers = /(^|\.)users$/.test(fk.rows[0]?.refs || '');
    contestBrandId = referencesUsers ? ownerId : brandId;

    const contest = await db
      .insertInto('contests')
      .values({
        title: `${tag} Contest`,
        slug: `${tag}-contest`,
        description: 'fixture',
        start_date: new Date(),
        submission_end_date: new Date(Date.now() + 86_400_000),
        brand_id: contestBrandId,
        status: 'live',
        // NOT NULL with no default in the local public schema, defaulted in
        // prodmirror. Set explicitly so this fixture works against either.
        visibility: 'public',
        max_entries_per_user: 3,
      })
      .returning('id')
      .executeTakeFirstOrThrow();
    contestId = contest.id;

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

  /** Exactly the payload the brand edit page submits. */
  const editPagePayload = (overrides = {}) => ({
    id: contestId,
    title: `${tag} Contest`,
    description: 'fixture',
    hero_image: null,
    gallery: [],
    rules: null,
    prizes: null,
    start_date: new Date().toISOString(),
    submission_end_date: new Date(Date.now() + 86_400_000).toISOString(),
    voting_end_date: null,
    judging_end_date: null,
    entry_requirements: null,
    judging_criteria: null,
    categories: [],
    visibility: 'public',
    status: 'live',
    max_entries_per_user: 3,
    winner_announced: false,
    ...overrides,
  });

  it('saves the brand edit page payload instead of returning 500', async (t) => {
    if (!schemaMatchesProduction) {
      return t.skip('connected schema predates production columns; run against prodmirror');
    }
    const res = makeRes();
    await ContestController.updateContest(
      { params: { id: contestId }, body: editPagePayload(), user: { id: 'x', brands: [{ id: brandId }] } },
      res
    );

    assert.equal(res.statusCode, 200, `expected 200, got ${res.statusCode} ${JSON.stringify(res.body)}`);
  });

  it('moves the contest into the judging phase, which is what unblocks scoring', async (t) => {
    if (!schemaMatchesProduction) {
      return t.skip('connected schema predates production columns; run against prodmirror');
    }
    const res = makeRes();
    await ContestController.updateContest(
      {
        params: { id: contestId },
        body: editPagePayload({ status: 'judging' }),
        user: { id: 'x', brands: [{ id: brandId }] },
      },
      res
    );

    assert.equal(res.statusCode, 200);

    const row = await db
      .selectFrom('contests')
      .select('status')
      .where('id', '=', contestId)
      .executeTakeFirst();
    assert.equal(row.status, 'judging');
  });

  it('ignores any unknown field rather than failing the whole update', async (t) => {
    if (!schemaMatchesProduction) {
      return t.skip('connected schema predates production columns; run against prodmirror');
    }
    const res = makeRes();
    await ContestController.updateContest(
      {
        params: { id: contestId },
        body: editPagePayload({
          status: 'live',
          categories: ['a'],
          totally_made_up_column: 'x',
          brand_name: 'joined field, not a column',
        }),
        user: { id: 'x', brands: [{ id: brandId }] },
      },
      res
    );

    assert.equal(res.statusCode, 200);

    const row = await db
      .selectFrom('contests')
      .select('status')
      .where('id', '=', contestId)
      .executeTakeFirst();
    assert.equal(row.status, 'live');
  });

  it('does not let a caller move the contest to another brand', async (t) => {
    if (!schemaMatchesProduction) {
      return t.skip('connected schema predates production columns; run against prodmirror');
    }
    const res = makeRes();
    await ContestController.updateContest(
      {
        params: { id: contestId },
        body: editPagePayload({ brand_id: '00000000-0000-0000-0000-000000000000' }),
        user: { id: 'x', brands: [{ id: brandId }] },
      },
      res
    );

    assert.equal(res.statusCode, 200);

    const row = await db
      .selectFrom('contests')
      .select('brand_id')
      .where('id', '=', contestId)
      .executeTakeFirst();
    assert.equal(row.brand_id, contestBrandId);
  });
});
