import { useState, useEffect } from 'react'
import Timeline from '@/components/ui/Timeline'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import { apiGetLogs } from '@/services/LogService'
import { ActivityAvatar, ActivityEvent } from '@/components/view/Activity'
import isEmpty from 'lodash/isEmpty'
import dayjs from 'dayjs'
import type { GetProjectDetailsActitvityResponse } from '../types'
import moment from 'jalali-moment'

const ProjectDetailsActivity = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [activityIndex, setActivityIndex] = useState(1)
    const [loadable, seLoadable] = useState(true)
    const [activities, setActivities] = useState<
        Array<{
            id: string
            date: number
            events: Array<{
                type: string
                dateTime: number
                ticket?: string
                status?: number
                userName: string
                userImg?: string
                comment?: string
                tags?: string[]
                files?: string[]
                assignee?: string
            }>
        }>
    >([])

    const getLogs = async () => {
        setIsLoading(true)
        const resp = await apiGetLogs<
            GetProjectDetailsActitvityResponse,
            { activityIndex: number }
        >({ activityIndex })
        setActivities((prevActivities) => [...prevActivities, ...resp.data])
        seLoadable(resp.loadable)
        setIsLoading(false)
    }

    useEffect(() => {
        getLogs()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onLoadMore = () => {
        setActivityIndex((prevIndex) => prevIndex + 1)
        getLogs()
    }

    return (
        <Loading loading={isLoading}>
            <div>
                {activities.map((log, index) => (
                    <div key={log.id + index} className="mb-8">
                        <div className="mb-4 font-semibold uppercase">
                            {
                                moment(log.date).locale('fa').format('dddd، DD MMMM')
                            }
                        </div>
                        <Timeline>
                            {isEmpty(log.events) ? (
                                <Timeline.Item>No Activities</Timeline.Item>
                            ) : (
                                log.events.map((event, index) => (
                                    <Timeline.Item
                                        key={log.id + event.type + index}
                                        media={<ActivityAvatar data={event} />}
                                    >
                                        <div className="mt-1">
                                            <ActivityEvent data={event} />
                                        </div>
                                    </Timeline.Item>
                                ))
                            )}
                        </Timeline>
                    </div>
                ))}
                <div className="text-center">
                    {loadable ? (
                        <Button loading={isLoading} onClick={onLoadMore}>
                           بارگذاری بیشتر
                        </Button>
                    ) : (
                        'دیگر فعالیتی برای بارگیری وجود ندارد'
                    )}
                </div>
            </div>
        </Loading>
    )
}

export default ProjectDetailsActivity
