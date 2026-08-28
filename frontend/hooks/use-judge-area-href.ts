'use client';

import { useAuth } from '@/store/AuthContext';
import {
  useGetJudgeContestsQuery,
  useGetJudgeInvitationsQuery,
} from '@/services/api/contestsApi';
import { judgeAreaHref } from '@/lib/judging/judge-access';

/**
 * Href into the judge area for the signed-in user, or null when no link
 * should be shown. The decision rules live in lib/judging/judge-access.js;
 * this hook only feeds them the signed-in user and the judge endpoints'
 * responses.
 *
 * Both queries are void-arg, so every consumer shares one cached request pair
 * per session, and the JudgeContests tag invalidation on invite redemption
 * makes the link appear without a refresh.
 */
export function useJudgeAreaHref(): string | null {
  const { user } = useAuth();

  const { data: accepted } = useGetJudgeContestsQuery(undefined, { skip: !user });
  const { data: pending } = useGetJudgeInvitationsQuery(undefined, { skip: !user });

  return judgeAreaHref({
    username: user?.username,
    roleName: user?.role?.name,
    acceptedContests: accepted?.contests,
    pendingInvitations: pending?.contests,
  });
}
