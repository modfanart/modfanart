/**
 * The brand "Edit Opportunity" page, rendered for real.
 *
 * Every value asserted here is one that exists, or existed, in the production
 * contests row. The page went down for the client behind the global error
 * boundary ("Something went wrong") because contests.gallery is a TEXT column
 * holding a JSON array string, and this page read it straight into state that
 * it types as string[]. A string has a .length, so the `length > 0` guard
 * passed, and `.map` then threw mid-render.
 *
 * Types cannot catch that: `gallery?: string[]` is a well-formed lie told at
 * the database boundary. Nor can a test that asserts on values it made up.
 * So this renders the real component with real effects and asserts on what it
 * actually puts in the DOM and what it actually sends on submit.
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

// act() flushes effects only in React's development build; the production
// build skips it silently, so every assertion below would fail for a reason
// that has nothing to do with this page. Pin it before react is loaded, since
// React reads NODE_ENV at module scope. Worth pinning rather than assuming:
// backend/.env sets NODE_ENV=production and Vercel builds run with it set.
process.env.NODE_ENV = 'development';

const require = createRequire(import.meta.url);
const FRONTEND = path.resolve(import.meta.dirname, '..');
const SRC = path.join(
  FRONTEND,
  'app/(dashboard)/brand-manager/[slug]/opportunities/[id]/edit/page.tsx'
);

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react-dom/test-utils');
const { JSDOM } = require('jsdom');

/** The live production row, before the save that broke the page. */
const CONTEST = {
  id: '187a7316-1861-45a3-8d2c-c3e8700de210',
  title: 'The Librarians Official Fan Art Contest',
  slug: 'the-librarians-2026',
  description: 'BRING YOUR CREATIVITY INTO THE WORLD OF THE LIBRARIANS!',
  hero_image: '',
  gallery: '',
  rules: null,
  prizes: null,
  start_date: '2026-07-01T17:00:00+00:00',
  submission_end_date: '2026-08-01T03:59:59+00:00',
  voting_end_date: null,
  judging_end_date: null,
  entry_requirements: null,
  judging_criteria: null,
  categories: [],
  visibility: 'public',
  status: 'live',
  max_entries_per_user: 10,
  winner_announced: false,
};

let EditPage;
let dom;
let restoreLoad;
let currentContest = CONTEST;
let lastPayload = null;

before(() => {
  // 1. Transpile the page with the project's own tsc. Resolution is off, so
  //    the unresolved "@/..." specifiers are reported as errors while valid JS
  //    is still emitted - hence the try/catch around a non-zero exit.
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edit-page-'));
  const tmpTsx = path.join(outDir, 'EditPage.tsx');
  fs.copyFileSync(SRC, tmpTsx);
  try {
    execFileSync(
      path.join(FRONTEND, 'node_modules/.bin/tsc'),
      [tmpTsx, '--jsx', 'react-jsx', '--noResolve', '--skipLibCheck',
        '--target', 'es2020', '--module', 'commonjs', '--outDir', outDir],
      { stdio: 'pipe' }
    );
  } catch (err) {
    if (!fs.existsSync(path.join(outDir, 'EditPage.js'))) {
      throw new Error('tsc emitted nothing:\n' + String(err.stdout).slice(0, 4000));
    }
  }

  // 2. A DOM, and act() so useEffect actually runs. renderToStaticMarkup would
  //    be useless here: the crash only happens after the load effect copies
  //    contest.gallery into form state, and server rendering never runs effects.
  dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.IS_REACT_ACT_ENVIRONMENT = true;

  // 3. Stub everything that is not React. Resolve react BEFORE installing the
  //    hook - calling require() inside it re-enters and blows the stack.
  const PRELOADED = {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'react/jsx-dev-runtime': require('react/jsx-dev-runtime'),
  };

  // Anything given a `value` and no children renders as a real <input>, so the
  // state the effects produced can be read back out of the DOM.
  const passthrough = ({ children, ...p }) =>
    p.value !== undefined && children == null
      ? React.createElement('input', { value: String(p.value), readOnly: true, id: p.id })
      : React.createElement('div', null, children);
  const uiProxy = new Proxy({}, {
    get: (_t, n) => (n === '__esModule' ? true : passthrough),
  });
  const iconProxy = new Proxy({}, { get: (_t, n) => (n === '__esModule' ? true : () => null) });

  const realLoad = Module._load;
  restoreLoad = () => { Module._load = realLoad; };
  Module._load = function (request) {
    if (PRELOADED[request]) return PRELOADED[request];
    if (request === 'next/navigation') {
      return {
        useRouter: () => ({ push() {}, back() {}, replace() {} }),
        useParams: () => ({ id: CONTEST.id, slug: 'the-librarians' }),
      };
    }
    if (request === 'next/link') {
      return {
        __esModule: true,
        default: ({ children, href }) => React.createElement('a', { href }, children),
      };
    }
    if (request === 'lucide-react') return iconProxy;
    if (request === '@/services/api/contestsApi') {
      return {
        useGetContestQuery: () => ({ data: currentContest, isLoading: false, isError: false }),
        useUpdateContestMutation: () => [
          (payload) => {
            lastPayload = payload;
            return { unwrap: async () => ({}) };
          },
          { isLoading: false },
        ],
      };
    }
    if (typeof request === 'string' && request.startsWith('@/')) return uiProxy;
    return realLoad.apply(this, arguments);
  };

  EditPage = require(path.join(outDir, 'EditPage.js')).default;
});

