import authReducer, {
  setCredentials,
  logout,
  setInitialized,
} from '@/services/api/features/authSlice';

const initial = authReducer(undefined, { type: '@@INIT' });

describe('authSlice', () => {
  it('starts uninitialized with no session', () => {
    expect(initial).toEqual({ accessToken: null, user: null, initialized: false });
  });

  it('setInitialized flips initialized without touching the session', () => {
    const next = authReducer(initial, setInitialized());
    expect(next.initialized).toBe(true);
    expect(next.accessToken).toBeNull();
    expect(next.user).toBeNull();
  });

  it('setInitialized is idempotent', () => {
    const once = authReducer(initial, setInitialized());
    const twice = authReducer(once, setInitialized());
    expect(twice.initialized).toBe(true);
  });

  it('setCredentials stores token + user and leaves initialized alone', () => {
    // Regression: rehydrating a session must not reset the readiness flag,
    // otherwise guards would flicker back to "loading" mid-session.
    const ready = authReducer(initial, setInitialized());
    const user = { id: 'u1' } as never;
    const next = authReducer(ready, setCredentials({ accessToken: 'tok', user }));
    expect(next.accessToken).toBe('tok');
    expect(next.user).toBe(user);
    expect(next.initialized).toBe(true);
  });

  it('logout clears the session but stays initialized', () => {
    // "No user" is still a resolved answer from Firebase — guards must be able
    // to act on it, so initialized must remain true after logout.
    const loggedIn = authReducer(
      authReducer(initial, setInitialized()),
      setCredentials({ accessToken: 'tok', user: { id: 'u1' } as never }),
    );
    const next = authReducer(loggedIn, logout());
    expect(next.accessToken).toBeNull();
    expect(next.user).toBeNull();
    expect(next.initialized).toBe(true);
  });
});
