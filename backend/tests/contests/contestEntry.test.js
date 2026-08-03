const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const { db, requireDatabase } = require('../helpers/db');
const ContestEntry = require('../../src/modules/contests/models/contestEntry.model');
const ContestEntryController = require('../../src/modules/contests/controller/contestEntry.controller');

const { MAX_SUBMISSION_NOTES_LENGTH } = ContestEntryController;

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

describe('submitEntry - submissionNotes validation', () => {
  it('rejects a non-string note with 400', async () => {
    const res = makeRes();
    const req = {
      params: { contestId: 'irrelevant' },
      body: { artworkId: 'irrelevant', submissionNotes: { injected: true } },
      user: { id: 'irrelevant' },
    };

    await ContestEntryController.submitEntry(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /must be a string/);
  });

  it('rejects a note longer than the cap with 400', async () => {
    const res = makeRes();
    const req = {
      params: { contestId: 'irrelevant' },
      body: {
        artworkId: 'irrelevant',
        submissionNotes: 'x'.repeat(MAX_SUBMISSION_NOTES_LENGTH + 1),
      },
      user: { id: 'irrelevant' },
    };

    await ContestEntryController.submitEntry(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /characters or fewer/);
  });

  // Unlike the two rejection cases above, this one passes validation and so
  // reaches the contest lookup, which needs a database.
  it('accepts a note exactly at the cap, passing validation', async (t) => {
    const { skip, reason } = await requireDatabase();
    if (skip) return t.skip(reason);

    const res = makeRes();
    const req = {
      params: { contestId: '00000000-0000-0000-0000-000000000000' },
      body: {
        artworkId: 'irrelevant',
        submissionNotes: 'x'.repeat(MAX_SUBMISSION_NOTES_LENGTH),
      },
      user: { id: 'irrelevant' },
    };

    await ContestEntryController.submitEntry(req, res);

    // Asserting the exact 404 rather than merely "not 400" - a 500 from an
    // unhandled error would otherwise satisfy this test.
    assert.equal(res.statusCode, 404);
    assert.match(res.body.error, /Contest not found/);
  });
});

