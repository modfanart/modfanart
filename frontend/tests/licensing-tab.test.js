/**
 * The brand Licensing tab, rendered for real with effects flushed - the same
 * harness as public-results-page.test.js. What matters here is the control
 * flow around 'finalized': every other status change fires the mutation
 * immediately, but finalizing must go through an explicit confirmation,
 * because it is the action that makes the artwork publicly visible.
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

// act() only flushes effects in React's development build; pin before react
// loads (React reads NODE_ENV at module scope).
process.env.NODE_ENV = 'development';

const require = createRequire(import.meta.url);
const FRONTEND = path.resolve(import.meta.dirname, '..');

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react-dom/test-utils');
const { JSDOM } = require('jsdom');

// Deliberately out of rank order: the tab must sort by the brand's ranking,
// not by the API's submission order.
const ENTRIES = {
  entries: [
    {
      id: 'e2',
      status: 'winner',
      rank: 2,
      licensing_status: 'signed',
      artwork: { title: 'Second Piece', thumbnail_url: null, file_url: 'https://cdn/2.png' },
      creator: { username: 'artist_two' },
    },
    {
      id: 'e1',
      status: 'winner',
      rank: 1,
      licensing_status: 'not_started',
      artwork: { title: 'First Piece', thumbnail_url: 'https://cdn/1-thumb.png', file_url: 'https://cdn/1.png' },
      creator: { username: 'artist_one' },
    },
  ],
  total: 2,
};

let LicensingTabContent;
let dom;
let restoreLoad;

// Mutable per-test wiring.
let entriesResponse;
let mutationCalls = [];

function transpile(srcPath, outName) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'licensing-tab-'));
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
    if (request === 'next/image') {
      return {
        __esModule: true,
        default: ({ src, alt }) => React.createElement('img', { src, alt }),
      };
    }
    if (request === '@/services/api/contestsApi') {
      return {
        useGetContestEntriesQuery: () => ({
          data: entriesResponse,
          isLoading: false,
          error: undefined,
        }),
        useUpdateEntryLicensingStatusMutation: () => [
          (arg) => {
            mutationCalls.push(arg);
            return { unwrap: async () => ({ entry: {} }) };
          },
          { isLoading: false },
        ],
      };
    }
    if (request === '@/components/ui/select') {
      // A real <select>/<option> tree so tests can change the value. Trigger
      // and Value render nothing; Content passes its options through.
      return {
        __esModule: true,
        Select: ({ value, onValueChange, disabled, children }) =>
          React.createElement(
            'select',
            { value, disabled, onChange: (e) => onValueChange && onValueChange(e.target.value) },
            children
          ),
        SelectTrigger: () => null,
        SelectValue: () => null,
        SelectContent: ({ children }) => children,
        SelectItem: ({ value, children }) => React.createElement('option', { value }, children),
      };
    }
    if (request === '@/components/ui/alert-dialog') {
      // Renders only when open, with real buttons so tests can click them.
      return {
        __esModule: true,
        AlertDialog: ({ open, children }) =>
          open ? React.createElement('div', { role: 'alertdialog' }, children) : null,
        AlertDialogContent: passthrough,
        AlertDialogHeader: passthrough,
        AlertDialogTitle: passthrough,
        AlertDialogDescription: passthrough,
        AlertDialogFooter: passthrough,
        AlertDialogAction: ({ children, onClick }) =>
          React.createElement('button', { onClick, 'data-action': 'confirm' }, children),
        AlertDialogCancel: ({ children, onClick }) =>
          React.createElement('button', { onClick, 'data-action': 'cancel' }, children),
      };
    }
    if (request === 'lucide-react') return iconProxy;
    if (typeof request === 'string' && request.startsWith('@/')) return uiProxy;
    return realLoad.apply(this, arguments);
  };

  LicensingTabContent = require(
    transpile(
      path.join(FRONTEND, 'components/opportunities/licensing-tab-content.tsx'),
      'LicensingTab'
    )
  ).LicensingTabContent;
});

after(() => { if (restoreLoad) restoreLoad(); });

beforeEach(() => {
  entriesResponse = ENTRIES;
  mutationCalls = [];
});

async function render(element) {
  const container = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(container);
  await act(async () => {
    createRoot(container).render(element);
  });
  return container;
}

async function changeSelect(select, value) {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(
      dom.window.HTMLSelectElement.prototype,
      'value'
    ).set;
    setter.call(select, value);
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  });
}

describe('LicensingTabContent', () => {
  it('lists the winners sorted by rank with their licensing status', async () => {
    const container = await render(
      React.createElement(LicensingTabContent, { contestId: 'contest-1' })
    );

    const text = container.textContent;
    assert.ok(text.includes('First Piece'));
    assert.ok(text.includes('Second Piece'));
    assert.ok(text.includes('@artist_one'));
    assert.ok(text.includes('@artist_two'));
    // rank 1 renders before rank 2 despite the API returning them reversed
    assert.ok(
      text.indexOf('First Piece') < text.indexOf('Second Piece'),
      'winners must be sorted by rank'
    );
    // current statuses shown as badges
    assert.ok(text.includes('Not started'));
    assert.ok(text.includes('Signed'));

    const selects = container.querySelectorAll('select');
    assert.equal(selects.length, 2);
    assert.equal(selects[0].value, 'not_started');
    assert.equal(selects[1].value, 'signed');
  });

  it('fires the mutation immediately for a non-finalized status change', async () => {
    const container = await render(
      React.createElement(LicensingTabContent, { contestId: 'contest-1' })
    );

    const firstSelect = container.querySelectorAll('select')[0]; // rank 1 = e1
    await changeSelect(firstSelect, 'agreement_sent');

    assert.deepEqual(mutationCalls, [
      { contestId: 'contest-1', entryId: 'e1', licensing_status: 'agreement_sent' },
    ]);
    assert.equal(dom.window.document.querySelector('[role="alertdialog"]'), null);
  });

  it('requires confirmation before finalizing, then fires the mutation', async () => {
    const container = await render(
      React.createElement(LicensingTabContent, { contestId: 'contest-1' })
    );

    const firstSelect = container.querySelectorAll('select')[0]; // rank 1 = e1
    await changeSelect(firstSelect, 'finalized');

    // Dialog is up, nothing has been sent yet.
    const dialog = container.querySelector('[role="alertdialog"]');
    assert.ok(dialog, 'finalize must open the confirmation dialog');
    assert.ok(dialog.textContent.includes('First Piece'));
    assert.deepEqual(mutationCalls, []);

    await act(async () => {
      dialog.querySelector('[data-action="confirm"]').click();
    });

    assert.deepEqual(mutationCalls, [
      { contestId: 'contest-1', entryId: 'e1', licensing_status: 'finalized' },
    ]);
    assert.equal(container.querySelector('[role="alertdialog"]'), null);
  });

  it('cancelling the confirmation sends nothing', async () => {
    const container = await render(
      React.createElement(LicensingTabContent, { contestId: 'contest-1' })
    );

    const firstSelect = container.querySelectorAll('select')[0];
    await changeSelect(firstSelect, 'finalized');

    const dialog = container.querySelector('[role="alertdialog"]');
    assert.ok(dialog);
    await act(async () => {
      dialog.querySelector('[data-action="cancel"]').click();
    });

    assert.deepEqual(mutationCalls, []);
  });

  it('points the brand at the Results tab when no winners are selected', async () => {
    entriesResponse = { entries: [], total: 0 };
    const container = await render(
      React.createElement(LicensingTabContent, { contestId: 'contest-1' })
    );

    assert.ok(container.textContent.includes('No winners selected yet'));
    assert.equal(container.querySelectorAll('select').length, 0);
  });
});
