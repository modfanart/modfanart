/**
 * The brand's "Create & Assign Judge" journey on the Monitor page, driven
 * through the real ManageOpportunityContent component.
 *
 * judge-credentials-dialog.test.js proves the dialog itself works. This file
 * proves the page actually reaches it: the API hooks are stubbed, everything
 * else is the real component, and the assertions follow the brand's clicks
 * from "Assign Judge" to a copied password. The regression it guards is the
 * password and invite link going to window.alert(), where nothing could be
 * selected or copied.
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

// act() only flushes effects in React's development build. Pin it before
// react loads, since React reads NODE_ENV at module scope.
process.env.NODE_ENV = 'development';

const require = createRequire(import.meta.url);
const FRONTEND = path.resolve(import.meta.dirname, '..');
const COMPONENTS = path.join(FRONTEND, 'components/opportunities');
// The page and the two modules it imports by relative path, compiled together
// so those relative requires resolve inside the output directory.
const SOURCES = [
  'manage-opportunity-content.tsx',
  'submission-pagination.ts',
  'judge-credentials-dialog.tsx',
];

const { JSDOM } = require('jsdom');

// react-dom decides at load time whether a DOM exists and whether the `input`
// event is supported. The globals must be in place before it loads, or typing
// into a controlled input never reaches onChange: React falls back to a
// focus/keyboard polyfill that synthetic events do not satisfy.
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://localhost/' });
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.IS_REACT_ACT_ENVIRONMENT = true;

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react-dom/test-utils');

const CONTEST = {
  id: 'contest-1',
  title: 'Fan Art Contest',
  description: 'Draw something.',
  status: 'live',
  submission_end_date: '2026-09-01T00:00:00.000Z',
  max_entries_per_user: 3,
};
const CREATED_USER_ID = 'judge-1';
const INVITE_URL = 'https://modfanart.com/judge/invite/0123456789abcdef';
const PASSWORD_SHAPE = /^Judge@[a-z0-9]{9}!$/;

let ManageOpportunityContent;
let restoreLoad;
let mounted = [];
let calls;
let inviteEmailSent = true;
let clipboardWrites = [];

/** Fresh call recorders for every test. */
function resetCalls() {
  calls = { createUser: [], assignJudge: [], generateInviteLink: [], alert: [] };
}

function mutation(record, result) {
  return () => [
    (payload) => {
      record.push(payload);
      return { unwrap: async () => result() };
    },
    { isLoading: false },
  ];
}

function buildApiStubs() {
  const query = (data) => () => ({ data, isLoading: false, isFetching: false, isError: false });
  const noopMutation = mutation([], () => ({}));
  return {
    '@/services/api/contestsApi': {
      __esModule: true,
      useGetContestQuery: query(CONTEST),
      useGetContestEntriesQuery: query({ entries: [], total: 0 }),
      useGetContestJudgesQuery: query([]),
      useDeleteContestMutation: noopMutation,
      useUpdateEntryStatusMutation: noopMutation,
      useDeleteContestEntryMutation: noopMutation,
      useRemoveJudgeMutation: noopMutation,
      useAssignJudgeMutation: mutation({ push: (p) => calls.assignJudge.push(p) }, () => ({
        success: true,
      })),
      useGenerateJudgeInviteLinkMutation: mutation(
        { push: (p) => calls.generateInviteLink.push(p) },
        () => ({ success: true, invite_url: INVITE_URL, email_sent: inviteEmailSent })
      ),
    },
    '@/services/api/userApi': {
      __esModule: true,
      useGetAllUsersQuery: query({ users: [] }),
      useCreateUserMutation: mutation({ push: (p) => calls.createUser.push(p) }, () => ({
        message: 'ok',
        user: { id: CREATED_USER_ID },
      })),
    },
  };
}

