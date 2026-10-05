/**
 * Seller onboarding, rendered for real with effects flushed - the same harness
 * as licensing-tab.test.js. What matters here is the branch the component takes
 * from the (mocked) application query: an existing application short-circuits to
 * the status view with the right badge; no application shows the wizard, which
 * extends the brand-verification flow and adds the KYC document step the brand
 * signup lacks.
 *
 * Run: npm test  (from frontend/)
 */
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { createRequire } from 'node:module';
import Module from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.NODE_ENV = 'development';

const require = createRequire(import.meta.url);
const FRONTEND = path.resolve(import.meta.dirname, '..');

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react-dom/test-utils');
const { JSDOM } = require('jsdom');

let SellerOnboarding;
let dom;
let restoreLoad;

// Mutable per-test wiring. `profileResponse` mirrors SellerProfileRow from
// GET /sellers/mine on the marketplace backend branch.
let profileResponse;
let submitCalls = [];

const baseProfile = {
  id: 'sp1', user_id: 'u1', display_name: 'Mock Studio', status: 'pending',
  payout_ready: false, reviewed_by: null, reviewed_at: null, notes: null,
  created_at: '2026-09-15T12:00:00.000Z', updated_at: '2026-09-15T12:00:00.000Z',
};

function transpile(srcPath, outName) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seller-onboarding-'));
  const tmp = path.join(outDir, `${outName}.tsx`);
  fs.copyFileSync(srcPath, tmp);
  try {
    execFileSync(
      path.join(FRONTEND, 'node_modules/.bin/tsc'),
      [tmp, '--jsx', 'react-jsx', '--noResolve', '--skipLibCheck',
        '--target', 'es2020', '--module', 'commonjs', '--outDir', outDir],
      { stdio: 'pipe' }
    );
  } catch (err) {
    if (!fs.existsSync(path.join(outDir, `${outName}.js`))) {
      throw new Error('tsc emitted nothing:\n' + String(err.stdout).slice(0, 4000));
    }
  }
  return path.join(outDir, `${outName}.js`);
}

before(() => {
  dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.IS_REACT_ACT_ENVIRONMENT = true;

  const PRELOADED = {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'react/jsx-dev-runtime': require('react/jsx-dev-runtime'),
  };

  const passthrough = ({ children }) => React.createElement('div', null, children);
  const uiProxy = new Proxy({}, { get: (_t, n) => (n === '__esModule' ? true : passthrough) });
  const iconProxy = new Proxy({}, { get: (_t, n) => (n === '__esModule' ? true : () => null) });

  const realLoad = Module._load;
  restoreLoad = () => { Module._load = realLoad; };
  Module._load = function (request) {
    if (PRELOADED[request]) return PRELOADED[request];
    if (request === '@/services/api/sellerApi') {
      return {
        useGetMySellerProfileQuery: () => ({ data: profileResponse, isLoading: false }),
        useSubmitSellerProfileMutation: () => [
          (arg) => { submitCalls.push(arg); return { unwrap: async () => ({ profile: {} }) }; },
          { isLoading: false },
        ],
        useUploadKycDocumentMutation: () => [
          () => ({ unwrap: async () => ({ url: 'https://mock.local/kyc/doc.pdf' }) }),
          { isLoading: false },
        ],
      };
    }
    if (request === 'lucide-react') return iconProxy;
    if (typeof request === 'string' && request.startsWith('@/')) return uiProxy;
    // Bare npm specifiers (zod, react-hook-form, @hookform/resolvers/zod, …) must
    // resolve against frontend/node_modules, not the tmp dir the component runs
    // from. Resolve to an absolute path here, then let the real loader load it.
    if (typeof request === 'string' && request[0] !== '.' && !path.isAbsolute(request)) {
      const args = Array.from(arguments);
      args[0] = require.resolve(request);
      return realLoad.apply(this, args);
    }
    return realLoad.apply(this, arguments);
  };

  SellerOnboarding = require(
    transpile(path.join(FRONTEND, 'components/seller/seller-onboarding.tsx'), 'SellerOnboarding')
  ).SellerOnboarding;
});

after(() => { if (restoreLoad) restoreLoad(); });

beforeEach(() => {
  profileResponse = null; // what the real endpoint returns when the user has no profile
  submitCalls = [];
});

async function render(element) {
  const container = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(container);
  await act(async () => {
    createRoot(container).render(element);
  });
  return container;
}

describe('SellerOnboarding', () => {
  it('shows the wizard when there is no application', async () => {
    const container = await render(React.createElement(SellerOnboarding));
    const text = container.textContent;
    assert.ok(text.includes('Become a seller'));
    assert.ok(text.includes('Step 1 of 4'));
    assert.ok(text.includes('Continue'));
  });

  it('shows the status view from a bare backend row (approved, payout ready)', async () => {
    // Exactly the real row: no contact_email / documents forward-compat fields.
    profileResponse = { ...baseProfile, status: 'approved', payout_ready: true };
    const container = await render(React.createElement(SellerOnboarding));
    const text = container.textContent;
    assert.ok(text.includes('Seller application'));
    assert.ok(text.includes('Mock Studio'));
    assert.ok(text.includes('Approved'));
    assert.ok(text.includes('Ready'));
    assert.ok(!text.includes('document'), 'documents block must not render when field is absent');
    assert.ok(!text.includes('Become a seller'));
  });

  it('shows a pending profile as under review with payout not set up', async () => {
    profileResponse = { ...baseProfile };
    const container = await render(React.createElement(SellerOnboarding));
    const text = container.textContent;
    assert.ok(text.includes('Under review'));
    assert.ok(text.includes('Not set up'));
  });

  it('surfaces a rejected profile distinctly and shows reviewer notes', async () => {
    profileResponse = {
      ...baseProfile, id: 'sp2', display_name: 'Rejected Co', status: 'rejected',
      notes: 'Missing business proof',
    };
    const container = await render(React.createElement(SellerOnboarding));
    const text = container.textContent;
    assert.ok(text.includes('Not approved'));
    assert.ok(text.includes('Rejected Co'));
    assert.ok(text.includes('Missing business proof'));
  });

  it('surfaces a suspended profile', async () => {
    profileResponse = { ...baseProfile, id: 'sp3', status: 'suspended' };
    const container = await render(React.createElement(SellerOnboarding));
    assert.ok(container.textContent.includes('Suspended'));
  });

  it('renders forward-compat fields when the mock/fuller profile includes them', async () => {
    profileResponse = {
      ...baseProfile, contact_email: 'seller@example.com',
      payout_method: { type: 'upi', detail: 'x@upi' }, documents: ['u1', 'u2'],
    };
    const container = await render(React.createElement(SellerOnboarding));
    const text = container.textContent;
    assert.ok(text.includes('seller@example.com'));
    assert.ok(text.includes('2 documents submitted'));
    assert.ok(text.includes('upi (pending setup)'));
  });
});
