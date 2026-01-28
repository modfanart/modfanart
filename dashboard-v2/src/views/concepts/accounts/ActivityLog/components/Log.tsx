import Timeline from '@/components/ui/Timeline'
import Button from '@/components/ui/Button'
import { ActivityAvatar, ActivityEvent } from '@/components/view/Activity'
import isEmpty from 'lodash/isEmpty'
import dayjs from 'dayjs'
import type { Activity } from '../types'
import moment from 'jalali-moment'
type LogProps = {
    onLoadMore: () => void
    isLoading: boolean
    loadable: boolean
    activities: Activity[]
    filter: string[]
}

const Log = ({
    activities,
    loadable,
    isLoading,
    onLoadMore,
    filter = [],
}: LogProps) => {
    return (
        <div>
            {activities.map((log, index) => (
                <div key={log.id + index} className="mb-8">
                    {log.events.filter((item) => filter.includes(item.type))
                        .length > 0 && (
                        <div className="mb-4 font-semibold uppercase">
                            {moment.unix(log.date).locale('fa').format('dddd, DD MMMM')}
                        </div>
                    )}
                    <Timeline>
                        {isEmpty(log.events) ? (
                            <Timeline.Item>بدون فعالیت</Timeline.Item>
                        ) : (
                            log.events
                                .filter((item) => filter.includes(item.type))
                                .map((event, index) => (
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
    )
}

export default Log
