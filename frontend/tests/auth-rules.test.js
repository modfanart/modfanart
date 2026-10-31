/**
 * Signup and account rules from the QA audit (AUTH-02, AUTH-05, AUTH-10, AUTH-11).
 *
 * Run: npm test  (from frontend/)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { passwordPolicyError, unmetPasswordRules } from '../lib/auth/password-policy.js';
import { roleLabel } from '../lib/auth/roles.js';
import { usernameError } from '../lib/auth/username.js';
import { AUTH_TIMEOUT_CODE, fetchWithTimeout, withTimeout } from '../lib/auth/timeout.js';

describe('password policy (AUTH-05)', () => {
  it('rejects the audit example that only had symbols', () => {
    assert.notEqual(passwordPolicyError('NoDigits!!!!!'), null);
    assert.deepEqual(
      unmetPasswordRules('NoDigits!!!!!').map((rule) => rule.id),
      ['number']
    );
  });

  it('rejects passwords missing a case or too short', () => {
    assert.deepEqual(unmetPasswordRules('password1').map((r) => r.id), ['upper']);
    assert.deepEqual(unmetPasswordRules('PASSWORD1').map((r) => r.id), ['lower']);
    assert.deepEqual(unmetPasswordRules('Pass1').map((r) => r.id), ['length']);
  });

  it('accepts 8+ characters with upper, lower and a number', () => {
    assert.equal(passwordPolicyError('Password123'), null);
    assert.equal(passwordPolicyError('aB3defgh'), null);
  });

  it('treats a missing value as failing every rule', () => {
    assert.equal(unmetPasswordRules(undefined).length, 4);
  });
});

describe('roleLabel (AUTH-02)', () => {
  it('never shows the raw fan enum', () => {
    assert.equal(roleLabel('DEFAULT_USER'), 'Fan');
  });

  it('labels the roles signup assigns', () => {
    assert.equal(roleLabel('ARTIST'), 'Artist');
    assert.equal(roleLabel('BRAND_MANAGER'), 'Brand');
    assert.equal(roleLabel('ADMIN'), 'Admin');
  });

  it('humanises roles it does not know about', () => {
    assert.equal(roleLabel('CONTENT_REVIEWER'), 'Content Reviewer');
  });

  it('falls back to Member without a role', () => {
    assert.equal(roleLabel(undefined), 'Member');
    assert.equal(roleLabel(''), 'Member');
  });
});

describe('usernameError (AUTH-10)', () => {
  it('accepts letters, numbers and underscores', () => {
    assert.equal(usernameError('qa_artist_1'), null);
  });

  it('explains each rule', () => {
    assert.match(usernameError('ab'), /at least 3/);
    assert.match(usernameError('a'.repeat(31)), /at most 30/);
    assert.match(usernameError('has space'), /letters, numbers and underscores/);
    assert.match(usernameError('dash-ed'), /letters, numbers and underscores/);
  });
});

describe('auth deadlines (AUTH-11)', () => {
  it('rejects a promise that never settles with auth/timeout', async () => {
    const never = new Promise(() => {});
    await assert.rejects(withTimeout(never, 20, 'Signing in'), (err) => {
      assert.equal(err.code, AUTH_TIMEOUT_CODE);
      assert.match(err.message, /Signing in took too long/);
      return true;
    });
  });

  it('passes through a value that arrives in time', async () => {
    assert.equal(await withTimeout(Promise.resolve('ok'), 1000), 'ok');
  });

  it('passes through the original error', async () => {
    const boom = Object.assign(new Error('nope'), { code: 'auth/invalid-credential' });
    await assert.rejects(withTimeout(Promise.reject(boom), 1000), boom);
  });

  it('aborts a hung fetch with auth/timeout', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (_url, init) =>
      new Promise((_, reject) => {
        init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      });
    try {
      await assert.rejects(fetchWithTimeout('http://example.test', {}, 20), (err) => {
        assert.equal(err.code, AUTH_TIMEOUT_CODE);
        return true;
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
