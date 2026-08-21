/**
 * The artwork detail page's navigation, rendered for real - same jsdom
 * harness as public-results-page.test.js.
 *
 * The client hit both defects this file pins down by walking from a shared
 * results link onto this page: "Back to Gallery" pointed at /gallery/featured,
 * a route that has never existed (404 in production), and "Proceed to License"
 * was a button with no handler and no destination. These assert the fix and
 * its boundary: gallery links go to the route that exists, the dead button is
 * gone, and the per-tier Choose links - the real license CTA - still work.
 *
 * Run: npm test  (from frontend/)
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { createRequire } from 'node:module';
import Module from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// act() only flushes effects in React's development build; pin before react
// loads (React reads NODE_ENV at module scope).
process.env.NODE_ENV = 'development';

const require = createRequire(import.meta.url);
const FRONTEND = path.resolve(import.meta.dirname, '..');

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react-dom/test-utils');
const { JSDOM } = require('jsdom');

const ARTWORK = {
  id: 'art-1',
  creator_id: 'creator-123456789',
  title: 'Winning Piece',
  description: 'A study in blues',
  file_url: 'https://cdn/art-1.png',
  thumbnail_url: null,
  status: 'published',
  created_at: '2026-08-01T00:00:00.000Z',
  views_count: 12,
  favorites_count: 3,
  pricing_tiers: [
    { id: 'tier-1', license_type: 'standard', is_active: true, price_usd_cents: 5000, price_inr_cents: 400000 },
  ],
};

let ArtworkPage;
let dom;
let restoreLoad;

before(() => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'artwork-page-'));
  const tmpTsx = path.join(outDir, 'ArtworkPage.tsx');
  fs.copyFileSync(path.join(FRONTEND, 'app/(gallery)/artwork/[id]/page.tsx'), tmpTsx);
  try {
    execFileSync(
      path.join(FRONTEND, 'node_modules/.bin/tsc'),
      [tmpTsx, '--jsx', 'react-jsx', '--noResolve', '--skipLibCheck',
        '--target', 'es2020', '--module', 'commonjs', '--outDir', outDir],
      { stdio: 'pipe' }
    );
  } catch (err) {
    if (!fs.existsSync(path.join(outDir, 'ArtworkPage.js'))) {
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
    if (request === 'next/navigation') {
      return {
        useParams: () => ({ id: ARTWORK.id }),
        useRouter: () => ({ push() {}, back() {} }),
      };
    }
    if (request === 'next/link') {
      return {
        __esModule: true,
        // Object hrefs ({pathname, query}) serialise the way next/link does,
        // so the Choose links can be asserted as concrete URLs.
        default: ({ children, href }) => {
          const url =
            typeof href === 'string'
              ? href
              : `${href.pathname}?${new URLSearchParams(href.query)}`;
          return React.createElement('a', { href: url }, children);
        },
      };
    }
    if (request === 'next/image') {
      return { __esModule: true, default: ({ src, alt }) => React.createElement('img', { src, alt }) };
    }
    if (request === '@/components/ui/button') {
      return {
        __esModule: true,
        Button: ({ children, onClick, disabled, asChild }) =>
          asChild
            ? React.createElement(React.Fragment, null, children)
            : React.createElement('button', { onClick, disabled }, children),
      };
    }
    if (request === '@/services/api/artworkApi') {
      return {
        useGetArtworkQuery: () => ({ data: ARTWORK, isLoading: false, isError: false }),
        useGetArtworkCategoriesQuery: () => ({ data: [], isLoading: false }),
      };
    }
    if (request === '@/services/api/artworkTagsApi') {
      return { useGetArtworkTagsQuery: () => ({ data: [], isLoading: false }) };
    }
    if (request === 'date-fns') return { format: () => 'August 1, 2026' };
    if (request === 'lucide-react') return iconProxy;
    if (typeof request === 'string' && request.startsWith('@/')) return uiProxy;
    return realLoad.apply(this, arguments);
  };

  ArtworkPage = require(path.join(outDir, 'ArtworkPage.js')).default;
});

after(() => { if (restoreLoad) restoreLoad(); });

async function render() {
  const container = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(container);
  await act(async () => {
    createRoot(container).render(React.createElement(ArtworkPage));
  });
  return container;
}

describe('artwork page - the navigation a shared-results visitor lands on', () => {
  it('Back to Gallery points at the gallery route that exists', async () => {
    const container = await render();

    const galleryLinks = [...container.querySelectorAll('a')].filter((a) =>
      (a.textContent || '').includes('Back to Gallery')
    );
    assert.ok(galleryLinks.length > 0, 'no Back to Gallery link rendered');
    for (const link of galleryLinks) {
      assert.equal(link.getAttribute('href'), '/gallery');
    }
  });

  it('nothing on the page points at the dead /gallery/featured route', async () => {
    const container = await render();
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    assert.ok(
      !hrefs.some((h) => h && h.includes('/gallery/featured')),
      `dead route still linked: ${hrefs}`
    );
  });

  it('the handler-less Proceed to License button is gone', async () => {
    const container = await render();
    assert.ok(
      !(container.textContent || '').includes('Proceed to License'),
      'the dead button is back'
    );
  });

  it('the per-tier Choose links - the real license CTA - still work', async () => {
    const container = await render();
    const choose = [...container.querySelectorAll('a')].find((a) =>
      (a.textContent || '').includes('Choose')
    );
    assert.ok(choose, 'the Choose link disappeared - the fix overreached');
    assert.equal(choose.getAttribute('href'), '/artwork/art-1/license?tier=tier-1');
  });
});
