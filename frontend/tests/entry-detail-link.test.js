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
  const brands = [
    { id: 'brand-1', slug: 'acme' },
    { id: 'brand-2', slug: 'globex' },
  ];

  it('pairs each contest with the slug of the brand that owns it', () => {
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

  it('does not default a second brand to the first brand slug', () => {
    // The bug this guards: using brands[0] would file every contest under
    // 'acme' and link managers to another brand's URL space.
    const [only] = contestsWithBrandSlug([{ id: 'c1', brand_id: 'brand-2' }], brands);

    assert.equal(only.brandSlug, 'globex');
  });

  it('drops contests whose brand is unknown or has no slug', () => {
    const contests = [
      { id: 'c1', brand_id: 'brand-unknown' },
      { id: 'c2', brand_id: 'brand-3' },
    ];
    const withNullSlug = [...brands, { id: 'brand-3', slug: null }];

    assert.deepEqual(contestsWithBrandSlug(contests, withNullSlug), []);
  });

  it('handles missing contests and brands without throwing', () => {
    assert.deepEqual(contestsWithBrandSlug(undefined, undefined), []);
    assert.deepEqual(contestsWithBrandSlug([], []), []);
    assert.deepEqual(contestsWithBrandSlug([{ id: 'c1', brand_id: 'b1' }], []), []);
  });
});
