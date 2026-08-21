/**
 * The dialog shown once after "Create & Assign Judge" succeeds on the brand
 * Monitor page, rendered for real.
 *
 * The regression this guards: the temporary password and invite link used to
 * be shown with window.alert(). Alert text cannot be selected in any browser,
 * so the brand could not copy the password, and since it is generated in the
 * browser and never stored, dismissing the alert lost it for good. Every value
 * must now be real DOM text with a working Copy button.
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
const SRC = path.join(FRONTEND, 'components/opportunities/judge-credentials-dialog.tsx');
const HOST = path.join(FRONTEND, 'components/opportunities/manage-opportunity-content.tsx');

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react-dom/test-utils');
const { JSDOM } = require('jsdom');

const CREDENTIALS = {
  username: 'jane_judge',
  email: 'jane@example.com',
  password: 'Judge@k3x9q2m1z!',
  inviteUrl: 'https://modfanart.com/judge/invite/0123456789abcdef',
  emailSent: true,
};

let JudgeCredentialsDialog;
let dom;
let restoreLoad;
let clipboardWrites = [];
let clipboardShouldFail = false;
let mounted = [];

before(() => {
  // 1. Transpile the component with the project's own tsc. Resolution is off,
  //    so the "@/..." specifiers are reported as errors while valid JS is still
  //    emitted - hence the try/catch around a non-zero exit.
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'judge-credentials-'));
  const tmpTsx = path.join(outDir, 'JudgeCredentialsDialog.tsx');
  fs.copyFileSync(SRC, tmpTsx);
  try {
    execFileSync(
      path.join(FRONTEND, 'node_modules/.bin/tsc'),
      [
        tmpTsx,
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
    if (!fs.existsSync(path.join(outDir, 'JudgeCredentialsDialog.js'))) {
      throw new Error('tsc emitted nothing:\n' + String(err.stdout).slice(0, 4000));
    }
  }

  // 2. A DOM with a controllable clipboard. jsdom has no navigator.clipboard,
  //    which is also exactly what a plain-http page sees, so the "unavailable"
  //    path is the default and the happy path installs a recorder.
  dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://localhost/' });
  Object.defineProperty(dom.window.navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async (text) => {
        if (clipboardShouldFail) {
          throw new dom.window.DOMException('Write permission denied.', 'NotAllowedError');
        }
        clipboardWrites.push(text);
      },
    },
  });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.IS_REACT_ACT_ENVIRONMENT = true;

  // 3. Stub everything that is not React. The UI primitives become plain
  //    elements that keep the props the assertions depend on: Dialog honours
  //    `open`, Button is a real <button> so clicks reach onClick.
  const PRELOADED = {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'react/jsx-dev-runtime': require('react/jsx-dev-runtime'),
  };
  const div = ({ children }) => React.createElement('div', null, children);
  const dialogStub = {
    __esModule: true,
    Dialog: ({ open, children }) => (open ? React.createElement('div', null, children) : null),
    DialogContent: div,
    DialogHeader: div,
    DialogFooter: div,
    DialogTitle: ({ children }) => React.createElement('h2', null, children),
    DialogDescription: ({ children }) => React.createElement('p', null, children),
  };
  const buttonStub = {
    __esModule: true,
    Button: ({ children, onClick, type, 'aria-label': ariaLabel }) =>
      React.createElement('button', { type, onClick, 'aria-label': ariaLabel }, children),
  };
  const iconProxy = new Proxy({}, { get: (_t, n) => (n === '__esModule' ? true : () => null) });

  const realLoad = Module._load;
  restoreLoad = () => {
    Module._load = realLoad;
  };
  Module._load = function (request) {
    if (PRELOADED[request]) return PRELOADED[request];
    if (request === '@/components/ui/dialog') return dialogStub;
    if (request === '@/components/ui/button') return buttonStub;
    if (request === 'lucide-react') return iconProxy;
    return realLoad.apply(this, arguments);
  };

  ({ JudgeCredentialsDialog } = require(path.join(outDir, 'JudgeCredentialsDialog.js')));
});

/** Unmount everything, which also clears any pending "Copied" reset timer. */
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
  clipboardWrites = [];
  clipboardShouldFail = false;
  await unmountAll();
});