after(() => { if (restoreLoad) restoreLoad(); });

/** Error boundary, so a render throw is captured rather than swallowed. */
class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    return this.state.err ? React.createElement('div', null, 'boundary') : this.props.children;
  }
}

/** Render the page for a contest and hand back the container plus any throw. */
async function render(contest) {
  currentContest = contest;
  lastPayload = null;
  const container = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(container);

  let boundary;
  const realError = console.error;
  console.error = () => {}; // React logs the caught error; keep output readable
  try {
    await act(async () => {
      createRoot(container).render(
        React.createElement(Boundary, { ref: (r) => (boundary = r) },
          React.createElement(EditPage))
      );
    });
  } catch (err) {
    boundary = { state: { err } };
  } finally {
    console.error = realError;
  }
  return { container, err: boundary?.state?.err ?? null };
}

describe('edit contest page - gallery values that exist in the database', () => {
  // Every one of these is real. "" predates the column; "[]" is what
  // createContest writes for every contest it makes; "{}" and {"a","b"} are
  // Postgres array literals written by updateContest before it serialised.
  const REAL_VALUES = [
    ['"" - rows predating the gallery column', ''],
    ['"[]" - what createContest writes for EVERY new contest', '[]'],
    ['"{}" - written by the unserialised updateContest', '{}'],
    ['a Postgres array literal, which is not valid JSON', '{"https://cdn/1.png","https://cdn/2.png"}'],
    ['a correctly stored JSON array', '["https://cdn/1.png","https://cdn/2.png"]'],
  ];

  for (const [label, gallery] of REAL_VALUES) {
    it(`renders when gallery is ${label}`, async () => {
      const { err } = await render({ ...CONTEST, gallery });

      assert.equal(err, null, `page crashed instead of rendering: ${err && err.message}`);
    });
  }

  it('shows the images when the gallery actually has some', async () => {
    // Not crashing is not the same as working: before this fix the only value
    // that rendered was "", which renders nothing. Assert the urls are on screen.
    const { container, err } = await render({
      ...CONTEST,
      gallery: '["https://cdn/1.png","https://cdn/2.png"]',
    });
    assert.equal(err, null);

    const srcs = [...container.querySelectorAll('img')].map((i) => i.getAttribute('src'));
    assert.ok(srcs.includes('https://cdn/1.png'), `expected the first image, got ${srcs}`);
    assert.ok(srcs.includes('https://cdn/2.png'), `expected the second image, got ${srcs}`);
  });
});

describe('edit contest page - opening it must not change the contest', () => {
  it('leaves the slug alone when nobody has touched the title', async () => {
    // The auto-slug effect used to fire on load, so merely opening this page
    // and saving renamed the contest: the-librarians-2026 became
    // the-librarians-official-fan-art-contest in production.
    const { container, err } = await render(CONTEST);
    assert.equal(err, null);

    const inputs = [...container.querySelectorAll('input')];
    const slug = inputs.find((i) => i.id === 'slug');
    assert.ok(slug, `no slug field rendered; ids present: ${inputs.map((i) => i.id || '(none)')}`);
    assert.equal(slug.value, CONTEST.slug);
  });

  it('submits the contest unchanged, keeping the time on both dates', async () => {
    // Submitting without editing anything must be a no-op. It was not: dates
    // were truncated to YYYY-MM-DD, moving the 17:00 start to midnight and the
    // 03:59:59 submission deadline four hours earlier, on every single save.
    const { container, err } = await render(CONTEST);
    assert.equal(err, null);

    const form = container.querySelector('form');
    assert.ok(form, 'no form rendered');

    await act(async () => {
      form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
    });

    assert.ok(lastPayload, 'the page never called updateContest');
    assert.equal(lastPayload.start_date, CONTEST.start_date);
    assert.equal(lastPayload.submission_end_date, CONTEST.submission_end_date);
    assert.equal(lastPayload.slug, CONTEST.slug);
    assert.equal(lastPayload.title, CONTEST.title);
    assert.equal(lastPayload.status, CONTEST.status);
  });

  it('sends gallery as an array, never as the raw database string', async () => {
    // updateContest rejects a non-array with 400, and stringifies an array into
    // the text column. Sending the raw string round-trips the corruption.
    const { container, err } = await render({
      ...CONTEST,
      gallery: '["https://cdn/1.png"]',
    });
    assert.equal(err, null);

    await act(async () => {
      container
        .querySelector('form')
        .dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
    });

    assert.ok(Array.isArray(lastPayload.gallery), `gallery was ${typeof lastPayload.gallery}`);
    assert.deepEqual(lastPayload.gallery, ['https://cdn/1.png']);
  });
});
