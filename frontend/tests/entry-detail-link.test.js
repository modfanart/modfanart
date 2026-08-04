import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { contestsWithBrandSlug, entryDetailPath } from '../lib/submissions/entry-detail-link.js';

describe('entryDetailPath', () => {
  it('builds the brand-scoped entry detail path', () => {
    assert.equal(
      entryDetailPath('acme', 'contest-1', 'entry-1'),
      '/brand-manager/acme/opportunities/contest-1/entries/entry-1'
    );
  });

  it('keeps the contest and entry ids in the right order', () => {
    // Swapping these silently loads the wrong record rather than 404ing, so
    // the order is asserted explicitly.
    const path = entryDetailPath('acme', 'CONTEST', 'ENTRY');

    assert.ok(path.indexOf('/opportunities/CONTEST') < path.indexOf('/entries/ENTRY'));
  });
});

describe('contestsWithBrandSlug', () => {
  // contests.brand_id holds a brands(id), which is what every contest
  // controller compares against. A previous version of this suite asserted the
  // opposite (matching brands[].user_id), which passed while leaving the real
  // dashboard permanently empty, so the shape is pinned explicitly below.
  const brands = [
    { id: 'brand-1', slug: 'acme' },
    { id: 'brand-2', slug: 'globex' },
  ];

  it('pairs each contest with the brand whose id matches contests.brand_id', () => {
    const contests = [
      { id: 'c1', brand_id: 'brand-2', title: 'Globex contest' },
      { id: 'c2', brand_id: 'brand-1', title: 'Acme contest' },
    ];

    assert.deepEqual(
      contestsWithBrandSlug(contests, brands).map((c) => [c.contest.id, c.brandSlug]),
      [
        ['c1', 'globex'],
        ['c2', 'acme'],
      ]
    );
  });

  it('matches a brand id against contests.brand_id', () => {
    // The regression this guards: resolving through brands[].user_id never
    // matched, and GET /users/me/brands does not even return that column, so
    // the pending-submissions grid was always empty.
    const [only] = contestsWithBrandSlug([{ id: 'c1', brand_id: 'brand-2' }], brands);

    assert.equal(only.brandSlug, 'globex');
  });

  it('ignores a brands[].user_id that happens to match', () => {
    // Guards the inverse mistake: user ids must not resolve a contest.
    assert.deepEqual(
      contestsWithBrandSlug(
        [{ id: 'c1', brand_id: 'user-acme' }],
        [{ id: 'brand-1', slug: 'acme', user_id: 'user-acme' }]
      ),
      []
    );
  });

  it('does not default a second brand to the first brand slug', () => {
    const [only] = contestsWithBrandSlug([{ id: 'c1', brand_id: 'brand-2' }], brands);

    assert.equal(only.brandSlug, 'globex');
  });

  it('drops contests whose brand is unknown or has no slug', () => {
    const contests = [
      { id: 'c1', brand_id: 'brand-nobody' },
      { id: 'c2', brand_id: 'brand-3' },
    ];
    const withNullSlug = [...brands, { id: 'brand-3', slug: null }];

    assert.deepEqual(contestsWithBrandSlug(contests, withNullSlug), []);
  });

  it('handles missing contests and brands without throwing', () => {
    assert.deepEqual(contestsWithBrandSlug(undefined, undefined), []);
    assert.deepEqual(contestsWithBrandSlug([], []), []);
    assert.deepEqual(contestsWithBrandSlug([{ id: 'c1', brand_id: 'brand-1' }], []), []);
  });
});
