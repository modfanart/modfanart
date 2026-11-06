/**
 * Seller dashboard shells (products / orders / payouts), rendered for real with
 * effects flushed - the same harness as licensing-tab.test.js. These verify the
 * data->UI contract each section relies on: empty states when the (mocked)
 * seller endpoints return nothing, and populated states from fixture data.
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

let SellerProducts;
let SellerOrders;
let SellerPayouts;
let dom;
let restoreLoad;

// Mutable per-test wiring.
let productsResponse;
let ordersResponse;
let payoutsResponse;

function transpile(srcPath, outName) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seller-dash-'));
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
    if (request === '@/services/api/merchApi') {
      return { useGetMyProductsQuery: () => ({ data: productsResponse, isLoading: false }) };
    }
    if (request === '@/services/api/sellerApi') {
      return { useGetSellerOrdersQuery: () => ({ data: ordersResponse, isLoading: false }) };
    }
    if (request === '@/services/api/payoutApi') {
      return { useGetMyPayoutsQuery: () => ({ data: payoutsResponse, isLoading: false }) };
    }
    if (request === 'lucide-react') return iconProxy;
    if (typeof request === 'string' && request.startsWith('@/')) return uiProxy;
    // Bare npm specifiers (date-fns, …) must resolve against frontend/node_modules,
    // not the tmp dir the component runs from. Resolve to an absolute path here,
    // then let the real loader load it.
    if (typeof request === 'string' && request[0] !== '.' && !path.isAbsolute(request)) {
      const args = Array.from(arguments);
      args[0] = require.resolve(request);
      return realLoad.apply(this, args);
    }
    return realLoad.apply(this, arguments);
  };

  SellerProducts = require(
    transpile(path.join(FRONTEND, 'components/seller/seller-products.tsx'), 'SellerProducts')
  ).SellerProducts;
  SellerOrders = require(
    transpile(path.join(FRONTEND, 'components/seller/seller-orders.tsx'), 'SellerOrders')
  ).SellerOrders;
  SellerPayouts = require(
    transpile(path.join(FRONTEND, 'components/seller/seller-payouts.tsx'), 'SellerPayouts')
  ).SellerPayouts;
});

after(() => { if (restoreLoad) restoreLoad(); });

beforeEach(() => {
  productsResponse = [];
  ordersResponse = [];
  payoutsResponse = [];
});

async function render(element) {
  const container = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(container);
  await act(async () => {
    createRoot(container).render(element);
  });
  return container;
}

describe('SellerProducts', () => {
  it('shows the empty state when there are no products', async () => {
    const container = await render(React.createElement(SellerProducts));
    assert.ok(container.textContent.includes('No products yet'));
  });

  it('lists products with their title and status', async () => {
    productsResponse = [
      {
        id: 'p1', title: 'Nightfall Poster', status: 'published',
        base_product_type: 'poster',
        variants: [{ id: 'v1', price_inr_cents: 79900 }],
      },
      { id: 'p2', title: 'Circuit Tee', status: 'draft', base_product_type: 'tshirt', variants: [] },
    ];
    const container = await render(React.createElement(SellerProducts));
    const text = container.textContent;
    assert.ok(text.includes('Nightfall Poster'));
    assert.ok(text.includes('Circuit Tee'));
    assert.ok(text.includes('published'));
    assert.ok(text.includes('draft'));
    assert.ok(text.includes('1 variant'));
    assert.ok(text.includes('0 variants'));
    assert.ok(!text.includes('No products yet'));
  });

  it('handles bare rows from GET /merch/mine (no variants key, review statuses)', async () => {
    productsResponse = [
      { id: 'p3', title: 'Bare Row Mug', status: 'pending_review', base_product_type: 'mug' },
      { id: 'p4', title: 'Rejected Cap', status: 'rejected', base_product_type: 'cap' },
    ];
    const container = await render(React.createElement(SellerProducts));
    const text = container.textContent;
    assert.ok(text.includes('Bare Row Mug'));
    assert.ok(text.includes('pending review'));
    assert.ok(text.includes('rejected'));
    assert.ok(!text.includes('variant'), 'must not claim "0 variants" when the API omits them');
  });
});

describe('SellerOrders', () => {
  it('shows the empty state when there are no orders', async () => {
    const container = await render(React.createElement(SellerOrders));
    assert.ok(container.textContent.includes('No orders yet'));
  });

  it('lists an order with its number and status', async () => {
    ordersResponse = [
      {
        id: 'o1', order_number: 'MFA-1001', status: 'paid',
        currency: 'INR', total_cents: 79900, created_at: '2026-09-14T09:00:00.000Z',
      },
    ];
    const container = await render(React.createElement(SellerOrders));
    const text = container.textContent;
    assert.ok(text.includes('MFA-1001'));
    assert.ok(text.includes('paid'));
    assert.ok(!text.includes('No orders yet'));
  });
});

describe('SellerPayouts', () => {
  it('shows the empty state when there are no payouts', async () => {
    const container = await render(React.createElement(SellerPayouts));
    assert.ok(container.textContent.includes('No payouts yet'));
  });

  it('shows summary tiles and payout rows from fixture data', async () => {
    payoutsResponse = [
      {
        id: 'pay1', status: 'paid', gross_cents: 79900, platform_fee_cents: 7990,
        net_cents: 71910, created_at: '2026-09-14T09:00:00.000Z',
      },
      {
        id: 'pay2', status: 'pending', gross_cents: 120000, platform_fee_cents: 12000,
        net_cents: 108000, created_at: '2026-09-16T09:00:00.000Z',
      },
    ];
    const container = await render(React.createElement(SellerPayouts));
    const text = container.textContent;
    assert.ok(text.includes('Paid out'));
    assert.ok(text.includes('Pending'));
    assert.ok(text.includes('paid'));
    assert.ok(text.includes('pending'));
    assert.ok(!text.includes('No payouts yet'));
  });
});
