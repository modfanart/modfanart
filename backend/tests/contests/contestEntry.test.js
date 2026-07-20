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
});
