/**
 * The public results page (/results/[token]) and the brand Results tab,
 * rendered for real with effects flushed - the same harness as
 * edit-contest-page.test.js, for the same reason: this feature's bugs live in
 * what effects put into state, which renderToStaticMarkup never executes.
 *
 * The public page is the only page in the app meant for a viewer with no
 * account, so its fetch is asserted to carry no Authorization header.
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

const TOKEN = 'tok_0123456789abcdef0123456789abcdef';

const WINNERS_RESPONSE = {
  contest: { title: 'The Librarians Official Fan Art Contest', hero_image: null },
  winners: [
    {
      entry_id: 'e1',
      rank: 1,
      submission_notes: 'Happy to tweak the colours on request',
      artwork_id: 'art-1',
      artwork_title: 'First Piece',
      artwork_description: 'A study in blues',
      artwork_thumbnail: 'https://cdn/1-thumb.png',
      artwork_file_url: 'https://cdn/1.png',
      creator_username: 'artist_one',
    },
    {
      entry_id: 'e2',
      rank: 2,
      submission_notes: null,
      artwork_id: 'art-2',
      artwork_title: 'Second Piece',
      artwork_description: null,
      artwork_thumbnail: null,
      artwork_file_url: 'https://cdn/2.png',
      creator_username: 'artist_two',
    },
  ],
};

const LEADERBOARD = {
  leaderboard: [
    {
      entry_id: 'e1', artwork_id: 'a1', creator_id: 'c1', status: 'approved',
      rank: 1, score_judge: 9, judge_count: 2,
      artwork_title: 'First Piece', artwork_thumbnail: null,
      artwork_file_url: 'https://cdn/1.png', creator_username: 'artist_one',
    },
    {
      entry_id: 'e2', artwork_id: 'a2', creator_id: 'c2', status: 'winner',
      rank: 2, score_judge: 7, judge_count: 2,
      artwork_title: 'Second Piece', artwork_thumbnail: null,
      artwork_file_url: 'https://cdn/2.png', creator_username: 'artist_two',
    },
  ],
  scored_total: 2,
  approved_total: 2,
  judges_scoring: 2,
};

let PublicResultsPage;
let ResultsTabContent;
let dom;
let restoreLoad;

// Mutable per-test wiring.
let fetchCalls = [];
let fetchResponse = null;
let selectWinnersCalls = [];
let shareLinkCalls = 0;

function transpile(srcPath, outName) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'results-page-'));
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

  // The page calls the global fetch; capture every call and its headers.
  global.fetch = (url, init) => {
    fetchCalls.push({ url: String(url), init: init || {} });
    // Resolve inside the executor: a throwing fetchResponse becomes a
    // rejected promise, which is how a real network failure presents.
    return new Promise((resolve) => resolve(fetchResponse()));
  };

  const PRELOADED = {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'react/jsx-dev-runtime': require('react/jsx-dev-runtime'),
  };

  const passthrough = ({ children, ...p }) => React.createElement('div', null, children);
  const uiProxy = new Proxy({}, { get: (_t, n) => (n === '__esModule' ? true : passthrough) });
  const iconProxy = new Proxy({}, { get: (_t, n) => (n === '__esModule' ? true : () => null) });

  const realLoad = Module._load;
  restoreLoad = () => { Module._load = realLoad; };
  Module._load = function (request) {
    if (PRELOADED[request]) return PRELOADED[request];
    if (request === 'next/navigation') {
      return { useParams: () => ({ token: TOKEN }), useRouter: () => ({ push() {} }) };
    }
    if (request === 'next/link') {
      return {
        __esModule: true,
        default: ({ children, href, ...rest }) =>
          React.createElement('a', { href, 'aria-label': rest['aria-label'] }, children),
      };
    }
    if (request === 'next/image') {
      return {
        __esModule: true,
        // fill/sizes are Next-only props; a real <img> keeps src inspectable.
        default: ({ src, alt }) => React.createElement('img', { src, alt }),
      };
    }
    if (request === '@/services') {
      return { API_BASE_URL: 'http://api.test/api' };
    }
    if (request === '@/services/api/contestsApi') {
      return {
        useGetLeaderboardQuery: () => ({ data: LEADERBOARD, isLoading: false, error: undefined }),
        useSelectWinnersMutation: () => [
          (arg) => {
            selectWinnersCalls.push(arg);
            return { unwrap: async () => ({ winners: [] }) };
          },
          { isLoading: false },
        ],
        useGetResultsShareLinkMutation: () => [
          () => {
            shareLinkCalls += 1;
            return { unwrap: async () => ({ share_url: `http://front.test/results/${TOKEN}` }) };
          },
          { isLoading: false },
        ],
      };
    }
    if (request === '@/components/ui/button') {
      // Real <button> elements so tests can find and click them; the generic
      // proxy renders divs, which querySelectorAll('button') cannot see.
      return {
        __esModule: true,
        Button: ({ children, onClick, disabled }) =>
          React.createElement('button', { onClick, disabled }, children),
      };
    }
    if (request === '@/components/ui/checkbox') {
      // A real checkbox input, so tests can click it and read checked state.
      return {
        __esModule: true,
        Checkbox: ({ checked, onCheckedChange, id }) =>
          React.createElement('input', {
            type: 'checkbox',
            id,
            checked: Boolean(checked),
            onChange: () => onCheckedChange && onCheckedChange(!checked),
          }),
      };
    }
    if (request === 'lucide-react') return iconProxy;
    if (typeof request === 'string' && request.startsWith('@/')) return uiProxy;
    return realLoad.apply(this, arguments);
  };

  PublicResultsPage = require(
    transpile(path.join(FRONTEND, 'app/(public)/results/[token]/page.tsx'), 'PublicResultsPage')
  ).default;
  ResultsTabContent = require(
    transpile(path.join(FRONTEND, 'components/opportunities/results-tab-content.tsx'), 'ResultsTab')
  ).ResultsTabContent;
});

after(() => { if (restoreLoad) restoreLoad(); });

async function render(element) {
  const container = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(container);
  await act(async () => {
    createRoot(container).render(element);
  });
  return container;
}

const jsonResponse = (status, body) => () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe('public results page - a viewer with no account', () => {
  it('renders the winners from an anonymous fetch', async () => {
    fetchCalls = [];
    fetchResponse = jsonResponse(200, WINNERS_RESPONSE);

    const container = await render(React.createElement(PublicResultsPage));

    assert.equal(fetchCalls.length, 1);
    assert.equal(
      fetchCalls[0].url,
      `http://api.test/api/public/contest-results/${TOKEN}`
    );
    // The page must behave identically for a logged-out viewer: no
    // Authorization header may ride along.
    const headers = fetchCalls[0].init.headers || {};
    assert.ok(!('Authorization' in headers), 'public fetch must not send auth');

    const text = container.textContent;
    assert.ok(text.includes('The Librarians Official Fan Art Contest'), text);
    assert.ok(text.includes('First Piece'));
    assert.ok(text.includes('@artist_one'));
    assert.ok(text.includes('Second Piece'));

    const srcs = [...container.querySelectorAll('img')].map((i) => i.getAttribute('src'));
    assert.ok(srcs.includes('https://cdn/1-thumb.png'), `thumbnail preferred, got ${srcs}`);
    assert.ok(srcs.includes('https://cdn/2.png'), `file_url fallback, got ${srcs}`);

    // Description and artist's note render for the winner that has them...
    assert.ok(text.includes('A study in blues'), 'description missing');
    assert.ok(text.includes('Happy to tweak the colours on request'), 'note missing');
    // ...and the note label appears exactly once: the second winner has no
    // note, so no empty "Artist's note" box may render for it.
    const labelCount = text.split("Artist's note").length - 1;
    assert.equal(labelCount, 1, `expected one note label, saw ${labelCount}`);

    // Both the thumbnail and the explicit button link to the artwork page.
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    assert.equal(hrefs.filter((h) => h === '/artwork/art-1').length, 2,
      `thumbnail + button should both link to /artwork/art-1, got ${hrefs}`);
    assert.ok(hrefs.includes('/artwork/art-2'), `second winner link missing, got ${hrefs}`);
  });

  it('says winners are not selected yet when the list is empty', async () => {
    fetchResponse = jsonResponse(200, { contest: { title: 'C', hero_image: null }, winners: [] });
    const container = await render(React.createElement(PublicResultsPage));
    assert.ok(container.textContent.includes("haven't been selected yet"), container.textContent);
  });

  it('shows the invalid-link message on 404, not a crash or a spinner', async () => {
    fetchResponse = jsonResponse(404, { error: 'Results not found' });
    const container = await render(React.createElement(PublicResultsPage));
    assert.ok(container.textContent.includes('no longer valid'), container.textContent);
  });

  it('shows the retry message when the API is down', async () => {
    fetchResponse = () => { throw new Error('network down'); };
    const container = await render(React.createElement(PublicResultsPage));
    assert.ok(container.textContent.includes('Could not load'), container.textContent);
  });
});

describe('brand results tab - selecting winners', () => {
  it('seeds the checkboxes from entries already marked winner', async () => {
    selectWinnersCalls = [];
    const container = await render(
      React.createElement(ResultsTabContent, { contestId: 'contest-1' })
    );

    const boxes = [...container.querySelectorAll('input[type=checkbox]')];
    assert.equal(boxes.length, 2);
    const byId = Object.fromEntries(boxes.map((b) => [b.id, b.checked]));
    // e2 is status 'winner' in the fixture, e1 is merely approved.
    assert.equal(byId['winner-e2'], true);
    assert.equal(byId['winner-e1'], false);
  });

  it('saves in leaderboard order no matter the click order', async () => {
    selectWinnersCalls = [];
    const container = await render(
      React.createElement(ResultsTabContent, { contestId: 'contest-1' })
    );

    // e2 is already checked; check e1 second. Rank must still follow the
    // board (e1 first - it is ranked higher), not the click sequence.
    // Not querySelector('#winner-e1'): earlier tests' containers stay in the
    // document, and jsdom resolves #id against the first match document-wide,
    // so a scoped id query can come back null. Same workaround as the slug
    // field in edit-contest-page.test.js.
    const inputs = [...container.querySelectorAll('input[type=checkbox]')];
    const e1 = inputs.find((i) => i.id === 'winner-e1');
    assert.ok(e1, `no winner-e1 checkbox; ids: ${inputs.map((i) => i.id)}`);
    await act(async () => {
      e1.click();
    });

    const save = [...container.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Save selection')
    );
    assert.ok(save, 'no save button rendered');
    await act(async () => {
      save.click();
    });

    assert.equal(selectWinnersCalls.length, 1);
    assert.deepEqual(selectWinnersCalls[0], {
      contestId: 'contest-1',
      entry_ids: ['e1', 'e2'],
    });
  });

  it('share button surfaces the link on screen', async () => {
    shareLinkCalls = 0;
    const container = await render(
      React.createElement(ResultsTabContent, { contestId: 'contest-1' })
    );

    const share = [...container.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Share results')
    );
    assert.ok(share, 'no share button rendered');
    await act(async () => {
      share.click();
    });

    assert.equal(shareLinkCalls, 1);
    assert.ok(
      container.textContent.includes(`http://front.test/results/${TOKEN}`),
      'share url not shown to the brand'
    );
  });
});