describe('submission note round-trip', () => {
  let fixture = null;
  let skipReason = '';
  const createdEntryIds = [];

  before(async () => {
    const { skip, reason } = await requireDatabase();
    if (skip) {
      skipReason = reason;
      return;
    }

    // Ordered so repeated runs pick the same rows - an unordered
    // executeTakeFirst() lets Postgres return a different contest or artwork
    // between runs, which makes any failure hard to reproduce.
    const contest = await db
      .selectFrom('contests')
      .select('id')
      .orderBy('id')
      .executeTakeFirst();
    const artwork = await db
      .selectFrom('artworks')
      .select(['id', 'creator_id'])
      .orderBy('id')
      .executeTakeFirst();

    if (contest && artwork) fixture = { contest, artwork };
    else skipReason = 'database has no contest/artwork rows to build a fixture from';
  });

  after(async () => {
    try {
      if (createdEntryIds.length > 0) {
        await db.deleteFrom('contest_entries').where('id', 'in', createdEntryIds).execute();
      }
    } catch (err) {
      // Surface the ids so leaked rows can be removed by hand; never let a
      // cleanup failure skip db.destroy() and leave the pool open.
      console.error(`Failed to clean up contest_entries ${createdEntryIds.join(', ')}:`, err.message);
      throw err;
    } finally {
      await db.destroy();
    }
  });

  /** Creates an entry via the real model and registers it for cleanup. */
  async function createEntry(notes) {
    const entry = await ContestEntry.create(
      fixture.contest.id,
      fixture.artwork.id,
      fixture.artwork.creator_id,
      notes
    );
    createdEntryIds.push(entry.id);
    return entry;
  }

  /**
   * Calls getEntries as an authorized viewer (judge permission sees every
   * status) and returns the captured res.
   */
  async function callGetEntries(query) {
    const res = makeRes();
    const req = {
      params: { contestId: fixture.contest.id },
      query,
      user: { id: fixture.artwork.creator_id, permissions: { 'contests.judge': true } },
    };
    await ContestEntryController.getEntries(req, res);
    return res;
  }

  it('persists the note on insert', async (t) => {
    if (!fixture) return t.skip(skipReason);

    const note = 'Inspired by my cat.\n\nFandom / Original IP: Marvel';
    const entry = await createEntry(note);

    assert.equal(entry.submission_notes, note);
  });

  it('returns the note from getEntries as submission_notes', async (t) => {
    if (!fixture) return t.skip(skipReason);

    const note = 'Second piece in a series.';
    const entry = await createEntry(note);

    const res = makeRes();
    const req = {
      params: { contestId: fixture.contest.id },
      query: {},
      // Judge permission is required to see pending entries.
      user: { id: fixture.artwork.creator_id, permissions: { 'contests.judge': true } },
    };

    await ContestEntryController.getEntries(req, res);

    const returned = res.body.entries.find((e) => e.id === entry.id);
    assert.ok(returned, 'entry missing from getEntries response');
    // The judge page reads entry.submission_notes - this key must not drift.
    assert.equal(returned.submission_notes, note);
  });

  it('stores a missing note as null rather than an empty string', async (t) => {
    if (!fixture) return t.skip(skipReason);

    const entry = await createEntry(null);

    assert.equal(entry.submission_notes, null);
  });

  // --- View All: pagination, total, search, de-duplication ---

  it('returns a numeric total, and total matches a full single page', async (t) => {
    if (!fixture) return t.skip(skipReason);

    await createEntry('total-check');

    // limit above the row count means the whole set is on one page, so the
    // array length must equal the reported total.
    const res = await callGetEntries({ limit: '500' });
    assert.equal(typeof res.body.total, 'number');
    assert.equal(res.body.entries.length, res.body.total);
  });

  it('pages through entries with limit/offset without overlap', async (t) => {
    if (!fixture) return t.skip(skipReason);

    // Guarantee at least four entries in the contest.
    await createEntry('p1');
    await createEntry('p2');
    await createEntry('p3');
    await createEntry('p4');

    const page1 = await callGetEntries({ limit: '2', offset: '0' });
    const page2 = await callGetEntries({ limit: '2', offset: '2' });

    assert.equal(page1.body.entries.length, 2);
    assert.equal(page2.body.entries.length, 2);

    const firstIds = new Set(page1.body.entries.map((e) => e.id));
    const overlap = page2.body.entries.filter((e) => firstIds.has(e.id));
    assert.equal(overlap.length, 0, 'consecutive pages must not overlap');

    // total is page-independent and equals the length of a full fetch.
    assert.equal(page1.body.total, page2.body.total);
    const all = await callGetEntries({ limit: '500' });
    assert.equal(all.body.entries.length, all.body.total);
    assert.equal(all.body.total, page1.body.total);
  });

  it('clamps a limit above the hard cap to 100 rows', async (t) => {
    if (!fixture) return t.skip(skipReason);

    const res = await callGetEntries({ limit: '99999' });
    assert.ok(res.body.entries.length <= 100, 'limit must be capped at 100');
  });

  it('returns each entry once even when several judges have scored it', async (t) => {
    if (!fixture) return t.skip(skipReason);

    const entry = await createEntry('multi-judge');

    // Two distinct judges score the same entry. The old LEFT JOIN would have
    // returned this entry twice; the collapsed query must return it once.
    const judges = await db
      .selectFrom('users')
      .select('id')
      .orderBy('id')
      .limit(2)
      .execute();
    if (judges.length < 2) return t.skip('need two users to act as judges');

    await db
      .insertInto('contest_judge_scores')
      .values([
        { entry_id: entry.id, judge_id: judges[0].id, score: 6 },
        { entry_id: entry.id, judge_id: judges[1].id, score: 9 },
      ])
      .execute();
    // Cascades from the contest_entries cleanup, but be explicit in case the
    // entry row survives a partial failure.
    t.after(async () => {
      await db.deleteFrom('contest_judge_scores').where('entry_id', '=', entry.id).execute();
    });

    const res = await callGetEntries({ limit: '500' });
    const matches = res.body.entries.filter((e) => e.id === entry.id);
    assert.equal(matches.length, 1, 'a multi-judge entry must appear exactly once');
    // Collapsed to the top score across judges.
    assert.equal(Number(matches[0].judge_score), 9);
  });

  it('returns the nested shape the frontend normalizeEntry reads', async (t) => {
    if (!fixture) return t.skip(skipReason);

    const created = await createEntry('shape-check');

    const res = await callGetEntries({ limit: '500' });
    // Assert on the JSON-serialized shape the frontend actually receives over
    // the wire (res.json turns Date columns into ISO strings, etc.).
    const wire = JSON.parse(JSON.stringify(res.body));
    assert.equal(typeof wire.total, 'number');

    const e = wire.entries.find((row) => row.id === created.id);
    assert.ok(e, 'created entry should be present');
    // These exact paths back the frontend contract (ContestEntry type +
    // normalizeEntry in submission-pagination.ts). If the backend stops nesting
    // artwork/creator, the Monitor rows silently lose title/creator/thumbnail.
    assert.equal(typeof e.status, 'string');
    assert.equal(typeof e.created_at, 'string');
    assert.ok(e.artwork && typeof e.artwork === 'object', 'artwork must be nested');
    assert.ok('title' in e.artwork, 'artwork.title');
    assert.ok('thumbnail_url' in e.artwork, 'artwork.thumbnail_url');
    assert.ok('file_url' in e.artwork, 'artwork.file_url');
    assert.ok(e.creator && typeof e.creator === 'object', 'creator must be nested');
    assert.ok('username' in e.creator, 'creator.username');
    assert.ok('avatar_url' in e.creator, 'creator.avatar_url');
  });

  it('filters by search on artwork title / creator username', async (t) => {
    if (!fixture) return t.skip(skipReason);

    const entry = await createEntry('search-target');

    const creator = await db
      .selectFrom('users')
      .select('username')
      .where('id', '=', fixture.artwork.creator_id)
      .executeTakeFirst();
    const term = creator.username.slice(0, 3);

    const res = await callGetEntries({ search: term, limit: '500' });
    const needle = term.toLowerCase();
    for (const e of res.body.entries) {
      const haystack = `${e.artwork?.title ?? ''} ${e.creator?.username ?? ''}`.toLowerCase();
      assert.ok(haystack.includes(needle), `search returned a non-match: "${haystack}"`);
    }
    assert.ok(res.body.entries.some((e) => e.id === entry.id), 'target entry should match');
    assert.equal(res.body.entries.length, res.body.total);

    // A term with LIKE metacharacters must be treated literally, so it matches
    // nothing rather than acting as a wildcard.
    const none = await callGetEntries({ search: 'zzz_no_match_zzz_%_' });
    assert.equal(none.body.entries.length, 0);
    assert.equal(none.body.total, 0);
  });
});