/** Mount the dialog and hand back the container plus a click helper. */
async function render(credentials, onClose = () => {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await act(async () => {
    root.render(React.createElement(JudgeCredentialsDialog, { credentials, onClose }));
  });
  const click = (el) =>
    act(async () => {
      el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });
  return { container, click };
}

const copyButton = (container, label) => container.querySelector(`button[aria-label="${label}"]`);
const buttonByText = (container, text) =>
  [...container.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

describe('JudgeCredentialsDialog', () => {
  it('renders the password and invite link as selectable DOM text', async () => {
    const { container } = await render(CREDENTIALS);

    // <code> blocks, not an alert string: these are what the brand selects.
    const values = [...container.querySelectorAll('code')].map((c) => c.textContent);
    assert.deepEqual(values, [CREDENTIALS.password, CREDENTIALS.inviteUrl]);
    assert.ok(container.textContent.includes('Judge "jane_judge" created'));
  });

  it('copies exactly the password when its Copy button is clicked', async () => {
    const { container, click } = await render(CREDENTIALS);
    const button = copyButton(container, 'Copy temporary password');
    assert.ok(button, 'password Copy button is rendered');

    await click(button);

    assert.deepEqual(clipboardWrites, [CREDENTIALS.password]);
    assert.equal(button.textContent.trim(), 'Copied');
  });

  it('copies exactly the invite link when its Copy button is clicked', async () => {
    const { container, click } = await render(CREDENTIALS);

    await click(copyButton(container, 'Copy invite link'));

    assert.deepEqual(clipboardWrites, [CREDENTIALS.inviteUrl]);
    // The other field's button is untouched: feedback is per field.
    assert.equal(copyButton(container, 'Copy temporary password').textContent.trim(), 'Copy');
  });

  it('says the invite email was sent when it was', async () => {
    const { container } = await render({ ...CREDENTIALS, emailSent: true });

    assert.ok(container.textContent.includes('has been sent to jane@example.com'));
    assert.ok(!container.textContent.includes('could not be sent'));
  });

  it('tells the brand to share the link manually when the email failed', async () => {
    const { container } = await render({ ...CREDENTIALS, emailSent: false });

    assert.ok(container.textContent.includes('could not be sent'));
    assert.ok(!container.textContent.includes('has been sent to'));
  });

  it('shows a select-the-text hint instead of throwing when the clipboard refuses', async () => {
    clipboardShouldFail = true;
    // The component logs the failure with context; keep it out of the runner's
    // output without hiding it from the assertion.
    const realError = console.error;
    const logged = [];
    console.error = (...args) => logged.push(args);
    try {
      const { container, click } = await render(CREDENTIALS);
      const button = copyButton(container, 'Copy temporary password');

      await click(button);

      assert.deepEqual(clipboardWrites, []);
      assert.equal(button.textContent.trim(), 'Copy');
      assert.ok(container.textContent.includes('Select the text above to copy it.'));
      // The password is still there to select by hand.
      assert.ok(container.querySelector('code').textContent === CREDENTIALS.password);
      assert.equal(logged.length, 1);
    } finally {
      console.error = realError;
    }
  });

  it('calls onClose from the Done button', async () => {
    let closed = 0;
    const { container, click } = await render(CREDENTIALS, () => {
      closed += 1;
    });

    await click(buttonByText(container, 'Done'));

    assert.equal(closed, 1);
  });

  it('renders nothing when there are no credentials to show', async () => {
    const { container } = await render(null);

    assert.equal(container.textContent, '');
  });
});

describe('manage-opportunity-content integration point', () => {
  const source = fs.readFileSync(HOST, 'utf8');

  /** The argument text of every `alert(` call in the source. */
  function alertArguments(text) {
    const args = [];
    let from = text.indexOf('alert(');
    while (from !== -1) {
      let depth = 0;
      let i = from + 'alert'.length;
      for (; i < text.length; i += 1) {
        if (text[i] === '(') depth += 1;
        if (text[i] === ')') depth -= 1;
        if (depth === 0) break;
      }
      args.push(text.slice(from + 'alert('.length, i));
      from = text.indexOf('alert(', i);
    }
    return args;
  }

  it('no longer hands the temporary password to alert()', () => {
    // Rendering the 1000-line page with its RTK Query hooks would prove the
    // same thing at far greater cost.
    const args = alertArguments(source);
    assert.ok(args.length > 0, 'sanity: the page still uses alert() elsewhere');
    for (const arg of args) {
      assert.ok(!arg.includes('tempPassword'), `alert() still receives the password:\n${arg}`);
    }
  });

  it('hands the password to JudgeCredentialsDialog instead', () => {
    assert.ok(source.includes("from './judge-credentials-dialog'"));
    assert.ok(/setJudgeCredentials\(\{[\s\S]*password: tempPassword/.test(source));
    assert.ok(source.includes('<JudgeCredentialsDialog'));
  });
});
