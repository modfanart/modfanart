import classNames from '@/utils/classNames'
import Timeline from '@/components/ui/Timeline'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import isLastChild from '@/utils/isLastChild'
import dayjs from 'dayjs'
import type { Activities } from '../types'
import moment from 'jalali-moment'
type OrderDetailsActivitiesProps = {
    activities: Activities
    progressStatus: number
}

const progress: Record<number, { label: string; class: string }> = {
    0: {
        label: 'تکمیل شده',
        class: 'bg-success-subtle text-success', // کلاس برای پس‌زمینه و متن وضعیت تکمیل شده
    },
    1: {
        label: 'تکمیل نشده',
        class: 'bg-error-subtle text-error', // کلاس برای پس‌زمینه و متن وضعیت تکمیل نشده
    },
}
const OrderDetailsActivities = ({
    activities,
    progressStatus,
}: OrderDetailsActivitiesProps) => {
    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <h5>فعالیت</h5>
                <Tag
                    className={classNames(
                        'border-0 rounded-md', // کلاس‌های CSS برای طراحی ظاهری
                        progress[progressStatus || 0].class, // کلاس مربوط به وضعیت پیشرفت
                    )}
                >
                    {progress[progressStatus || 0].label} {/* برچسب وضعیت پیشرفت */}
                </Tag>
            </div>
            {activities.map((activity, i) => (
                <div
                    key={activity.date}
                    className={!isLastChild(activities, i) ? 'mb-8' : ''} // فاصله بین آیتم‌ها
                >
                    <div className="mb-2 font-bold heading-text uppercase">
                        {moment.unix(activity.date).locale('fa').format('dddd, DD MMMM')} {/* تاریخ فعالیت */}
                    </div>
                    <Timeline>
                        {activity.events.map((event, j) => (
                            <Timeline.Item
                                key={event.time + j}
                                media={
                                    <div className="flex mt-1">
                                        <Badge
                                            innerClass={classNames(
                                                event.recipient
                                                    ? 'bg-emerald-500' // رنگ برای دریافت‌کننده
                                                    : 'bg-blue-500', // رنگ برای حالت دیگر
                                            )}
                                        />
                                    </div>
                                }
                            >
                                <div
                                    className={classNames(
                                        'font-bold mb-1 heading-text',
                                        event.recipient && 'text-emerald-500', // رنگ متن دریافت‌کننده
                                    )}
                                >
                                    {event.action} {/* عمل انجام شده */}
                                </div>
                                {event.recipient && (
                                    <div className="mb-1">
                                        گیرنده: {event.recipient} {/* دریافت‌کننده */}
                                    </div>
                                )}
                                <div>
                                    {moment.unix(event.time).locale('fa').format('hh:mm A')} زمان رخداد
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </div>
            ))}
        </Card>
    )
}

export default OrderDetailsActivities
