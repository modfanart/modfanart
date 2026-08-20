/**
 * The two navigation surfaces that link into the judge area, rendered for
 * real: the site-header account dropdown (user-nav) and the dashboard
 * sidebar. Both run the real useJudgeAreaHref hook and the real
 * lib/judging/judge-access.js rules; only the auth context and the two RTK
 * judge queries are stubbed.
 *
 * The production incident this pins down: two Librarians judges signed up
 * with the fan role, scored entries via the invite-link redirect, and then
 * had no way to navigate back - the dropdown showed them no entry at all,
 * and the sidebar (which does handle fan-role judges) only renders on
 * dashboard pages they could no longer reach.
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

import * as judgeAccess from '../lib/judging/judge-access.js';

// act() flushes work only in React's development build; the production build
// skips it silently. Pin before react is loaded (React reads NODE_ENV at
// module scope).
process.env.NODE_ENV = 'development';

const require = createRequire(import.meta.url);
const FRONTEND = path.resolve(import.meta.dirname, '..');

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react-dom/test-utils');
const { JSDOM } = require('jsdom');

// Scenario knobs the stubs read on every render.
let currentUser = null;
let currentAccepted; // response of GET /contest/judge/contests
let currentPending; // response of GET /contest/judge/invitations
let pushedPaths = [];

let UserNav;
let Sidebar;
let dom;
let restoreLoad;

before(() => {
  // 1. Transpile the real components, the real hook, and the sidebar's real
  //    config/basePath modules with the project's own tsc. Resolution is off,
  //    so unresolved "@/..." specifiers error while valid JS is still emitted.
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'judging-nav-'));
  const SOURCES = [
    'components/users/user-nav.tsx',
    'components/layouts/sidebar.tsx',
    'hooks/use-judge-area-href.ts',
    'hooks/getBasePath.ts',
    'hooks/sidebar.config.ts',
  ];
  const tmpFiles = SOURCES.map((rel) => {
    const dest = path.join(outDir, path.basename(rel));
    fs.copyFileSync(path.join(FRONTEND, rel), dest);
    return dest;
  });
  try {
    execFileSync(
      path.join(FRONTEND, 'node_modules/.bin/tsc'),
      [...tmpFiles, '--jsx', 'react-jsx', '--noResolve', '--skipLibCheck',
        '--target', 'es2020', '--module', 'commonjs', '--outDir', outDir],
      { stdio: 'pipe' }
    );
  } catch (err) {
    if (!fs.existsSync(path.join(outDir, 'user-nav.js'))) {
      throw new Error('tsc emitted nothing:\n' + String(err.stdout).slice(0, 4000));
    }
  }

  // 2. A DOM so createRoot + click dispatch work.
  dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.IS_REACT_ACT_ENVIRONMENT = true;

  // 3. Stub only the boundaries. Resolve react BEFORE installing the hook -
  //    calling require() inside it re-enters and blows the stack.
  const PRELOADED = {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'react/jsx-dev-runtime': require('react/jsx-dev-runtime'),
  };

  // Keep onClick so menu items stay clickable; everything else is layout.
  const passthrough = ({ children, onClick }) =>
    React.createElement(onClick ? 'button' : 'div', { onClick }, children);
  const uiProxy = new Proxy({}, {
    get: (_t, n) => (n === '__esModule' ? true : passthrough),
  });
  const iconProxy = new Proxy({}, { get: (_t, n) => (n === '__esModule' ? true : () => null) });

  const local = (name) => require(path.join(outDir, name));

  const realLoad = Module._load;
  restoreLoad = () => { Module._load = realLoad; };
  Module._load = function (request) {
    if (PRELOADED[request]) return PRELOADED[request];
    if (request === 'next/navigation') {
      return {
        useRouter: () => ({
          push: (p) => pushedPaths.push(p),
          back() {},
          replace() {},
        }),
        usePathname: () => '/',
      };
    }
    if (request === 'next/link') {
      return {
        __esModule: true,
        default: ({ children, href, onClick }) =>
          React.createElement('a', { href, onClick }, children),
      };
    }
    if (request === 'lucide-react') return iconProxy;
    if (request === '@/store/AuthContext') {
      return {
        useAuth: () => ({ user: currentUser, loading: false, logout: async () => {} }),
      };
    }
    if (request === '@/services/api/contestsApi') {
      return {
        useGetJudgeContestsQuery: () => ({ data: currentAccepted }),
        useGetJudgeInvitationsQuery: () => ({ data: currentPending }),
      };
    }
    // The real modules under test, resolved to their transpiled copies.
    if (request === '@/lib/judging/judge-access') return judgeAccess;
    if (request === '@/hooks/use-judge-area-href') return local('use-judge-area-href.js');
    if (request === '@/hooks/getBasePath') return local('getBasePath.js');
    if (request === '@/hooks/sidebar.config') return local('sidebar.config.js');
    if (request === '@/lib/utils') {
      return { cn: (...a) => a.filter(Boolean).join(' ') };
    }
    if (typeof request === 'string' && request.startsWith('@/')) return uiProxy;
    return realLoad.apply(this, arguments);
  };

  UserNav = local('user-nav.js').UserNav;
  Sidebar = local('sidebar.js').default;
});

after(() => { if (restoreLoad) restoreLoad(); });

/** Render a component into a fresh container for the current scenario. */
async function render(Component) {
  pushedPaths = [];
  const container = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(container);
  await act(async () => {
    createRoot(container).render(React.createElement(Component));
  });
  return container;
}

