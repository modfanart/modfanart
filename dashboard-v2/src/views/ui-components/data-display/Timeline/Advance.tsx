import Timeline from '@/components/ui/Timeline'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { HiTag } from 'react-icons/hi'
import type { AvatarProps } from '@/components/ui/Avatar'

type TimelineAvatarProps = AvatarProps

const TimelineAvatar = ({ children, ...rest }: TimelineAvatarProps) => {
    return (
        <Avatar {...rest} size={25} shape="circle">
            {children}
        </Avatar>
    )
}

const Advance = () => {
    return (
        <div className="max-w-[700px]">
            <Timeline>
                <Timeline.Item
                    media={
                        <TimelineAvatar className="bg-amber-500">
                            C
                        </TimelineAvatar>
                    }
                >
                    <p className="my-1 flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            آنجلینا گوتلی{' '}
                        </span>
                        <span className="mx-2">وضعیت را تغییر داده است به </span>
                        <Badge className="bg-emerald-500" />
                        <span className="ml-1 rtl:mr-1 font-semibold text-gray-900 dark:text-gray-100">
                            تکمیل شده
                        </span>
                        <span className="ml-3 rtl:mr-3">۶ ساعت پیش</span>
                    </p>
                </Timeline.Item>
                <Timeline.Item
                    media={
                        <TimelineAvatar
                            src="/img/avatars/thumb-3.jpg"
                            className="bg-amber-500"
                        />
                    }
                >
                    <p className="my-1 flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            مکس الکساندر
                        </span>
                        <span className="mx-2">روی </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            پست شما
                        </span>
                        <span className="mx-2">نظر داده است</span>
                        <span className="ml-3 rtl:mr-3">۲ روز پیش</span>
                    </p>
                    <Card className="mt-4">
                        <p>
                            خب، شاید جاوا مثال خوبی از چیزی باشد که یک زبان برنامه‌نویسی
                            باید شبیه آن باشد. اما برنامه‌های جاوا مثال خوبی از چیزی هستند
                            که برنامه‌ها نباید شبیه آن باشند.
                        </p>
                    </Card>
                </Timeline.Item>
                <Timeline.Item
                    media={
                        <TimelineAvatar className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-100">
                            <HiTag />
                        </TimelineAvatar>
                    }
                >
                    <p className="flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            یوجین استوارت{' '}
                        </span>
                        <span className="mx-2">تگ‌های </span>
                        <Tag
                            prefix
                            className="mr-2 rtl:ml-2 cursor-pointer"
                            prefixClass="bg-rose-500"
                        >
                            مشکل فعال
                        </Tag>
                        <Tag
                            prefix
                            className="mr-2 rtl:ml-2 cursor-pointer"
                            prefixClass="bg-blue-600"
                        >
                            بک‌اند
                        </Tag>
                        <span className="ml-3 rtl:mr-3">۲ روز پیش</span>
                    </p>
                </Timeline.Item>
            </Timeline>
        </div>
    )
}

export default Advance
