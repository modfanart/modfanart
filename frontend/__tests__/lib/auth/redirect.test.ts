import {
  isSafeRelativePath,
  loginWithReturnTo,
  resolvePostLoginRedirect,
} from '@/lib/auth/redirect';

describe('isSafeRelativePath', () => {
  it.each([
    ['/submissions/new', true],
    ['/submissions/new?contest=lib-2026', true],
    ['/', true],
  ])('accepts same-origin relative path %s', (path, expected) => {
    expect(isSafeRelativePath(path)).toBe(expected);
  });

  it.each([
    ['//evil.com', 'protocol-relative'],
    ['https://evil.com', 'absolute http url'],
    ['http://evil.com', 'absolute http url'],
    ['/\\evil.com', 'backslash trick'],
    ['javascript:alert(1)', 'js scheme'],
    ['foo/bar', 'no leading slash'],
    ['', 'empty'],
    [null, 'null'],
    [undefined, 'undefined'],
  ])('rejects %s (%s)', (path) => {
    expect(isSafeRelativePath(path as string)).toBe(false);
  });
});

describe('loginWithReturnTo', () => {
  it('encodes a safe target into ?from=', () => {
    expect(loginWithReturnTo('/submissions/new?contest=lib-2026')).toBe(
      '/login?from=%2Fsubmissions%2Fnew%3Fcontest%3Dlib-2026',
    );
  });

  it('drops an unsafe target and returns a bare login path', () => {
    expect(loginWithReturnTo('//evil.com')).toBe('/login');
    expect(loginWithReturnTo('https://evil.com')).toBe('/login');
  });

  it('honours a custom login path', () => {
    expect(loginWithReturnTo('/x', '/auth/login')).toBe('/auth/login?from=%2Fx');
  });
});

describe('resolvePostLoginRedirect', () => {
  it('returns a safe from value unchanged', () => {
    expect(resolvePostLoginRedirect('/submissions/new')).toBe('/submissions/new');
  });

  it('falls back to home for unsafe or missing values', () => {
    expect(resolvePostLoginRedirect('//evil.com')).toBe('/');
    expect(resolvePostLoginRedirect(null)).toBe('/');
    expect(resolvePostLoginRedirect(undefined)).toBe('/');
  });

  it('supports a custom fallback', () => {
    expect(resolvePostLoginRedirect(null, '/dashboard')).toBe('/dashboard');
  });
});