function buildUiStubs() {
  const div = ({ children }) => React.createElement('div', null, children);
  const passthrough = new Proxy({}, { get: (_t, n) => (n === '__esModule' ? true : div) });
  return {
    '@/components/ui/dialog': {
      __esModule: true,
      Dialog: ({ open, children }) => (open ? React.createElement('div', null, children) : null),
      DialogContent: div,
      DialogHeader: div,
      DialogFooter: div,
      DialogTitle: ({ children }) => React.createElement('h2', null, children),
      DialogDescription: ({ children }) => React.createElement('p', null, children),
    },
    '@/components/ui/button': {
      __esModule: true,
      Button: ({ children, onClick, disabled, type, 'aria-label': ariaLabel }) =>
        React.createElement(
          'button',
          { type, onClick, disabled, 'aria-label': ariaLabel },
          children
        ),
    },
    '@/components/ui/input': {
      __esModule: true,
      Input: ({ value, onChange, placeholder, type }) =>
        React.createElement('input', { value, onChange, placeholder, type }),
    },
    '@/lib/utils': { __esModule: true, cn: (...parts) => parts.filter(Boolean).join(' ') },
    passthrough,
  };
}

before(() => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'create-judge-journey-'));
  for (const name of SOURCES) fs.copyFileSync(path.join(COMPONENTS, name), path.join(outDir, name));
  try {
    execFileSync(
      path.join(FRONTEND, 'node_modules/.bin/tsc'),
      [
        ...SOURCES.map((name) => path.join(outDir, name)),
        '--jsx',
        'react-jsx',
        '--noResolve',
        '--skipLibCheck',
        '--target',
        'es2020',
        '--module',
        'commonjs',
        '--outDir',
        outDir,
      ],
      { stdio: 'pipe' }
    );
  } catch (err) {
    if (!fs.existsSync(path.join(outDir, 'manage-opportunity-content.js'))) {
      throw new Error('tsc emitted nothing:\n' + String(err.stdout).slice(0, 4000));
    }
  }

  Object.defineProperty(dom.window.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (text) => void clipboardWrites.push(text) },
  });
  // The page still uses alert() for errors. Record rather than throw, so a
  // stray call shows up as a failed assertion with the message it carried.
  global.alert = (message) => calls.alert.push(message);
  global.confirm = () => true;

  const PRELOADED = {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'react/jsx-dev-runtime': require('react/jsx-dev-runtime'),
  };
  const api = buildApiStubs();
  const ui = buildUiStubs();
  const iconProxy = new Proxy({}, { get: (_t, n) => (n === '__esModule' ? true : () => null) });

  const realLoad = Module._load;
  restoreLoad = () => {
    Module._load = realLoad;
  };
  Module._load = function (request) {
    if (PRELOADED[request]) return PRELOADED[request];
    if (api[request]) return api[request];
    if (ui[request]) return ui[request];
    if (request === 'lucide-react') return iconProxy;
    if (request === 'date-fns') return { formatDistanceToNow: () => 'moments' };
    if (request === 'next/navigation') {
      return { useRouter: () => ({ push() {}, back() {}, replace() {} }) };
    }
    if (request === 'next/link') {
      return {
        __esModule: true,
        default: ({ children, href }) => React.createElement('a', { href }, children),
      };
    }
    if (typeof request === 'string' && request.startsWith('@/')) return ui.passthrough;
    return realLoad.apply(this, arguments);
  };

  ({ ManageOpportunityContent } = require(path.join(outDir, 'manage-opportunity-content.js')));
});

/** Unmount everything, which also clears the page's debounce timers. */
async function unmountAll() {
  for (const root of mounted) await act(async () => root.unmount());
  mounted = [];
  document.body.innerHTML = '';
}

after(async () => {
  await unmountAll();
  if (restoreLoad) restoreLoad();
});

beforeEach(async () => {
  resetCalls();
  clipboardWrites = [];
  inviteEmailSent = true;
  await unmountAll();
});

