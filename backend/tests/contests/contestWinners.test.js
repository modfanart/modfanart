// Winner selection and the public results share link.
//
// Every assertion that matters reads the database back rather than trusting
// the controller's response body: the feature exists to write winner/rank
// rows that distributePrizes later reads, and to serve them to an
// unauthenticated viewer, so those rows are what gets asserted.

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const { db, requireDatabase } = require('../helpers/db');
const { sql } = require('kysely');
const ContestWinnerController = require('../../src/modules/contests/controller/contestWinner.controller');
const crypto = require('node:crypto');

/**
 * Fixture ids that sort AFTER every real row. contestEntry.test.js builds its
 * fixture from "the first rows ordered by id" across users/contests/artworks;
 * when suites run in parallel it could pick these temporary rows and then
 * watch them vanish in after(), failing on a foreign key that has nothing to
 * do with what it tests. uuids are compared bytewise, so an ffffffff prefix
 * keeps these rows out of any lowest-id-first pick.
 */
const lateUuid = () => 'ffffffff' + crypto.randomUUID().slice(8);

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

describe('winner selection and public results', () => {
  const tag = `wn${Date.now()}`;
  let skipReason = '';
  let ownerId;
  let creatorId;
  let brandId;
  let contestId;
  const artworkIds = [];
  const entryIds = []; // [0]=approved, [1]=approved, [2]=pending

  const brandUser = () => ({
    id: ownerId,
    brands: [{ id: brandOwnedContestBrandId }],
    permissions: {},
  });
  let brandOwnedContestBrandId;
  // getPublicResults selects contests.hero_image, which production has and
  // the stale local public schema does not. Same detect-and-skip as
  // contestUpdate.test.js: a skip names the real cause, a failure here would
  // lie about the code. Run against prodmirror for the truthful result.
  let schemaMatchesProduction = false;

  before(async () => {
    const { skip, reason } = await requireDatabase();
    if (skip) {
      skipReason = reason;
      return;
    }

    const cols = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'contests' AND table_schema = current_schema()
    `.execute(db);
    schemaMatchesProduction = cols.rows.some((r) => r.column_name === 'hero_image');

    // users.role_id is nullable in the stale local public schema but NOT NULL
    // in prodmirror/production, so both fixtures always get a real role.
    const roles = await db.selectFrom('roles').select(['id', 'name']).execute();
    const roleId = (name) => (roles.find((r) => r.name === name) ?? roles[0])?.id;

    const owner = await db
      .insertInto('users')
      .values({ id: lateUuid(), username: `${tag}_owner`, email: `${tag}_o@example.com`, role_id: roleId('BRAND_OWNER'), status: 'active' })
      .returning('id')
      .executeTakeFirstOrThrow();
    ownerId = owner.id;

    const creator = await db
      .insertInto('users')
      .values({ id: lateUuid(), username: `${tag}_artist`, email: `${tag}_a@example.com`, role_id: roleId('ARTIST'), status: 'active' })
      .returning('id')
      .executeTakeFirstOrThrow();
    creatorId = creator.id;

    const brand = await db
      .insertInto('brands')
      .values({ id: lateUuid(), name: `${tag} Brand`, slug: `${tag}-brand`, user_id: ownerId })
      .returning('id')
      .executeTakeFirstOrThrow();
    brandId = brand.id;

    // contests.brand_id references users(id) in the stale local public schema
    // and brands(id) in prodmirror/production. Follow the connected schema.
    const fk = await sql`
      SELECT confrelid::regclass::text AS refs
      FROM pg_constraint
      WHERE conname = 'contests_brand_id_fkey'
        AND connamespace = current_schema()::regnamespace
    `.execute(db);
    const referencesUsers = /(^|\.)users$/.test(fk.rows[0]?.refs || '');
    brandOwnedContestBrandId = referencesUsers ? ownerId : brandId;

    const contest = await db
      .insertInto('contests')
      .values({
        id: lateUuid(),
        title: `${tag} Contest`,
        slug: `${tag}-contest`,
        description: 'fixture',
        start_date: new Date(),
        submission_end_date: new Date(Date.now() + 86_400_000),
        brand_id: brandOwnedContestBrandId,
        status: 'judging',
        visibility: 'public',
        max_entries_per_user: 3,
      })
      .returning('id')
      .executeTakeFirstOrThrow();
    contestId = contest.id;

    const statuses = ['approved', 'approved', 'pending'];
    for (let i = 0; i < statuses.length; i++) {
      const artwork = await db
        .insertInto('artworks')
        .values({
          id: lateUuid(),
          creator_id: creatorId,
          title: `${tag} art ${i}`,
          file_url: `https://cdn.example/${tag}-${i}.png`,
          status: 'published',
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      artworkIds.push(artwork.id);

      const entry = await db
        .insertInto('contest_entries')
        .values({
          id: lateUuid(),
          contest_id: contestId,
          artwork_id: artwork.id,
          creator_id: creatorId,
          status: statuses[i],
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      entryIds.push(entry.id);
    }
  });

  after(async () => {
    if (contestId) {
      await db.deleteFrom('contest_entries').where('contest_id', '=', contestId).execute();
      await db.deleteFrom('contests').where('id', '=', contestId).execute();
    }
    if (artworkIds.length) await db.deleteFrom('artworks').where('id', 'in', artworkIds).execute();
    if (brandId) await db.deleteFrom('brands').where('id', '=', brandId).execute();
    if (creatorId) await db.deleteFrom('users').where('id', '=', creatorId).execute();
    if (ownerId) await db.deleteFrom('users').where('id', '=', ownerId).execute();
  });

  const readEntries = async () =>
    db
      .selectFrom('contest_entries')
      .select(['id', 'status', 'rank'])
      .where('contest_id', '=', contestId)
      .execute();

  it('marks the selected entries winner with rank by position', async (t) => {
    if (skipReason) return t.skip(skipReason);

    const res = makeRes();
    await ContestWinnerController.selectWinners(
      { params: { contestId }, user: brandUser(), body: { entry_ids: [entryIds[1], entryIds[0]] } },
      res
    );
    assert.equal(res.statusCode, 200, `expected 200, got ${res.statusCode}: ${JSON.stringify(res.body)}`);

    const rows = await readEntries();
    const byId = new Map(rows.map((r) => [r.id, r]));
    assert.deepEqual(
      { status: byId.get(entryIds[1]).status, rank: byId.get(entryIds[1]).rank },
      { status: 'winner', rank: 1 }
    );
    assert.deepEqual(
      { status: byId.get(entryIds[0]).status, rank: byId.get(entryIds[0]).rank },
      { status: 'winner', rank: 2 }
    );
    assert.equal(byId.get(entryIds[2]).status, 'pending');
  });

  it('re-selection resets dropped winners back to approved with no rank', async (t) => {
    if (skipReason) return t.skip(skipReason);

    const res = makeRes();
    await ContestWinnerController.selectWinners(
      { params: { contestId }, user: brandUser(), body: { entry_ids: [entryIds[0]] } },
      res
    );
    assert.equal(res.statusCode, 200);

    const rows = await readEntries();
    const byId = new Map(rows.map((r) => [r.id, r]));
    assert.deepEqual(
      { status: byId.get(entryIds[0]).status, rank: byId.get(entryIds[0]).rank },
      { status: 'winner', rank: 1 }
    );
    // The previously ranked-1 entry must not linger as a phantom winner:
    // distributePrizes pays every status='winner' row it finds.
    assert.deepEqual(
      { status: byId.get(entryIds[1]).status, rank: byId.get(entryIds[1]).rank },
      { status: 'approved', rank: null }
    );
  });

  it('refuses a pending entry with 400 and writes nothing', async (t) => {
    if (skipReason) return t.skip(skipReason);

    const beforeRows = await readEntries();
    const res = makeRes();
    await ContestWinnerController.selectWinners(
      { params: { contestId }, user: brandUser(), body: { entry_ids: [entryIds[2]] } },
      res
    );
    assert.equal(res.statusCode, 400);
    assert.deepEqual(await readEntries(), beforeRows, 'a rejected selection must not modify entries');
  });

  it('refuses a non-array body and a duplicate id with 400', async (t) => {
    if (skipReason) return t.skip(skipReason);

    for (const body of [{}, { entry_ids: 'nope' }, { entry_ids: [entryIds[0], entryIds[0]] }]) {
      const res = makeRes();
      await ContestWinnerController.selectWinners(
        { params: { contestId }, user: brandUser(), body },
        res
      );
      assert.equal(res.statusCode, 400, `expected 400 for ${JSON.stringify(body)}`);
    }
  });

  it('refuses a manager of a different brand with 403', async (t) => {
    if (skipReason) return t.skip(skipReason);

    const res = makeRes();
    await ContestWinnerController.selectWinners(
      {
        params: { contestId },
        user: { id: creatorId, brands: [{ id: 'some-other-brand' }], permissions: {} },
        body: { entry_ids: [entryIds[0]] },
      },
      res
    );
    assert.equal(res.statusCode, 403);
  });

  it('share link mints a token once and persists it on the contest', async (t) => {
    if (skipReason) return t.skip(skipReason);

    const first = makeRes();
    await ContestWinnerController.getResultsShareLink(
      { params: { contestId }, user: brandUser() },
      first
    );
    assert.equal(first.statusCode, 200);
    assert.match(first.body.share_url, /\/results\/[A-Za-z0-9_-]{16,}$/);

    const row = await db
      .selectFrom('contests')
      .select('results_share_token')
      .where('id', '=', contestId)
      .executeTakeFirstOrThrow();
    assert.ok(row.results_share_token, 'token was not persisted');
    assert.ok(first.body.share_url.endsWith(row.results_share_token));

    // Idempotent: the second ask returns the same link, not a new token that
    // silently invalidates the one already sent around.
    const second = makeRes();
    await ContestWinnerController.getResultsShareLink(
      { params: { contestId }, user: brandUser() },
      second
    );
    assert.equal(second.body.share_url, first.body.share_url);
  });

  it('share link is refused for a non-owner with 403 and mints nothing', async (t) => {
    if (skipReason) return t.skip(skipReason);

    // A fresh contest with no token, so a 403 that still minted one is caught.
    const other = await db
      .insertInto('contests')
      .values({
        id: lateUuid(),
        title: `${tag} Other`,
        slug: `${tag}-other`,
        description: 'fixture',
        start_date: new Date(),
        submission_end_date: new Date(Date.now() + 86_400_000),
        brand_id: brandOwnedContestBrandId,
        status: 'judging',
        visibility: 'public',
        max_entries_per_user: 3,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    try {
      const res = makeRes();
      await ContestWinnerController.getResultsShareLink(
        { params: { contestId: other.id }, user: { id: creatorId, brands: [], permissions: {} } },
        res
      );
      assert.equal(res.statusCode, 403);

      const row = await db
        .selectFrom('contests')
        .select('results_share_token')
        .where('id', '=', other.id)
        .executeTakeFirstOrThrow();
      assert.equal(row.results_share_token, null);
    } finally {
      await db.deleteFrom('contests').where('id', '=', other.id).execute();
    }
  });

  it('public results need no user and expose winners without scores', async (t) => {
    if (skipReason) return t.skip(skipReason);
    if (!schemaMatchesProduction)
      return t.skip('local schema predates contests.hero_image; run against prodmirror');

    const token = (
      await db
        .selectFrom('contests')
        .select('results_share_token')
        .where('id', '=', contestId)
        .executeTakeFirstOrThrow()
    ).results_share_token;

    // req.user deliberately absent - this is the whole point of the route.
    const res = makeRes();
    await ContestWinnerController.getPublicResults({ params: { token } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.contest.title, `${tag} Contest`);
    assert.equal(res.body.winners.length, 1);
    assert.equal(res.body.winners[0].rank, 1);
    assert.equal(res.body.winners[0].creator_username, `${tag}_artist`);
    assert.match(res.body.winners[0].artwork_file_url, /^https:\/\/cdn\.example\//);

    // Nothing about judging may leak through this response.
    const flat = JSON.stringify(res.body).toLowerCase();
    assert.ok(!flat.includes('score'), `response leaks scoring data: ${flat}`);
    assert.ok(!flat.includes('judge'), `response leaks judge data: ${flat}`);
  });

  it('an unknown or trivially short token 404s', async (t) => {
    if (skipReason) return t.skip(skipReason);
    if (!schemaMatchesProduction)
      return t.skip('local schema predates contests.hero_image; run against prodmirror');

    for (const token of ['nope', 'x'.repeat(32)]) {
      const res = makeRes();
      await ContestWinnerController.getPublicResults({ params: { token } }, res);
      assert.equal(res.statusCode, 404, `expected 404 for token ${token}`);
      assert.equal(res.body.winners, undefined);
    }
  });
});
