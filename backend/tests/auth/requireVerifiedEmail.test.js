const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// auth.middleware pulls in src/config, which builds the pg pool at import time; the shared
// helper sets DATABASE_URL up first. These tests themselves never touch the database.
require('../helpers/db');
const { requireVerifiedEmail } = require('../../src/common/middleware/auth.middleware');

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
      return this;
    },
  };
}

function run(user) {
  const res = makeRes();
  let nextCalled = false;
  requireVerifiedEmail({ user }, res, () => {
    nextCalled = true;
  });
  return { res, nextCalled };
}

/**
 * Unverified accounts may browse but not submit (AUTH-03). The frontend sends people to
 * /verify-account when it sees code EMAIL_NOT_VERIFIED, so the code is part of the contract.
 */
describe('requireVerifiedEmail', () => {
  it('lets a verified account through', () => {
    const { res, nextCalled } = run({ id: 'u1', email_verified: true });
    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, null);
  });

  it('blocks an unverified account with EMAIL_NOT_VERIFIED', () => {
    const { res, nextCalled } = run({ id: 'u1', email_verified: false });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.code, 'EMAIL_NOT_VERIFIED');
  });

  it('treats a missing flag as unverified', () => {
    const { res, nextCalled } = run({ id: 'u1' });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
  });

  it('answers 401 when authentication did not run', () => {
    const { res, nextCalled } = run(undefined);
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });
});