function setScenario({ user, accepted = [], pending = [] }) {
  currentUser = user;
  currentAccepted = accepted === undefined ? undefined : { contests: accepted };
  currentPending = pending === undefined ? undefined : { contests: pending };
}

const FAN_JUDGE = {
  id: 'u1',
  username: 'librarian1',
  email: 'librarian1@example.com',
  avatar_url: null,
  role: { name: 'fan' },
};

const CONTEST = { id: 'contest-1' };

describe('account dropdown (user-nav) - the fix', () => {
  it('shows Judging to a fan-role judge and routes to their judge area', async () => {
    setScenario({ user: FAN_JUDGE, accepted: [CONTEST] });
    const container = await render(UserNav);

    const judging = [...container.querySelectorAll('button')]
      .find((b) => b.textContent === 'Judging');
    assert.ok(judging, 'no Judging item rendered for a fan with a judge assignment');

    await act(async () => {
      judging.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });
    assert.deepEqual(pushedPaths, ['/judge/librarian1']);
  });

  it('shows Judging on a pending invitation alone', async () => {
    setScenario({ user: FAN_JUDGE, accepted: [], pending: [CONTEST] });
    const container = await render(UserNav);

    assert.ok(
      [...container.querySelectorAll('button')].some((b) => b.textContent === 'Judging'),
      'a judge who has not clicked Accept yet must still get the link'
    );
  });

  it('shows nothing extra to a fan who judges nothing', async () => {
    setScenario({ user: FAN_JUDGE });
    const container = await render(UserNav);

    assert.ok(!container.textContent.includes('Judging'));
    // Fans still have no general dashboard; this fix must not invent one.
    assert.ok(!container.textContent.includes('Dashboard'));
  });

  it('shows both Dashboard and Judging to an artist who judges', async () => {
    setScenario({
      user: { ...FAN_JUDGE, username: 'painter', role: { name: 'artist' } },
      accepted: [CONTEST],
    });
    const container = await render(UserNav);

    assert.ok(container.textContent.includes('Dashboard'));
    assert.ok(container.textContent.includes('Judging'));
  });

  it('does not duplicate the entry for the judge role', async () => {
    // A judge-role account's Dashboard already points at the judge area.
    setScenario({
      user: { ...FAN_JUDGE, username: 'pro-judge', role: { name: 'judge' } },
      accepted: [CONTEST],
    });
    const container = await render(UserNav);

    assert.ok(container.textContent.includes('Dashboard'));
    assert.ok(!container.textContent.includes('Judging'));
  });
});

describe('dashboard sidebar - unchanged behavior through the shared hook', () => {
  it('still links a fan-role judge into the judge area', async () => {
    setScenario({ user: FAN_JUDGE, accepted: [CONTEST] });
    const container = await render(Sidebar);

    const link = [...container.querySelectorAll('a')]
      .find((a) => a.textContent.includes('Judging'));
    assert.ok(link, 'sidebar lost the Judging link for a fan-role judge');
    assert.equal(link.getAttribute('href'), '/judge/librarian1');
    assert.ok(!container.textContent.includes('Missing profile identifier'));
  });

  it('still shows the missing-profile notice for a fan who judges nothing', async () => {
    setScenario({ user: FAN_JUDGE });
    const container = await render(Sidebar);

    assert.ok(container.textContent.includes('Missing profile identifier'));
  });

  it('still appends Judging to a real role navigation (artist)', async () => {
    setScenario({
      user: { ...FAN_JUDGE, username: 'painter', role: { name: 'artist' } },
      accepted: [CONTEST],
    });
    const container = await render(Sidebar);

    assert.ok(container.textContent.includes('My Artworks'), 'artist nav missing');
    const link = [...container.querySelectorAll('a')]
      .find((a) => a.textContent.includes('Judging'));
    assert.equal(link?.getAttribute('href'), '/judge/painter');
  });
});
