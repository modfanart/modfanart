const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const { db, requireDatabase } = require('../helpers/db');
const Tag = require('../../src/modules/tags/models/tag.model');
const { slugifyTag } = require('../../src/modules/tags/models/tag.model');
const Tagging = require('../../src/modules/tags/models/tagging.model');
const TaggingController = require('../../src/modules/tags/controller/tagging.controller');

/** Minimal Express res double capturing the status/body the controller sends. */
function makeRes() {
  const res = {
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
  return res;
}

// Unique per run so these rows never collide with the existing tag vocabulary
// and are trivial to identify and clean up. No Date/Math.random constraints
// here - this is a normal Node process, not a workflow sandbox.
const SUFFIX = `zztest${process.pid}${Date.now().toString(36)}`;

// slugifyTag is pure, so this half of the suite runs even with no database.
describe('slugifyTag', () => {
  it('lowercases, collapses whitespace to hyphens, strips punctuation', () => {
    assert.equal(slugifyTag('  Comic Book!! '), 'comic-book');
    assert.equal(slugifyTag('Sci Fi'), 'sci-fi');
  });

  it('slugifies an all-punctuation name to an empty string', () => {
    assert.equal(slugifyTag('!!!'), '');
  });
});

describe('tag attachment + vocabulary (integration)', () => {
  let fixture = null;
  let skipReason = '';
  const createdTagIds = [];

  before(async () => {
    const { skip, reason } = await requireDatabase();
    if (skip) {
      skipReason = reason;
      return;
    }

    // Ordered so repeated runs pick the same rows, keeping any failure
    // reproducible. Two distinct artworks are needed to exercise attaching an
    // already-existing tag to a second artwork.
    const artworks = await db
      .selectFrom('artworks')
      .select(['id', 'creator_id'])
      .orderBy('id')
      .limit(2)
      .execute();

    if (artworks.length >= 2) fixture = { artworkA: artworks[0], artworkB: artworks[1] };
    else skipReason = 'database needs at least two artwork rows to build fixtures';
  });

  after(async () => {
    try {
      if (createdTagIds.length > 0) {
        // taggings has ON DELETE CASCADE from tags, but delete explicitly so a
        // schema change that drops the cascade cannot silently leak rows.
        await db.deleteFrom('taggings').where('tag_id', 'in', createdTagIds).execute();
        await db.deleteFrom('tags').where('id', 'in', createdTagIds).execute();
      }
    } catch (err) {
      console.error(`Failed to clean up tags ${createdTagIds.join(', ')}:`, err.message);
      throw err;
    } finally {
      await db.destroy();
    }
  });

  /** Reads the current usage_count for a tag. */
  async function usageCount(tagId) {
    const row = await db
      .selectFrom('tags')
      .select('usage_count')
      .where('id', '=', tagId)
      .executeTakeFirst();
    return row?.usage_count;
  }

  /** Counts taggings rows for a tag. */
  async function taggingCount(tagId) {
    const rows = await db
      .selectFrom('taggings')
      .select('tag_id')
      .where('tag_id', '=', tagId)
      .execute();
    return rows.length;
  }

  // ── Controller path: the flow the submission page actually drives ──

  it('addTag creates the tag, attaches it, and counts exactly one usage', async (t) => {
    if (!fixture) return t.skip(skipReason);

    const name = `Neon Sunset ${SUFFIX}`;
    const owner = { id: fixture.artworkA.creator_id };
    const res = makeRes();

    await TaggingController.addTag(
      { params: { artworkId: fixture.artworkA.id }, body: { name }, user: owner },
      res
    );

    assert.equal(res.statusCode, 201, res.body && res.body.error);

    const tag = await Tag.findByNameOrSlug(name);
    assert.ok(tag, 'tag row was created and is findable');
    createdTagIds.push(tag.id);

    assert.equal(await taggingCount(tag.id), 1, 'exactly one tagging row');
    assert.equal(await usageCount(tag.id), 1, 'usage counted once for a fresh attach');
  });

  it('replaying the same tag neither duplicates the attachment nor inflates usage', async (t) => {
    if (!fixture) return t.skip(skipReason);

    const name = `Replay Me ${SUFFIX}`;
    const owner = { id: fixture.artworkA.creator_id };
    const req = { params: { artworkId: fixture.artworkA.id }, body: { name }, user: owner };

    const r1 = makeRes();
    await TaggingController.addTag(req, r1);
    assert.equal(r1.statusCode, 201, r1.body && r1.body.error);

    const tag = await Tag.findByNameOrSlug(name);
    assert.ok(tag);
    createdTagIds.push(tag.id);

    const r2 = makeRes();
    await TaggingController.addTag(req, r2);
    assert.equal(r2.statusCode, 201, 'replay still succeeds');

    assert.equal(await taggingCount(tag.id), 1, 'still a single tagging after replay');
    assert.equal(await usageCount(tag.id), 1, 'usage_count not inflated by the replay');
  });

  it('attaching an existing tag to a second artwork increments usage without 500', async (t) => {
    if (!fixture) return t.skip(skipReason);

    // Acts with tags.manage so ownership passes for both artworks regardless of
    // who created them. The id is a real user so the created_by FKs hold.
    const manager = {
      id: fixture.artworkA.creator_id,
      permissions: { 'tags.manage': true },
    };
    const name = `Shared Tag ${SUFFIX}`;

    const rA = makeRes();
    await TaggingController.addTag(
      { params: { artworkId: fixture.artworkA.id }, body: { name }, user: manager },
      rA
    );
    assert.equal(rA.statusCode, 201, rA.body && rA.body.error);

    const tag = await Tag.findByNameOrSlug(name);
    assert.ok(tag);
    createdTagIds.push(tag.id);

    // Second artwork: the tag already exists, so this drives the incrementUsage
    // path that previously threw (eb.ref().plus is not a function) and 500'd.
    const rB = makeRes();
    await TaggingController.addTag(
      { params: { artworkId: fixture.artworkB.id }, body: { name }, user: manager },
      rB
    );
    assert.equal(rB.statusCode, 201, 'attaching an existing tag must not 500');

    assert.equal(await taggingCount(tag.id), 2, 'attached to both artworks');
    assert.equal(await usageCount(tag.id), 2, 'usage incremented for the second attach');
  });

  it('rejects a tag the owner does not own without tags.manage', async (t) => {
    if (!fixture) return t.skip(skipReason);

    // A real user who is neither the artwork owner nor a tag manager.
    const stranger = await db
      .selectFrom('users')
      .select('id')
      .where('id', '!=', fixture.artworkA.creator_id)
      .orderBy('id')
      .executeTakeFirst();
    if (!stranger) return t.skip('need a second user to test the ownership guard');

    const res = makeRes();
    await TaggingController.addTag(
      {
        params: { artworkId: fixture.artworkA.id },
        body: { name: `Should Not Attach ${SUFFIX}` },
        user: { id: stranger.id },
      },
      res
    );

    assert.equal(res.statusCode, 403, 'non-owner without tags.manage is refused');
  });

  // ── Model path: the individual fixes, asserted directly ──

  it('Tagging.addTag returns true on insert and false on conflict', async (t) => {
    if (!fixture) return t.skip(skipReason);

    const name = `Direct Attach ${SUFFIX}`;
    const created = await Tag.create(name, slugifyTag(name), fixture.artworkA.creator_id);
    createdTagIds.push(created.id);

    const first = await Tagging.addTag(
      created.id,
      'artwork',
      fixture.artworkA.id,
      fixture.artworkA.creator_id
    );
    assert.equal(first, true, 'first attach reports an insert');

    const second = await Tagging.addTag(
      created.id,
      'artwork',
      fixture.artworkA.id,
      fixture.artworkA.creator_id
    );
    assert.equal(second, false, 'a duplicate attach is a reported no-op');
  });

  it('Tag.incrementUsage adds the delta without throwing (kysely sql fix)', async (t) => {
    if (!fixture) return t.skip(skipReason);

    const name = `Counter ${SUFFIX}`;
    const created = await Tag.create(name, slugifyTag(name), fixture.artworkA.creator_id);
    createdTagIds.push(created.id);

    await Tag.incrementUsage(created.id, 3);
    assert.equal(await usageCount(created.id), 3);
  });

  it('Tag.search matches by name, matches by slugified term, and respects approved', async (t) => {
    if (!fixture) return t.skip(skipReason);

    // "Sci Fi <suffix>" → slug "sci-fi-<suffix>"; the name has spaces, the slug
    // has hyphens, so a hyphenated query can only match via the slug predicate.
    const name = `Sci Fi ${SUFFIX}`;
    const created = await Tag.create(name, slugifyTag(name), fixture.artworkA.creator_id);
    createdTagIds.push(created.id);

    const approvedOnly = await Tag.search({ query: SUFFIX, approvedOnly: true });
    assert.equal(
      approvedOnly.find((row) => row.id === created.id),
      undefined,
      'an unapproved tag is hidden from the default (approved-only) search'
    );

    const includingUnapproved = await Tag.search({ query: SUFFIX, approvedOnly: false });
    assert.ok(
      includingUnapproved.find((row) => row.id === created.id),
      'the tag surfaces once unapproved tags are included'
    );

    await Tag.approve(created.id, fixture.artworkA.creator_id);

    const bySlugTerm = await Tag.search({ query: `sci-fi-${SUFFIX}`, approvedOnly: true });
    assert.ok(
      bySlugTerm.find((row) => row.id === created.id),
      'a hyphenated (slug-shaped) query matches via the slug predicate'
    );
  });
});
