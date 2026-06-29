'use client';

import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Gavel, Trophy, Star, Calendar } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Badge } from '../../components/ui/badge';

import {
    useGetUserByIdQuery,
} from '../../services/api/userApi';

import {
    useGetJudgeContestsQuery,
    useGetMyJudgeScoresQuery,
} from '../../services/api/contestsApi';

export const JudgeDetailPage = () => {
    const { id } = useParams();

    // ---------------- USER ----------------
    const {
        data: judge,
        isLoading: loadingJudge,
    } = useGetUserByIdQuery(id);

    // ---------------- CONTESTS (where judge is assigned) ----------------
    const {
        data: contestsData,
        isLoading: loadingContests,
    } = useGetJudgeContestsQuery();
    const judgeContests = contestsData?.contests || []
    // ---------------- SCORES (judge voting activity) ----------------
    const {
        data: judgeScores = [],
        isLoading: loadingScores,
    } = useGetMyJudgeScoresQuery({
        contestId: undefined, // backend should return global if null/undefined
    });

    const initials = useMemo(() => {
        return judge?.username ? judge.username.slice(0, 2).toUpperCase() : '??';
    }, [judge]);

    const statusColor = (status) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'suspended':
                return 'destructive';
            case 'pending_verification':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    // ---------------- LOADING ----------------
    if (loadingJudge) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!judge) {
        return (
            <div className="h-screen flex items-center justify-center text-red-400">
                Judge not found
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header title={`@${judge.username}`} subtitle="Judge Profile Overview" />

            <div className="p-6 space-y-6">

                {/* ================= PROFILE CARD ================= */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex justify-between items-start">

                    <div className="flex items-center gap-4">
                        {judge.avatar_url ? (
                            <img
                                src={judge.avatar_url}
                                className="w-14 h-14 rounded-full ring-2 ring-zinc-700"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center font-semibold border border-zinc-700">
                                {initials}
                            </div>
                        )}

                        <div>
                            <p className="text-lg font-semibold">@{judge.username}</p>
                            <p className="text-sm text-zinc-500">{judge.email}</p>
                        </div>
                    </div>

                    <Badge variant={statusColor(judge.status)} className="capitalize">
                        {judge.status?.replace(/_/g, ' ')}
                    </Badge>
                </div>

                {/* ================= STATS ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Gavel className="w-4 h-4" />
                            Assigned Contests
                        </div>
                        <p className="text-2xl font-bold mt-2">
                            {judgeContests?.length || 0}
                        </p>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Star className="w-4 h-4" />
                            Scores Given
                        </div>
                        <p className="text-2xl font-bold mt-2">
                            {judgeScores?.length || 0}
                        </p>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Calendar className="w-4 h-4" />
                            Activity
                        </div>
                        <p className="text-sm text-zinc-400 mt-2">
                            Active in judging system
                        </p>
                    </div>

                </div>

                {/* ================= CONTESTS ================= */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">Assigned Contests</h2>

                    {loadingContests ? (
                        <div className="text-zinc-500">Loading contests...</div>
                    ) : judgeContests.length === 0 ? (
                        <div className="text-zinc-500">No contests assigned</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            {judgeContests.map((c) => (
                                <div
                                    key={c.id}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
                                >
                                    <p className="font-semibold">{c.title}</p>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        {c.description?.slice(0, 80) || 'No description'}
                                    </p>

                                    <div className="mt-3 text-xs text-zinc-400">
                                        Status: {c.status}
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>

                {/* ================= SCORES / VOTES ================= */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">Judge Activity (Scores)</h2>

                    {loadingScores ? (
                        <div className="text-zinc-500">Loading scores...</div>
                    ) : judgeScores.length === 0 ? (
                        <div className="text-zinc-500">No judging activity found</div>
                    ) : (
                        <div className="space-y-3">

                            {judgeScores.map((score) => (
                                <div
                                    key={score.id}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-medium">
                                            Entry #{score.entry_id}
                                        </p>
                                        <p className="text-sm text-zinc-500">
                                            Contest: {score.contest_title || '—'}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-lg font-bold text-white">
                                            {score.score}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {new Date(score.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default JudgeDetailPage;