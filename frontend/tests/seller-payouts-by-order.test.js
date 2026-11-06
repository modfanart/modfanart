/**
 * Seller payouts page (TSK-028): the payout history is grouped by the order
 * each line came from, with a per-order net. Rendered for real with the
 * same jsdom harness as artwork-page-links.test.js; every RTK Query hook and
 * the marketplace helpers are stubbed.
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

let SellerPayouts;
let dom;
let restoreLoad;

// Mutable per-test wiring.
let payoutsResponse;
let connectResponse;

// Same formatter lib/marketplace/format.ts uses, so assertions do not depend
// on this machine's ICU data.
const usd = (cents) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(cents / 100);
const count = (text, needle) => text.split(needle).length - 1;

before(() => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seller-payouts-'));
  const tmp = path.join(outDir, 'SellerPayouts.tsx');
  fs.copyFileSync(path.join(FRONTEND, 'components/marketplace/seller/seller-payouts.tsx'), tmp);
  try {
    execFileSync(
      path.join(FRONTEND, 'node_modules/.bin/tsc'),
      [tmp, '--jsx', 'react-jsx', '--noResolve', '--skipLibCheck',
        '--target', 'es2020', '--module', 'commonjs', '--outDir', outDir],
      { stdio: 'pipe' }
    );
  } catch (err) {
    if (!fs.existsSync(path.join(outDir, 'SellerPayouts.js'))) {
      throw new Error('tsc emitted nothing:\n' + String(err.stdout).slice(0, 4000));
    }
  }

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
    if (request === '@/services/api/marketplaceApi') {
      return {
        useGetMyPayoutsQuery: () => ({ data: payoutsResponse, isLoading: false }),
        useGetConnectStatusQuery: () => ({ data: connectResponse }),
        useCreateConnectAccountMutation: () => [async () => ({ unwrap: async () => null }), { isLoading: false }],
      };
    }
    if (request === '@/lib/marketplace/format') {
      return {
        formatMoney: usd,
        formatDate: () => 'Sep 14, 2026',
        PAYOUT_STATUS: { pending: { label: 'Pending' }, paid: { label: 'Paid' }, failed: { label: 'Failed' } },
      };
    }
    if (request === '@/components/marketplace/status-badge') {
      return { StatusBadge: ({ map, status }) => React.createElement('span', null, map[status].label) };
    }
    // Relative import inside the component; the tmp copy cannot resolve it.
    if (request === './seller-overview') {
      return { StatTile: ({ label, value }) => React.createElement('div', null, `${label}: ${value}`) };
    }
    if (request === 'lucide-react') return iconProxy;
    if (typeof request === 'string' && request.startsWith('@/')) return uiProxy;
    return realLoad.apply(this, arguments);
  };

  SellerPayouts = require(path.join(outDir, 'SellerPayouts.js')).SellerPayouts;
});

after(() => { if (restoreLoad) restoreLoad(); });

beforeEach(() => {
  payoutsResponse = [];
  connectResponse = { connected: true, payouts_enabled: true };
});

async function render() {
  const container = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(container);
  await act(async () => {
    createRoot(container).render(React.createElement(SellerPayouts));
  });
  return container;
}

const payout = (overrides) => ({
  id: 'p', seller_id: 's', order_item_id: 'oi', gross_cents: 10000, platform_fee_cents: 1500,
  net_cents: 8500, status: 'paid', stripe_transfer_id: null, created_at: '2026-09-14T09:00:00.000Z',
  ...overrides,
});

describe('SellerPayouts grouped by order', () => {
  it('keeps the empty state when there are no payouts', async () => {
    const container = await render();
    assert.ok(container.textContent.includes('Payouts appear here once an order is completed'));
    assert.ok(!container.textContent.includes('Order #'));
  });

  it('shows one section per order with its item count and net total', async () => {
    payoutsResponse = [
      payout({ id: 'p1', order_id: 'o1', order_number: 'CART-1001', net_cents: 8500 }),
      payout({ id: 'p2', order_id: 'o1', order_number: 'CART-1001', gross_cents: 2000, platform_fee_cents: 300, net_cents: 1700 }),
      payout({ id: 'p3', order_id: 'o2', order_number: 'CART-1002', status: 'pending', net_cents: 4250, gross_cents: 5000, platform_fee_cents: 750 }),
    ];
    const container = await render();
    const text = container.textContent;

    assert.equal(count(text, 'Order #CART-1001'), 1, 'two lines on one order make one section');
    assert.equal(count(text, 'Order #CART-1002'), 1);
    assert.ok(text.includes('2 items'));
    assert.ok(text.includes('1 item'));
    assert.ok(text.includes(usd(8500 + 1700)), 'per-order net is the sum of its lines');
    assert.ok(text.includes(usd(1700)), 'each line still shows its own net');
    assert.ok(!text.includes('Other sales'));

    const sections = [...container.querySelectorAll('section')].map((s) => s.getAttribute('aria-label'));
    assert.deepEqual(sections, ['Order #CART-1001', 'Order #CART-1002'], 'API order (newest first) is kept');
  });

  it('collapses rows without order info into one trailing "Other sales" section', async () => {
    payoutsResponse = [
      payout({ id: 'p1' }),
      payout({ id: 'p2', order_id: 'o9', order_number: 'CART-1009' }),
      payout({ id: 'p3' }),
    ];
    const container = await render();
    const sections = [...container.querySelectorAll('section')].map((s) => s.getAttribute('aria-label'));
    assert.deepEqual(sections, ['Order #CART-1009', 'Other sales']);
    assert.ok(container.textContent.includes('2 items'));
  });

  it('always shows the Stripe Connect payout status, including when healthy', async () => {
    let container = await render();
    assert.ok(container.textContent.includes('Stripe Connect: Payouts enabled'));
    assert.ok(!container.textContent.includes('Payout account not ready'));

    connectResponse = { connected: false };
    container = await render();
    assert.ok(container.textContent.includes('Stripe Connect: Not connected'));
    assert.ok(container.textContent.includes('Connect Stripe'));

    connectResponse = { connected: true, payouts_enabled: false, details_submitted: true };
    container = await render();
    assert.ok(container.textContent.includes('Under review by Stripe'));
    assert.ok(container.textContent.includes('Continue onboarding'));
  });

  it('still totals the stat tiles across every order', async () => {
    payoutsResponse = [
      payout({ id: 'p1', order_id: 'o1', order_number: 'A', status: 'paid', net_cents: 100 }),
      payout({ id: 'p2', order_id: 'o2', order_number: 'B', status: 'pending', net_cents: 250 }),
    ];
    const container = await render();
    assert.ok(container.textContent.includes(`Paid out: ${usd(100)}`));
    assert.ok(container.textContent.includes(`Pending: ${usd(250)}`));
  });
});
