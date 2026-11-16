'use client';

// Drop-in replacement for useParams() inside dashboard pages.
//
// Dashboard URLs used to carry the user's identity: /artist/<username>/...,
// /seller/<username>/..., /judge/<username>/..., /brand-manager/<brand>/...
// Those segments are gone (everything lives under /dashboard). Pages that
// still read artistId / sellerId / judgeId / slug get them from the session
// instead, so their logic is unchanged. Real dynamic segments (id,
// productId, contestId, entryId) still come from the URL.

import { useParams } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { useActiveBrand } from './use-active-brand';

export const DASHBOARD = '/dashboard';

export function useDashboardParams<T extends Record<string, string> = Record<string, string>>() {
  const params = (useParams() ?? {}) as Record<string, string | string[]>;
  const { user } = useAuth();
  const { brand } = useActiveBrand();
  const username = user?.username?.trim().toLowerCase() ?? '';

  return {
    ...params,
    artistId: username,
    sellerId: username,
    judgeId: username,
    slug: brand?.slug ?? '',
  } as unknown as T & {
    artistId: string;
    sellerId: string;
    judgeId: string;
    slug: string;
  };
}
