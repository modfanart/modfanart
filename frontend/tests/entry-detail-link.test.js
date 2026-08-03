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
  // contests.brand_id is a FK to users(id), so these hold OWNER USER ids, and
  // each brand records the user who owns it in user_id. An earlier version of
  // this suite used brand ids on both sides, which matched the implementation
  // but not the database, so the grid was empty against real data.
  const brands = [
    { id: 'brand-1', slug: 'acme', user_id: 'user-acme' },
    { id: 'brand-2', slug: 'globex', user_id: 'user-globex' },
  ];

  it('pairs each contest with the brand whose owner matches contests.brand_id', () => {
    const contests = [
      { id: 'c1', brand_id: 'user-globex', title: 'Globex contest' },
      { id: 'c2', brand_id: 'user-acme', title: 'Acme contest' },
    ];

    assert.deepEqual(
      contestsWithBrandSlug(contests, brands, 'someone-else').map((c) => [
        c.contest.id,
        c.brandSlug,
      ]),
      [
        ['c1', 'globex'],
        ['c2', 'acme'],
      ]
    );
  });

  it('does not match a brand id against contests.brand_id', () => {
    // The regression this guards: comparing brands[].id to contest.brand_id
    // never matches, because one is a brand id and the other a user id.
    assert.deepEqual(contestsWithBrandSlug([{ id: 'c1', brand_id: 'brand-2' }], brands), []);
  });

  it('accepts the owner_id shape that authenticateToken produces', () => {
    // auth.middleware selects 'b.user_id as owner_id'; getMyBrands returns the
    // raw column as user_id. Only checking one key left the grid empty
    // depending on which endpoint supplied the brands.
    const [only] = contestsWithBrandSlug(
      [{ id: 'c1', brand_id: 'user-acme' }],
      [{ id: 'brand-1', slug: 'acme', owner_id: 'user-acme' }],
      'someone-else'
    );

    assert.equal(only.brandSlug, 'acme');
  });

  it('resolves a contest the viewer owns directly', () => {
    const [only] = contestsWithBrandSlug(
      [{ id: 'c1', brand_id: 'user-acme' }],
      [{ id: 'brand-1', slug: 'acme', user_id: 'user-acme' }],
      'user-acme'
    );

    assert.equal(only.brandSlug, 'acme');
  });

  it('does not default a second brand to the first brand slug', () => {
    const [only] = contestsWithBrandSlug([{ id: 'c1', brand_id: 'user-globex' }], brands);

    assert.equal(only.brandSlug, 'globex');
  });

  it('drops contests whose brand is unknown or has no slug', () => {
    const contests = [
      { id: 'c1', brand_id: 'user-nobody' },
      { id: 'c2', brand_id: 'user-noslug' },
    ];
    const withNullSlug = [...brands, { id: 'brand-3', slug: null, user_id: 'user-noslug' }];

    assert.deepEqual(contestsWithBrandSlug(contests, withNullSlug, 'user-x'), []);
  });

  it('handles missing contests, brands and user id without throwing', () => {
    assert.deepEqual(contestsWithBrandSlug(undefined, undefined, undefined), []);
    assert.deepEqual(contestsWithBrandSlug([], [], null), []);
    assert.deepEqual(contestsWithBrandSlug([{ id: 'c1', brand_id: 'u1' }], [], 'u1'), []);
  });
});
