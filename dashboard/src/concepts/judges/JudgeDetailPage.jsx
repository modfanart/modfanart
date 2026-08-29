import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    Gavel,
    Trophy,
    Star,
    Calendar,

    ShieldCheck,

    ArrowUpRight,
} from '@phosphor-icons/react';
import { Activity, Mail } from 'lucide-react';
import { Header } from '../../components/layout/Header';

import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';

import {
    useGetUserByIdQuery,
} from '../../services/api/userApi';

import {
    useGetJudgeContestsQuery,
    useGetMyJudgeScoresQuery,
} from '../../services/api/contestsApi';


const StatCard = ({
    icon: Icon,
    label,
    value,
    description,
}) => {
    return (
        <Card className="border-zinc-800 bg-zinc-900/70 shadow-none">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-zinc-500">
                            {label}
                        </p>

                        <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                            {value}
                        </p>

                        {description && (
                            <p className="mt-1 text-xs text-zinc-500">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                        <Icon className="h-4 w-4 text-zinc-400" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


const StatusBadge = ({ status }) => {
    const config = {
        active: {
            label: 'Active',
            className:
                'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        },
        suspended: {
            label: 'Suspended',
            className:
                'border-red-500/20 bg-red-500/10 text-red-400',
        },
        pending_verification: {
            label: 'Pending verification',
            className:
                'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
        },
    };

    const current = config[status] || {
        label: status?.replace(/_/g, ' ') || 'Unknown',
        className:
            'border-zinc-700 bg-zinc-800 text-zinc-400',
    };

    return (
        <Badge
            variant="outline"
            className={`font-medium capitalize ${current.className}`}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
            {current.label}
        </Badge>
    );
};


const LoadingPage = () => {
    return (
        <div className="min-h-screen">
            <Header
                title="Judge Profile"
                subtitle="Loading judge information..."
            />

            <div className="p-4 sm:p-6">
                <div className="mx-auto max-w-7xl space-y-6">

                    <Card className="border-zinc-800 bg-zinc-900/70">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full bg-zinc-800" />

                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40 bg-zinc-800" />
                                    <Skeleton className="h-4 w-56 bg-zinc-800" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <Skeleton
                                key={item}
                                className="h-32 rounded-xl bg-zinc-900"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


export const JudgeDetailPage = () => {
    const { id } = useParams();

    const {
        data: judge,
        isLoading: loadingJudge,
    } = useGetUserByIdQuery(id);

    const {
        data: contestsData,
        isLoading: loadingContests,
    } = useGetJudgeContestsQuery();

    const {
        data: judgeScores = [],
        isLoading: loadingScores,
    } = useGetMyJudgeScoresQuery({
        contestId: undefined,
    });

    const judgeContests = contestsData?.contests || [];

    const initials = useMemo(() => {
        if (!judge?.username) return '??';

        return judge.username
            .slice(0, 2)
            .toUpperCase();
    }, [judge]);

    const averageScore = useMemo(() => {
        if (!judgeScores.length) return '—';

        const total = judgeScores.reduce(
            (sum, item) => sum + Number(item.score || 0),
            0
        );

        return (total / judgeScores.length).toFixed(1);
    }, [judgeScores]);

    if (loadingJudge) {
        return <LoadingPage />;
    }

    if (!judge) {
        return (
            <div className="min-h-screen">
                <Header
                    title="Judge Profile"
                    subtitle="Judge information"
                />

                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                            <Gavel className="h-5 w-5 text-zinc-500" />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold text-white">
                            Judge not found
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            The requested judge profile could not be found.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">

            <Header
                title={`@${judge.username}`}
                subtitle="Judge Profile Overview"
            />

            <main className="p-4 sm:p-6">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* -------------------------------------------------- */}
                    {/* PROFILE */}
                    {/* -------------------------------------------------- */}

                    <Card className="overflow-hidden border-zinc-800 bg-zinc-900/70 shadow-none">

                        <CardContent className="p-0">

                            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-center gap-4">

                                    <Avatar className="h-16 w-16 border border-zinc-700">
                                        <AvatarImage
                                            src={judge.avatar_url}
                                            alt={judge.username}
                                        />

                                        <AvatarFallback className="bg-zinc-800 text-lg font-semibold text-white">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0">

                                        <div className="flex flex-wrap items-center gap-2">
                                            <h1 className="text-xl font-semibold tracking-tight text-white">
                                                @{judge.username}
                                            </h1>

                                            <StatusBadge
                                                status={judge.status}
                                            />
                                        </div>

                                        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                                            <Mail className="h-4 w-4" />
                                            <span className="truncate">
                                                {judge.email}
                                            </span>
                                        </div>

                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-zinc-500">
                                    <ShieldCheck className="h-4 w-4" />
                                    Judge Account
                                </div>

                            </div>

                            <Separator className="bg-zinc-800" />

                            <div className="grid grid-cols-1 divide-y divide-zinc-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

                                <div className="p-4 sm:px-6">
                                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                                        Username
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-zinc-300">
                                        @{judge.username}
                                    </p>
                                </div>

                                <div className="p-4 sm:px-6">
                                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                                        Account Status
                                    </p>

                                    <p className="mt-1 text-sm font-medium capitalize text-zinc-300">
                                        {judge.status?.replace(/_/g, ' ')}
                                    </p>
                                </div>

                                <div className="p-4 sm:px-6">
                                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                                        Member Since
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-zinc-300">
                                        {judge.created_at
                                            ? new Date(
                                                judge.created_at
                                            ).toLocaleDateString(
                                                undefined,
                                                {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                }
                                            )
                                            : '—'}
                                    </p>
                                </div>

                            </div>

                        </CardContent>
                    </Card>


                    {/* -------------------------------------------------- */}
                    {/* STATISTICS */}
                    {/* -------------------------------------------------- */}

                    <div>
                        <div className="mb-3">
                            <h2 className="text-sm font-medium text-zinc-300">
                                Overview
                            </h2>

                            <p className="mt-1 text-xs text-zinc-600">
                                Judge activity and participation summary
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                            <StatCard
                                icon={Gavel}
                                label="Assigned Contests"
                                value={judgeContests.length}
                                description="Contests assigned to this judge"
                            />

                            <StatCard
                                icon={Star}
                                label="Scores Given"
                                value={judgeScores.length}
                                description="Total judging submissions"
                            />

                            <StatCard
                                icon={Trophy}
                                label="Average Score"
                                value={averageScore}
                                description="Average submitted score"
                            />

                            <StatCard
                                icon={Activity}
                                label="Activity"
                                value={judgeScores.length > 0 ? 'Active' : 'No activity'}
                                description="Current judging activity"
                            />

                        </div>
                    </div>


                    {/* -------------------------------------------------- */}
                    {/* ASSIGNED CONTESTS */}
                    {/* -------------------------------------------------- */}

                    <Card className="border-zinc-800 bg-zinc-900/70 shadow-none">

                        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 px-5 py-4">

                            <div>
                                <CardTitle className="text-base font-semibold text-white">
                                    Assigned Contests
                                </CardTitle>

                                <p className="mt-1 text-xs text-zinc-500">
                                    Contests currently assigned to this judge
                                </p>
                            </div>

                            <div className="flex h-8 min-w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-400">
                                {judgeContests.length}
                            </div>

                        </CardHeader>

                        <CardContent className="p-0">

                            {loadingContests ? (
                                <div className="space-y-3 p-5">
                                    {[1, 2, 3].map((item) => (
                                        <Skeleton
                                            key={item}
                                            className="h-14 w-full bg-zinc-800"
                                        />
                                    ))}
                                </div>
                            ) : judgeContests.length === 0 ? (

                                <div className="flex flex-col items-center justify-center py-16 text-center">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                                        <Trophy className="h-4 w-4 text-zinc-600" />
                                    </div>

                                    <p className="mt-3 text-sm font-medium text-zinc-400">
                                        No contests assigned
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-600">
                                        Assigned contests will appear here.
                                    </p>

                                </div>

                            ) : (

                                <div className="overflow-x-auto">

                                    <Table>

                                        <TableHeader>
                                            <TableRow className="border-zinc-800 hover:bg-transparent">

                                                <TableHead className="px-5 text-xs font-medium text-zinc-500">
                                                    Contest
                                                </TableHead>

                                                <TableHead className="text-xs font-medium text-zinc-500">
                                                    Description
                                                </TableHead>

                                                <TableHead className="text-xs font-medium text-zinc-500">
                                                    Status
                                                </TableHead>

                                                <TableHead className="w-[50px]" />

                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>

                                            {judgeContests.map((contest) => (

                                                <TableRow
                                                    key={contest.id}
                                                    className="border-zinc-800 hover:bg-zinc-800/30"
                                                >

                                                    <TableCell className="px-5">
                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950">
                                                                <Trophy className="h-4 w-4 text-zinc-500" />
                                                            </div>

                                                            <span className="font-medium text-zinc-200">
                                                                {contest.title}
                                                            </span>

                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="max-w-md text-sm text-zinc-500">
                                                        {contest.description
                                                            ?.slice(0, 100) ||
                                                            'No description'}
                                                    </TableCell>

                                                    <TableCell>

                                                        <Badge
                                                            variant="outline"
                                                            className="border-zinc-700 bg-zinc-950 text-xs capitalize text-zinc-400"
                                                        >
                                                            {contest.status || 'Unknown'}
                                                        </Badge>

                                                    </TableCell>

                                                    <TableCell>
                                                        <ArrowUpRight className="h-4 w-4 text-zinc-600" />
                                                    </TableCell>

                                                </TableRow>

                                            ))}

                                        </TableBody>

                                    </Table>

                                </div>

                            )}

                        </CardContent>
                    </Card>


                    {/* -------------------------------------------------- */}
                    {/* JUDGING ACTIVITY */}
                    {/* -------------------------------------------------- */}

                    <Card className="border-zinc-800 bg-zinc-900/70 shadow-none">

                        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 px-5 py-4">

                            <div>
                                <CardTitle className="text-base font-semibold text-white">
                                    Judging Activity
                                </CardTitle>

                                <p className="mt-1 text-xs text-zinc-500">
                                    Recent scores submitted by this judge
                                </p>
                            </div>

                            <div className="flex items-center gap-2">

                                <Calendar className="h-4 w-4 text-zinc-600" />

                                <span className="text-xs text-zinc-500">
                                    {judgeScores.length} submissions
                                </span>

                            </div>

                        </CardHeader>

                        <CardContent className="p-0">

                            {loadingScores ? (

                                <div className="space-y-3 p-5">

                                    {[1, 2, 3, 4].map((item) => (
                                        <Skeleton
                                            key={item}
                                            className="h-14 w-full bg-zinc-800"
                                        />
                                    ))}

                                </div>

                            ) : judgeScores.length === 0 ? (

                                <div className="flex flex-col items-center justify-center py-16 text-center">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                                        <Star className="h-4 w-4 text-zinc-600" />
                                    </div>

                                    <p className="mt-3 text-sm font-medium text-zinc-400">
                                        No judging activity
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-600">
                                        Scores submitted by this judge will appear here.
                                    </p>

                                </div>

                            ) : (

                                <div className="overflow-x-auto">

                                    <Table>

                                        <TableHeader>

                                            <TableRow className="border-zinc-800 hover:bg-transparent">

                                                <TableHead className="px-5 text-xs font-medium text-zinc-500">
                                                    Entry
                                                </TableHead>

                                                <TableHead className="text-xs font-medium text-zinc-500">
                                                    Contest
                                                </TableHead>

                                                <TableHead className="text-xs font-medium text-zinc-500">
                                                    Submitted
                                                </TableHead>

                                                <TableHead className="text-right text-xs font-medium text-zinc-500">
                                                    Score
                                                </TableHead>

                                            </TableRow>

                                        </TableHeader>

                                        <TableBody>

                                            {judgeScores.map((score) => (

                                                <TableRow
                                                    key={score.id}
                                                    className="border-zinc-800 hover:bg-zinc-800/30"
                                                >

                                                    <TableCell className="px-5">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-500">
                                                                #
                                                            </div>

                                                            <span className="font-medium text-zinc-300">
                                                                {score.entry_id}
                                                            </span>

                                                        </div>

                                                    </TableCell>

                                                    <TableCell className="text-sm text-zinc-400">
                                                        {score.contest_title || '—'}
                                                    </TableCell>

                                                    <TableCell className="text-sm text-zinc-500">
                                                        {score.created_at
                                                            ? new Date(
                                                                score.created_at
                                                            ).toLocaleDateString(
                                                                undefined,
                                                                {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                }
                                                            )
                                                            : '—'}
                                                    </TableCell>

                                                    <TableCell className="text-right">

                                                        <span className="inline-flex min-w-10 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm font-semibold text-white">
                                                            {score.score}
                                                        </span>

                                                    </TableCell>

                                                </TableRow>

                                            ))}

                                        </TableBody>

                                    </Table>

                                </div>

                            )}

                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
};

export default JudgeDetailPage;