/** Mount the Monitor page content and return DOM-driving helpers. */
async function renderPage() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => {
    root.render(
      React.createElement(ManageOpportunityContent, {
        opportunityId: CONTEST.id,
        brandSlug: 'acme',
      })
    );
  });

  const button = (text) =>
    [...container.querySelectorAll('button')].find((b) => b.textContent.trim() === text);
  const click = (el) =>
    act(async () => {
      el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });
  // React tracks the native value setter to detect changes, so type the way a
  // browser does: set the value through the prototype, then fire `input`.
  const valueSetter = Object.getOwnPropertyDescriptor(
    dom.window.HTMLInputElement.prototype,
    'value'
  ).set;
  const type = (placeholder, value) =>
    act(async () => {
      const input = container.querySelector(`input[placeholder="${placeholder}"]`);
      assert.ok(input, `input "${placeholder}" is on screen`);
      valueSetter.call(input, value);
      input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
  // The submit handler awaits three API calls in sequence; let them settle.
  const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

  return { container, button, click, type, settle };
}

/** Walk the brand's journey up to and including the submit click. */
async function createJudge(page, { username, email }) {
  await page.click(page.button('Assign Judge'));
  await page.click(page.button('Create New Judge'));
  await page.type('Username *', username);
  await page.type('Email Address *', email);
  const submit = page.button('Create & Assign Judge');
  assert.equal(submit.disabled, false, 'submit enables once username and email are filled');
  await page.click(submit);
  await page.settle();
}

const codeBlocks = (container) => [...container.querySelectorAll('code')].map((c) => c.textContent);

describe('Create & Assign Judge journey', () => {
  it('shows the password that was sent to the API in a copyable dialog, not an alert', async () => {
    const page = await renderPage();

    await createJudge(page, { username: 'jane_judge', email: 'jane@example.com' });

    // The API saw one creation with the generated password...
    assert.equal(calls.createUser.length, 1);
    const sent = calls.createUser[0];
    assert.equal(sent.username, 'jane_judge');
    assert.equal(sent.email, 'jane@example.com');
    assert.equal(sent.role, 'JUDGE');
    assert.match(sent.password, PASSWORD_SHAPE);
    // ...then the assignment and the invite for the account it returned.
    assert.deepEqual(calls.assignJudge, [{ contestId: CONTEST.id, userId: CREATED_USER_ID }]);
    assert.deepEqual(calls.generateInviteLink, [
      { contestId: CONTEST.id, judgeId: CREATED_USER_ID },
    ]);

    // The same password and the invite link are now DOM text, and nothing
    // went to alert().
    assert.deepEqual(codeBlocks(page.container), [sent.password, INVITE_URL]);
    assert.deepEqual(calls.alert, []);
    assert.ok(page.container.textContent.includes('Judge "jane_judge" created'));
    assert.ok(page.container.textContent.includes('has been sent to jane@example.com'));

    // Copy puts exactly that password on the clipboard.
    await page.click(page.container.querySelector('button[aria-label="Copy temporary password"]'));
    assert.deepEqual(clipboardWrites, [sent.password]);

    // Done dismisses it and the create form has been reset and closed.
    await page.click(page.button('Done'));
    assert.deepEqual(codeBlocks(page.container), []);
    assert.equal(page.container.querySelector('input[placeholder="Username *"]'), null);
  });

  it('still surfaces the link for manual sharing when the invite email failed', async () => {
    inviteEmailSent = false;
    const page = await renderPage();

    await createJudge(page, { username: 'sam_judge', email: 'sam@example.com' });

    assert.deepEqual(codeBlocks(page.container), [calls.createUser[0].password, INVITE_URL]);
    assert.ok(page.container.textContent.includes('could not be sent'));
    assert.deepEqual(calls.alert, []);

    await page.click(page.container.querySelector('button[aria-label="Copy invite link"]'));
    assert.deepEqual(clipboardWrites, [INVITE_URL]);
  });

  it('trims the username and email before creating and displaying the judge', async () => {
    const page = await renderPage();

    await createJudge(page, { username: '  padded_judge  ', email: '  padded@example.com  ' });

    assert.equal(calls.createUser[0].username, 'padded_judge');
    assert.equal(calls.createUser[0].email, 'padded@example.com');
    assert.ok(page.container.textContent.includes('Judge "padded_judge" created'));
    assert.ok(page.container.textContent.includes('sent to padded@example.com.'));
  });
});
