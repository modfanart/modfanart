import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  PAGE_SIZE,
  normalizeEntry,
  foldEntriesPage,
  buildEntriesQueryArgs,
  type ExtendedContestEntry,
} from './submission-pagination';

// Minimal ContestEntry-shaped fixture. `as any` keeps the test focused on the
// fields these helpers touch without restating the whole API type.
function entry(id: string, over: Record<string, unknown> = {}): any {
  return {
    id,
    status: 'pending',
    rank: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    artwork: {
      id: `art-${id}`,
      title: `Title ${id}`,
      thumbnail_url: `thumb-${id}.png`,
      file_url: `file-${id}.png`,
    },
    creator: { id: `u-${id}`, username: `user_${id}`, avatar_url: `av-${id}.png` },
    judge_score: null,
    judge_comments: null,
    ...over,
  };
}

describe('normalizeEntry', () => {
  it('mirrors nested artwork/creator fields onto the flat fields EntryRow reads', () => {
    const n = normalizeEntry(entry('a'));
    assert.equal(n.artwork_title, 'Title a');
    assert.equal(n.artwork_thumbnail_url, 'thumb-a.png');
    assert.equal(n.artwork_file_url, 'file-a.png');
    assert.equal(n.creator_username, 'user_a');
    assert.equal(n.creator_avatar, 'av-a.png');
    assert.equal(n.submitted_at, '2026-01-01T00:00:00.000Z');
    // Nested objects are preserved too.
    assert.equal(n.artwork.title, 'Title a');
  });

  it('coerces null thumbnail/avatar to undefined (EntryRow treats it as "No Preview")', () => {
    const n = normalizeEntry(
      entry('b', { artwork: { id: 'art-b', title: 'T', thumbnail_url: null, file_url: 'f' } })
    );
    assert.equal(n.artwork_thumbnail_url, undefined);
  });
});

describe('foldEntriesPage', () => {
  it('replaces the list on page 0 (fresh filter/search or refreshed data)', () => {
    const prev: ExtendedContestEntry[] = [normalizeEntry(entry('old'))];
    const next = foldEntriesPage(prev, [entry('x'), entry('y')], 0);
    assert.deepEqual(next.map((e) => e.id), ['x', 'y']);
  });

  it('appends later pages onto the accumulated list', () => {
    const p0 = foldEntriesPage([], [entry('a'), entry('b')], 0);
    const p1 = foldEntriesPage(p0, [entry('c'), entry('d')], PAGE_SIZE);
    assert.deepEqual(p1.map((e) => e.id), ['a', 'b', 'c', 'd']);
  });

  it('dedupes by id so a double-invoke / overlapping refetch cannot duplicate rows', () => {
    const p0 = foldEntriesPage([], [entry('a'), entry('b')], 0);
    // Same page delivered again at a non-zero offset must not re-add a/b.
    const again = foldEntriesPage(p0, [entry('b'), entry('c')], PAGE_SIZE);
    assert.deepEqual(again.map((e) => e.id), ['a', 'b', 'c']);
  });
});

describe('buildEntriesQueryArgs', () => {
  it('always sends limit + offset; omits status/search when unset', () => {
    const args = buildEntriesQueryArgs({
      contestId: 'c1',
      offset: 0,
      statusFilter: 'all',
      search: '',
    });
    assert.deepEqual(args, { contestId: 'c1', limit: PAGE_SIZE, offset: 0 });
    assert.equal('status' in args, false);
    assert.equal('search' in args, false);
  });

  it('includes status when filtered and search when present', () => {
    const args = buildEntriesQueryArgs({
      contestId: 'c1',
      offset: 48,
      statusFilter: 'pending',
      search: 'alice',
    });
    assert.deepEqual(args, {
      contestId: 'c1',
      limit: PAGE_SIZE,
      offset: 48,
      status: 'pending',
      search: 'alice',
    });
  });
});
