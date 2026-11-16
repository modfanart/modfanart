// src/services/baseQuery.js
//
// One fetch layer for every RTK Query slice in the workspace.
//
// Before: ~20 slices each built their own fetchBaseQuery that read a Firebase
// ID token out of localStorage. ID tokens expire after an hour and nothing
// refreshed them (only authApi had retry logic), so after an hour every
// screen failed with 401s until the user logged out and in again.
//
// Now: the token comes from the live Firebase session (refreshed
// automatically), a 401 triggers one forced refresh + retry, and a second
// failure signs the user out with a "session expired" message.

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { firebaseAuth } from '../lib/firebase';
import { API_BASE_URL } from '.';

export async function currentToken(forceRefresh = false) {
  const authType = localStorage.getItem('authType');
  const fbUser = firebaseAuth.currentUser;
  if (fbUser && authType !== 'workspace') {
    try {
      const token = await fbUser.getIdToken(forceRefresh);
      localStorage.setItem('accessToken', token);
      return token;
    } catch {
      /* fall through to stored token */
    }
  }
  return localStorage.getItem('accessToken');
}

async function refreshWorkspaceToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/workspace/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.accessToken) return null;
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

function expireSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('authType');
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login?expired=1');
  }
}

/**
 * @param {string} [path]  appended to API_BASE_URL, e.g. '/roles'
 * @param {object} [options] extra fetchBaseQuery options (e.g. credentials)
 */
export function createBaseQuery(path = '', options = {}) {
  const raw = fetchBaseQuery({
    baseUrl: `${API_BASE_URL}${path}`,
    ...options,
    prepareHeaders: async (headers, apiCtx) => {
      // Respect an explicit Authorization header (e.g. auth/sync sends the
      // brand-new ID token of the account that is signing in).
      if (!headers.has('Authorization')) {
        const token = await currentToken(false);
        if (token) headers.set('Authorization', `Bearer ${token}`);
      }
      // Lets the API tag activity-log entries as coming from the workspace.
      headers.set('X-Client', 'workspace');
      return options.prepareHeaders ? options.prepareHeaders(headers, apiCtx) : headers;
    },
  });

  return async (args, api, extraOptions) => {
    let result = await raw(args, api, extraOptions);
    if (result.error?.status !== 401) return result;

    const token =
      localStorage.getItem('authType') === 'workspace'
        ? await refreshWorkspaceToken()
        : await currentToken(true);

    if (token) {
      result = await raw(args, api, extraOptions);
      if (result.error?.status !== 401) return result;
    }
    expireSession();
    return result;
  };
}
