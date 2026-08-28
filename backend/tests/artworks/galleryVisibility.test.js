// tests/artworks/galleryVisibility.test.js
//
// Row-level regression test for the public gallery gate.
//
// The compile-only tests in ../artwork.visibility.test.js pin the SQL shape.
// This file runs the real controllers against a database and proves the gate
// on actual rows. Since the licensing check-in (2026-08-27) the gate is:
// an artwork is publicly listed only when its contest entry is a selected
// winner (status='winner') whose licensing the brand explicitly finalized
// (licensing_status='finalized'). Brand approval still publishes the artwork
// row (so it stays addressable), but approval alone no longer lists it, and
// neither does selection without finalization.

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { sql } = require('kysely');

const { db, requireDatabase } = require('../helpers/db');
const ArtworkController = require('../../src/modules/artworks/controller/artwork.controller');
const ContestEntryController = require('../../src/modules/contests/controller/contestEntry.controller');
const ContestWinnerController = require('../../src/modules/contests/controller/contestWinner.controller');

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

describe('public gallery lists only finalized winners', () => {
  const tag = `galvis_${Date.now().toString(36)}`;

  let ownerId;
  let brandId;
  let contestId;
  let contestBrandId;
  /** @type {Record<'approved'|'pending'|'draft', { artworkId: string, entryId: string }>} */
  const fx = {};

  /** Public gallery ids for this test's rows only (unique title tag). */
  async function galleryIds() {
    const res = makeRes();
    await ArtworkController.getArtworks({ query: { search: tag, limit: '50' } }, res);
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    return { ids: res.body.artworks.map((a) => a.id).sort(), total: res.body.pagination.total };
  }

  function brandUser() {
    return { id: ownerId, brands: [{ id: contestBrandId }] };
  }

  async function setEntryStatus(entryId, status) {
    const res = makeRes();
    await ContestEntryController.updateEntryStatus(
      { params: { contestId, entryId }, body: { status }, user: brandUser() },
      res
    );
    return res;
  }

  async function selectWinners(entryIds) {
    const res = makeRes();
    await ContestWinnerController.selectWinners(
      { params: { contestId }, body: { entry_ids: entryIds }, user: brandUser() },
      res
    );
    return res;
  }

  async function setLicensingStatus(entryId, licensingStatus) {
    const res = makeRes();
    await ContestWinnerController.updateLicensingStatus(
      {
        params: { contestId, entryId },
        body: { licensing_status: licensingStatus },
        user: brandUser(),
      },
      res
    );
    return res;
  }

  async function artworkRow(id) {
    return db
      .selectFrom('artworks')
      .select(['status', 'moderation_status'])
      .where('id', '=', id)
      .executeTakeFirstOrThrow();
  }

  async function entryRow(id) {
    return db
      .selectFrom('contest_entries')
      .select(['status', 'rank', 'licensing_status'])
      .where('id', '=', id)
      .executeTakeFirstOrThrow();
  }

  before(async () => {
    await requireDatabase();

    // Say which schema the run hit: the local public schema is stale and the
    // project verifies against prodmirror, so a green run must be attributable.
    const schema = await sql`select current_schema() as name`.execute(db);
    console.error(`[galleryVisibility] running against schema: ${schema.rows[0]?.name}`);

    const role = await db.selectFrom('roles').select('id').where('name', '=', 'BRAND_OWNER').executeTakeFirst();
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

    // contests.brand_id references brands(id) in production but users(id) in
    // the stale local schema; follow whatever the connected database declares.
    const fk = await sql`
      SELECT confrelid::regclass::text AS refs
      FROM pg_constraint
      WHERE conname = 'contests_brand_id_fkey'
        AND connamespace = current_schema()::regnamespace
    `.execute(db);
    contestBrandId = /(^|\.)users$/.test(fk.rows[0]?.refs || '') ? ownerId : brandId;

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
        visibility: 'public',
        max_entries_per_user: 3,
      })
      .returning('id')
      .executeTakeFirstOrThrow();
    contestId = contest.id;

    // approved: creator published it AND the brand approved the entry. Under
    //           the old gate this row was public; it is the one this file
    //           walks through winner -> finalized.
    // pending:  creator published it (self-approval) but the brand has not
    //           reviewed it. This is the row the original bug leaked.
    // draft:    raw submission, exactly as the contest form creates it.
    const seeds = {
      approved: { artwork: { status: 'published', moderation_status: 'approved' }, entry: 'approved' },
      pending: { artwork: { status: 'published', moderation_status: 'approved' }, entry: 'pending' },
      draft: { artwork: { status: 'draft', moderation_status: 'pending' }, entry: 'pending' },
    };
    for (const [key, seed] of Object.entries(seeds)) {
      const artwork = await db
        .insertInto('artworks')
        .values({
          creator_id: ownerId,
          title: `${tag} ${key}`,
          file_url: `https://example.com/${tag}-${key}.png`,
          ...seed.artwork,
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      const entry = await db
        .insertInto('contest_entries')
        .values({ contest_id: contestId, artwork_id: artwork.id, creator_id: ownerId, status: seed.entry })
        .returning('id')
        .executeTakeFirstOrThrow();
      fx[key] = { artworkId: artwork.id, entryId: entry.id };
    }
  });

  after(async () => {
    const artworkIds = Object.values(fx).map((f) => f.artworkId);
    try {
      if (artworkIds.length) {
        await db.deleteFrom('contest_entries').where('artwork_id', 'in', artworkIds).execute();
        await db.deleteFrom('artworks').where('id', 'in', artworkIds).execute();
      }
      if (contestId) await db.deleteFrom('contests').where('id', '=', contestId).execute();
      if (brandId) await db.deleteFrom('brands').where('id', '=', brandId).execute();
      if (ownerId) await db.deleteFrom('users').where('id', '=', ownerId).execute();
    } finally {
      await db.destroy();
    }
  });

  it('no longer lists a published artwork on brand approval alone', async () => {
    const { ids, total } = await galleryIds();
    assert.deepEqual(ids, []);
    assert.equal(total, 0, 'count query must apply the same filter as the list query');
  });

  it('approving a draft entry still publishes the artwork row without listing it', async () => {
    const res = await setEntryStatus(fx.draft.entryId, 'approved');
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));

    // The publish side-effect is unchanged: the artwork becomes addressable...
    assert.deepEqual(await artworkRow(fx.draft.artworkId), {
      status: 'published',
      moderation_status: 'approved',
    });

    // ...but approval no longer puts it in the public gallery list.
    const { ids } = await galleryIds();
    assert.deepEqual(ids, []);
  });

  it('rejecting an entry leaves the artwork row alone and keeps it out of the gallery', async () => {
    const res = await setEntryStatus(fx.pending.entryId, 'rejected');
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));

    // Self-published before, self-published after: rejection is not an unpublish.
    assert.deepEqual(await artworkRow(fx.pending.artworkId), {
      status: 'published',
      moderation_status: 'approved',
    });

    const { ids } = await galleryIds();
    assert.ok(!ids.includes(fx.pending.artworkId));
  });

  it('selecting a winner does not list it while licensing is incomplete', async () => {
    const res = await selectWinners([fx.approved.entryId]);
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));

    assert.deepEqual(await entryRow(fx.approved.entryId), {
      status: 'winner',
      rank: 1,
      licensing_status: 'not_started',
    });

    const { ids } = await galleryIds();
    assert.deepEqual(ids, []);

    // Mid-lifecycle statuses do not open the gate either.
    const sent = await setLicensingStatus(fx.approved.entryId, 'agreement_sent');
    assert.equal(sent.statusCode, 200, JSON.stringify(sent.body));
    assert.deepEqual((await galleryIds()).ids, []);
  });

  it('finalizing the winner is what lists the artwork', async () => {
    const res = await setLicensingStatus(fx.approved.entryId, 'finalized');
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));

    const { ids, total } = await galleryIds();
    assert.deepEqual(ids, [fx.approved.artworkId]);
    assert.equal(total, 1);
  });

  it('deselecting the winner hides the artwork and resets its licensing progress', async () => {
    const res = await selectWinners([]);
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));

    // Without the reset, a stale 'finalized' would instantly re-list the
    // artwork if the entry were ever selected again.
    assert.deepEqual(await entryRow(fx.approved.entryId), {
      status: 'approved',
      rank: null,
      licensing_status: 'not_started',
    });

    const { ids, total } = await galleryIds();
    assert.deepEqual(ids, []);
    assert.equal(total, 0);
  });
});
