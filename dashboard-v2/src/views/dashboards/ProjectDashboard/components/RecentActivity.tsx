import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ScrollBar from '@/components/ui/ScrollBar'
import Timeline from '@/components/ui/Timeline'
import { ActivityAvatar, ActivityEvent } from '@/components/view/Activity'
import isEmpty from 'lodash/isEmpty'
import type { Activities } from '../types'

type RecentActivityProps = {
    data: Activities
}

const RecentActivity = ({ data }: RecentActivityProps) => {
    return (
        <Card>
            <div className="flex sm:flex-row flex-col md:items-center justify-between mb-6 gap-4">
                <h4>فعالیت‌های اخیر</h4>
                <Button size="sm">مشاهده همه</Button>
            </div>
            <div className="mt-4">
                <ScrollBar className="max-h-[390px]">
                    <Timeline>
                        {isEmpty(data) ? (
                            <Timeline.Item>فعالیتی وجود ندارد</Timeline.Item>
                        ) : (
                            data.map((event, index) => (
                                <Timeline.Item
                                    key={event.type + index}
                                    media={<ActivityAvatar data={event} />}
                                >
                                    <div className="mt-1">
                                        <ActivityEvent compact data={event} />
                                    </div>
                                </Timeline.Item>
                            ))
                        )}
                    </Timeline>
                </ScrollBar>
            </div>
        </Card>
    )
}

export default RecentActivity
