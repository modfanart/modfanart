// src/views/contests/ContestListContent.tsx

import Card from '@/components/ui/Card'
import UsersAvatarGroup from '@/components/shared/UsersAvatarGroup'
import { Link } from 'react-router-dom'
import ProgressionBar from './ProgressionBar'
import { TbStar, TbStarFilled, TbUsers, TbCalendarEvent } from 'react-icons/tb'
import { format, parseISO } from 'date-fns'
import { useGetContestsQuery } from '@/services/contestsApi'
import { useMemo, useState } from 'react'

interface ContestListItem {
    id: string
    title: string
    slug?: string
    description?: string
    status:
        | 'draft'
        | 'published'
        | 'live'
        | 'judging'
        | 'completed'
        | 'archived'
    start_date: string
    submission_end_date: string
    voting_end_date?: string | null
    entry_count?: number
    brand_name?: string
    brand_logo?: string
    favourite?: boolean
}

const ContestListContent = () => {
    const [favorites, setFavorites] = useState<Record<string, boolean>>({})

    const { data, isLoading } = useGetContestsQuery(
        { activeOnly: true },
        {
            selectFromResult: ({ data }) => ({
                contests: (data?.contests ?? []) as ContestListItem[],
            }),
        },
    )

    const favoriteContests = useMemo(
        () => data?.contests?.filter((c) => favorites[c.id]) ?? [],
        [data?.contests, favorites],
    )

    const otherContests = useMemo(
        () => data?.contests?.filter((c) => !favorites[c.id]) ?? [],
        [data?.contests, favorites],
    )

    const toggleFavorite = (id: string, value: boolean) => {
        setFavorites((prev) => ({ ...prev, [id]: value }))
        // Optional: later sync with backend or localStorage
    }

    const getProgress = (contest: ContestListItem) => {
        if (contest.status === 'completed' || contest.status === 'archived')
            return 100
        if (contest.status === 'draft' || contest.status === 'published')
            return 0

        const now = Date.now()
        const start = parseISO(contest.start_date).getTime()
        const end = parseISO(contest.submission_end_date).getTime()

        if (now < start) return 0
        if (now > end) return 100

        return Math.round(((now - start) / (end - start)) * 100)
    }

    if (isLoading) {
        return <div className="py-10 text-center">Loading contests...</div>
    }

    if (!data?.contests?.length) {
        return <div className="py-10 text-center">No contests found</div>
    }

    return (
        <div>
            {/* Favorite Contests */}
            {favoriteContests.length > 0 && (
                <div className="mt-8">
                    <h5 className="mb-3">Favorite Contests</h5>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favoriteContests.map((contest) => (
                            <Card key={contest.id} bodyClass="h-full">
                                <div className="flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-center">
                                        <Link
                                            to={`/contests/${contest.id}`}
                                            className="hover:text-primary"
                                        >
                                            <h6 className="font-bold line-clamp-2">
                                                {contest.title}
                                            </h6>
                                        </Link>
                                        <div
                                            className="text-amber-400 cursor-pointer text-lg"
                                            role="button"
                                            onClick={() =>
                                                toggleFavorite(
                                                    contest.id,
                                                    false,
                                                )
                                            }
                                        >
                                            <TbStarFilled />
                                        </div>
                                    </div>

                                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                                        {contest.description ||
                                            'No description'}
                                    </p>

                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <TbCalendarEvent className="text-lg" />
                                            <span>
                                                Until{' '}
                                                {format(
                                                    parseISO(
                                                        contest.submission_end_date,
                                                    ),
                                                    'MMM dd, yyyy',
                                                )}
                                            </span>
                                        </div>

                                        <ProgressionBar
                                            progression={getProgress(contest)}
                                        />

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <TbUsers />
                                                <span>
                                                    {contest.entry_count ?? 0}{' '}
                                                    participant
                                                    {contest.entry_count !== 1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            </div>

                                            <div className="text-xs font-medium px-2.5 py-1 bg-gray-100 rounded-full capitalize">
                                                {contest.status === 'live'
                                                    ? 'Ongoing'
                                                    : contest.status ===
                                                        'judging'
                                                      ? 'Judging'
                                                      : contest.status ===
                                                          'completed'
                                                        ? 'Completed'
                                                        : contest.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* All Other Contests */}
            <div className="mt-10">
                <h5 className="mb-3">
                    {favoriteContests.length > 0
                        ? 'Other Contests'
                        : 'Contests'}
                </h5>

                <div className="flex flex-col gap-4">
                    {otherContests.map((contest) => (
                        <Card key={contest.id}>
                            <div className="grid gap-x-4 gap-y-3 grid-cols-12 items-center">
                                {/* Title & brand */}
                                <div className="col-span-12 sm:col-span-5 md:col-span-4 lg:col-span-4">
                                    <div className="flex flex-col">
                                        <Link
                                            to={`/contests/${contest.id}`}
                                            className="font-bold hover:text-primary line-clamp-1"
                                        >
                                            {contest.title}
                                        </Link>
                                        {contest.brand_name && (
                                            <span className="text-sm text-gray-500">
                                                {contest.brand_name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Entries count */}
                                <div className="col-span-6 sm:col-span-3 md:col-span-2 lg:col-span-2 flex justify-center sm:justify-end">
                                    <div className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-full text-sm">
                                        <TbUsers className="text-base" />
                                        <span className="ml-1.5 whitespace-nowrap">
                                            {contest.entry_count ?? 0} entries
                                        </span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-3">
                                    <ProgressionBar
                                        progression={getProgress(contest)}
                                    />
                                </div>

                                {/* Status & Favorite */}
                                <div className="col-span-12 sm:col-span-5 md:col-span-3 lg:col-span-3 flex items-center justify-between sm:justify-end gap-4">
                                    <div className="text-xs font-medium px-2.5 py-1 bg-gray-100 rounded-full capitalize">
                                        {contest.status === 'live'
                                            ? 'Ongoing'
                                            : contest.status === 'judging'
                                              ? 'Judging'
                                              : contest.status === 'completed'
                                                ? 'Completed'
                                                : contest.status}
                                    </div>

                                    <div
                                        className="cursor-pointer text-xl text-gray-400 hover:text-amber-400 transition-colors"
                                        role="button"
                                        onClick={() =>
                                            toggleFavorite(contest.id, true)
                                        }
                                    >
                                        <TbStar />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ContestListContent
