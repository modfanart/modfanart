// tests/artworks/galleryVisibility.test.js
//
// Row-level regression test for "Fix submission showing in Gallery".
//
// The compile-only tests in ../artwork.visibility.test.js pin the SQL shape.
// This file runs the real controllers against a database and proves the two
// halves of the fix on actual rows:
//
//   1. an artwork the creator published is still NOT in the public gallery
//      until a brand approves its contest entry (the bug), and
//   2. a brand approving an entry publishes a draft artwork, so approval
//      alone is enough to surface it.

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { sql } = require('kysely');

const { db, requireDatabase } = require('../helpers/db');
const ArtworkController = require('../../src/modules/artworks/controller/artwork.controller');
const ContestEntryController = require('../../src/modules/contests/controller/contestEntry.controller');

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

describe('public gallery shows only brand-approved artwork', () => {
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

  async function setEntryStatus(entryId, status) {
    const res = makeRes();
    await ContestEntryController.updateEntryStatus(
      {
        params: { contestId, entryId },
        body: { status },
        user: { id: ownerId, brands: [{ id: contestBrandId }] },
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

    // approved: creator published it AND the brand approved the entry.
    // pending:  creator published it (self-approval) but the brand has not
    //           reviewed it. This is the row the bug leaked.
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

  it('lists a published artwork only once a brand approved its entry', async () => {
    const { ids, total } = await galleryIds();

    assert.deepEqual(ids, [fx.approved.artworkId]);
    assert.equal(total, 1, 'count query must apply the same filter as the list query');
  });

  it('publishes a draft artwork when the brand approves its entry, which surfaces it', async () => {
    const res = await setEntryStatus(fx.draft.entryId, 'approved');
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));

    assert.deepEqual(await artworkRow(fx.draft.artworkId), {
      status: 'published',
      moderation_status: 'approved',
    });

    const { ids, total } = await galleryIds();
    assert.deepEqual(ids, [fx.approved.artworkId, fx.draft.artworkId].sort());
    assert.equal(total, 2);
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

  it('approving an already-published artwork is a no-op on the artwork row', async () => {
    const before = await db
      .selectFrom('artworks')
      .select(['status', 'moderation_status', 'updated_at'])
      .where('id', '=', fx.approved.artworkId)
      .executeTakeFirstOrThrow();

    const res = await setEntryStatus(fx.approved.entryId, 'approved');
    assert.equal(res.statusCode, 200, JSON.stringify(res.body));

    const after = await db
      .selectFrom('artworks')
      .select(['status', 'moderation_status', 'updated_at'])
      .where('id', '=', fx.approved.artworkId)
      .executeTakeFirstOrThrow();
    assert.deepEqual(after, before);
  });
});
