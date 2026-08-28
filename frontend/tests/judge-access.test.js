/**
 * Decision rules for the "Judging" navigation link, shared by the sidebar and
 * the account dropdown (lib/judging/judge-access.js).
 *
 * The production incident this pins down: two judges whose accounts had the
 * fan role could score entries (judging rights are per-contest, held in
 * contest_judges) but had no navigation back into the judge area, because the
 * account dropdown gated its only dashboard entry on a role allowlist that
 * excludes fan. The link must key on judge assignments, never on role.
 *
 * Run: npm test  (from frontend/)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { judgeAreaHref } from '../lib/judging/judge-access.js';

const ASSIGNED = [{ id: 'contest-1' }];

describe('judgeAreaHref', () => {
  it('links a fan-role user with an accepted judge assignment', () => {
    assert.equal(
      judgeAreaHref({
        username: 'librarian1',
        roleName: 'fan',
        acceptedContests: ASSIGNED,
        pendingInvitations: [],
      }),
      '/judge/librarian1'
    );
  });

  it('links on pending invitations alone', () => {
    // Redeeming the emailed invite link does not set contest_judges.accepted;
    // only the Accept button on the judge dashboard does. A judge who has not
    // found that button yet must still get the link.
    assert.equal(
      judgeAreaHref({
        username: 'librarian2',
        roleName: 'fan',
        acceptedContests: [],
        pendingInvitations: ASSIGNED,
      }),
      '/judge/librarian2'
    );
  });

  it('links roles other than fan too - the rule is role-agnostic', () => {
    assert.equal(
      judgeAreaHref({
        username: 'painter',
        roleName: 'artist',
        acceptedContests: ASSIGNED,
        pendingInvitations: [],
      }),
      '/judge/painter'
    );
  });

  it('returns null for the judge role, whose dashboard is already the judge area', () => {
    assert.equal(
      judgeAreaHref({
        username: 'pro-judge',
        roleName: 'judge',
        acceptedContests: ASSIGNED,
        pendingInvitations: ASSIGNED,
      }),
      null
    );
  });

  it('matches the judge role case-insensitively', () => {
    // Role names arrive as stored in the roles table; the sidebar has always
    // lowercased before comparing, so this must too.
    assert.equal(
      judgeAreaHref({
        username: 'pro-judge',
        roleName: 'JUDGE',
        acceptedContests: ASSIGNED,
        pendingInvitations: [],
      }),
      null
    );
  });

  it('returns null with no assignments and no invitations', () => {
    assert.equal(
      judgeAreaHref({
        username: 'librarian1',
        roleName: 'fan',
        acceptedContests: [],
        pendingInvitations: [],
      }),
      null
    );
  });

  it('returns null before the queries have resolved', () => {
    // RTK Query data is undefined until the first response; the link must not
    // flash or throw in that window.
    assert.equal(
      judgeAreaHref({ username: 'librarian1', roleName: 'fan' }),
      null
    );
  });

  it('returns null without a username, which the judge URL requires', () => {
    // username is nullable on the user record; /judge/[judgeId] is the
    // username, so there is no valid URL to offer.
    assert.equal(
      judgeAreaHref({
        username: null,
        roleName: 'fan',
        acceptedContests: ASSIGNED,
        pendingInvitations: [],
      }),
      null
    );
    assert.equal(
      judgeAreaHref({
        username: '   ',
        roleName: 'fan',
        acceptedContests: ASSIGNED,
        pendingInvitations: [],
      }),
      null
    );
  });

  it('trims and lowercases the username in the href', () => {
    // The judge routes render at /judge/[judgeId] keyed on the lowercased
    // username; a mixed-case href would 404 for those users.
    assert.equal(
      judgeAreaHref({
        username: '  MixedCase ',
        roleName: 'fan',
        acceptedContests: ASSIGNED,
        pendingInvitations: [],
      }),
      '/judge/mixedcase'
    );
  });
});
