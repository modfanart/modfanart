// Per-entry licensing status: the brand walks each selected winner's
// agreement through its lifecycle by hand, and 'finalized' is what admits the
// artwork to the public gallery (asserted row-level in
// ../artworks/galleryVisibility.test.js - this file covers the endpoint's
// contract: authorization, validation, and the resets that keep a stale
// 'finalized' from surviving deselection or demotion).
//
// Assertions read the database back rather than trusting response bodies,
// matching contestWinners.test.js.

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const { db, requireDatabase } = require('../helpers/db');
const { sql } = require('kysely');
const ContestWinnerController = require('../../src/modules/contests/controller/contestWinner.controller');
const ContestEntryController = require('../../src/modules/contests/controller/contestEntry.controller');
const crypto = require('node:crypto');

// Same late-sorting fixture ids as contestWinners.test.js: suites run in
// parallel and contestEntry.test.js picks "first rows by id", so an ffffffff
// prefix keeps these temporary rows out of that pick.
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

describe('winner licensing status', () => {
  const tag = `lic${Date.now()}`;
  let skipReason = '';
  let ownerId;
  let creatorId;
  let brandId;
  let contestId;
  const artworkIds = [];
  const entryIds = []; // [0]=winner rank 1, [1]=winner rank 2, [2]=approved

  let brandOwnedContestBrandId;
  const brandUser = () => ({
    id: ownerId,
    brands: [{ id: brandOwnedContestBrandId }],
    permissions: {},
  });

  const setLicensing = async (entryId, licensingStatus, user = brandUser()) => {
    const res = makeRes();
    await ContestWinnerController.updateLicensingStatus(
      { params: { contestId, entryId }, body: { licensing_status: licensingStatus }, user },
      res
    );
    return res;
  };

  const entryRow = (id) =>
    db
      .selectFrom('contest_entries')
      .select(['status', 'rank', 'licensing_status'])
      .where('id', '=', id)
      .executeTakeFirstOrThrow();

  before(async () => {
    const { skip, reason } = await requireDatabase();
    if (skip) {
      skipReason = reason;
      return;
    }

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
    const fkRow = await sql`
      SELECT confrelid::regclass::text AS refs
      FROM pg_constraint
      WHERE conname = 'contests_brand_id_fkey'
        AND connamespace = current_schema()::regnamespace
    `.execute(db);
    brandOwnedContestBrandId = /(^|\.)users$/.test(fkRow.rows[0]?.refs || '') ? ownerId : brandId;

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

    const seeds = [
      { status: 'winner', rank: 1 },
      { status: 'winner', rank: 2 },
      { status: 'approved', rank: null },
    ];
    for (let i = 0; i < seeds.length; i++) {
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
          ...seeds[i],
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      entryIds.push(entry.id);
    }
  });

  after(async () => {
    try {
      if (contestId) {
        await db.deleteFrom('contest_entries').where('contest_id', '=', contestId).execute();
        await db.deleteFrom('contests').where('id', '=', contestId).execute();
      }
      if (artworkIds.length) await db.deleteFrom('artworks').where('id', 'in', artworkIds).execute();
      if (brandId) await db.deleteFrom('brands').where('id', '=', brandId).execute();
      if (creatorId) await db.deleteFrom('users').where('id', '=', creatorId).execute();
      if (ownerId) await db.deleteFrom('users').where('id', '=', ownerId).execute();
    } finally {
      await db.destroy();
    }
  });

  it('a new entry starts with licensing not_started', async (t) => {
    if (skipReason) return t.skip(skipReason);
    assert.equal((await entryRow(entryIds[0])).licensing_status, 'not_started');
  });

  it('the brand owner can walk a winner through every licensing status', async (t) => {
    if (skipReason) return t.skip(skipReason);

    for (const value of ['agreement_sent', 'signed', 'declined', 'expired', 'finalized', 'not_started']) {
      const res = await setLicensing(entryIds[0], value);
      assert.equal(res.statusCode, 200, `${value}: ${JSON.stringify(res.body)}`);
      assert.equal(res.body.entry.licensing_status, value);
      assert.equal((await entryRow(entryIds[0])).licensing_status, value);
    }
  });

  it('staff with contests.manage can set licensing status without brand membership', async (t) => {
    if (skipReason) return t.skip(skipReason);

    const staff = { id: creatorId, brands: [], permissions: { 'contests.manage': true } };
    const res = await setLicensing(entryIds[1], 'agreement_sent', staff);
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    assert.equal((await entryRow(entryIds[1])).licensing_status, 'agreement_sent');
  });

  it('rejects a caller who is neither the brand nor staff', async (t) => {
    if (skipReason) return t.skip(skipReason);

    const rando = { id: creatorId, brands: [{ id: lateUuid() }], permissions: {} };
    const res = await setLicensing(entryIds[0], 'signed', rando);
    assert.equal(res.statusCode, 403);
    assert.equal((await entryRow(entryIds[0])).licensing_status, 'not_started');
  });

  it('rejects a value outside the lifecycle', async (t) => {
    if (skipReason) return t.skip(skipReason);

    const res = await setLicensing(entryIds[0], 'licensed');
    assert.equal(res.statusCode, 400);
  });

  it('404s for an unknown contest and for an entry from another contest', async (t) => {
    if (skipReason) return t.skip(skipReason);

    const missingContest = makeRes();
    await ContestWinnerController.updateLicensingStatus(
      {
        params: { contestId: lateUuid(), entryId: entryIds[0] },
        body: { licensing_status: 'signed' },
        user: brandUser(),
      },
      missingContest
    );
    assert.equal(missingContest.statusCode, 404);

    const missingEntry = await setLicensing(lateUuid(), 'signed');
    assert.equal(missingEntry.statusCode, 404);
  });

  it('409s for an entry that is not a selected winner', async (t) => {
    if (skipReason) return t.skip(skipReason);

    const res = await setLicensing(entryIds[2], 'agreement_sent');
    assert.equal(res.statusCode, 409);
    assert.equal((await entryRow(entryIds[2])).licensing_status, 'not_started');
  });

  it('deselection resets licensing progress; kept winners retain theirs', async (t) => {
    if (skipReason) return t.skip(skipReason);

    // entry 0 finalized, entry 1 already agreement_sent from the staff test.
    assert.equal((await setLicensing(entryIds[0], 'finalized')).statusCode, 200);

    // Re-select only entry 1: entry 0 drops back to approved and must lose
    // its 'finalized', or re-selecting it later would make it instantly
    // public without any explicit finalize action.
    const res = makeRes();
    await ContestWinnerController.selectWinners(
      { params: { contestId }, body: { entry_ids: [entryIds[1]] }, user: brandUser() },
      res
    );
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));

    assert.deepEqual(await entryRow(entryIds[0]), {
      status: 'approved',
      rank: null,
      licensing_status: 'not_started',
    });
    assert.deepEqual(await entryRow(entryIds[1]), {
      status: 'winner',
      rank: 1,
      licensing_status: 'agreement_sent',
    });
  });

  it('demoting a winner through updateEntryStatus also resets licensing', async (t) => {
    if (skipReason) return t.skip(skipReason);

    assert.equal((await setLicensing(entryIds[1], 'finalized')).statusCode, 200);

    const res = makeRes();
    await ContestEntryController.updateEntryStatus(
      {
        params: { contestId, entryId: entryIds[1] },
        body: { status: 'rejected' },
        user: brandUser(),
      },
      res
    );
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));

    // rank 1 from the re-selection above; demotion resets licensing, not the
    // recorded rank - selection history stays intact.
    assert.deepEqual(await entryRow(entryIds[1]), {
      status: 'rejected',
      rank: 1,
      licensing_status: 'not_started',
    });
  });

  it('getEntries surfaces licensing_status to the Licensing tab', async (t) => {
    if (skipReason) return t.skip(skipReason);

    // Make entry 0 a winner mid-lifecycle again so the filtered list has one.
    const select = makeRes();
    await ContestWinnerController.selectWinners(
      { params: { contestId }, body: { entry_ids: [entryIds[0]] }, user: brandUser() },
      select
    );
    assert.equal(select.statusCode, 200, JSON.stringify(select.body));
    assert.equal((await setLicensing(entryIds[0], 'signed')).statusCode, 200);

    const res = makeRes();
    await ContestEntryController.getEntries(
      { params: { contestId }, query: { status: 'winner' }, user: brandUser() },
      res
    );
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    assert.equal(res.body.entries.length, 1);
    assert.equal(res.body.entries[0].id, entryIds[0]);
    assert.equal(res.body.entries[0].licensing_status, 'signed');
  });
});
