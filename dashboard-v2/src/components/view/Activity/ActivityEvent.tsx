import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import classNames from 'classnames'
import ReactHtmlParser from 'html-react-parser'
import isLastChild from '@/utils/isLastChild'
import dayjs from 'dayjs'
import {
    UPDATE_TICKET,
    COMMENT,
    ADD_TAGS_TO_TICKET,
    ADD_FILES_TO_TICKET,
    CREATE_TICKET,
    COMMENT_MENTION,
    ASSIGN_TICKET,
} from './constants'
import type { CommonProps } from '@/@types/common'
import type { HTMLReactParserOptions } from 'html-react-parser'

type ActivityEventProps = {
    data: {
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
    }
    compact?: boolean
}

const ticketStatus: Record<
    number,
    {
        label: string
        bgClass: string
        textClass: string
    }
> = {
    0: {
        label: 'تکمیل شده',
        bgClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    },
    1: {
        label: 'در حال انجام',
        bgClass: 'bg-blue-500',
        textClass: 'text-blue-500',
    },
    2: {
        label: 'آماده برای تست',
        bgClass: 'bg-amber-500',
        textClass: 'text-amber-500',
    },
}

const taskLabelColors: Record<string, string> = {
    'مسئله زنده': 'bg-rose-500',
    'پشتیبانی': 'bg-blue-500',
    'خطا': 'bg-amber-400',
    'اولویت پایین': 'bg-indigo-500',
}

const UnixDateTime = ({ value }: { value: number }) => {
    const formattedTime = dayjs.unix(value).format('hh:mm A');
    const persianTime = formattedTime.replace('AM', 'صبح').replace('PM', 'عصر');

    return <>{persianTime}</>;
}

const HighlightedText = ({ children, className }: CommonProps) => {
    return (
        <span className={classNames('font-bold heading-text', className)}>
            {children}
        </span>
    )
}

const ActivityEvent = ({ data, compact }: ActivityEventProps) => {
    const options: HTMLReactParserOptions = {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        replace: (node: any) => {
            if (node.type === 'tag' && node?.name === 'strong') {
                return (
                    <HighlightedText key={node?.children[0]?.data}>
                        {node?.children[0]?.data}
                    </HighlightedText>
                )
            }
            return node.data
        },
    }

    switch (data.type) {
        case UPDATE_TICKET:
            return compact ? (
                <>
                    <div className="flex flex-col gap-y-0.5">
                        <HighlightedText>{data.userName}</HighlightedText>
                        <span className="text-xs font-semibold">
                            <UnixDateTime value={data.dateTime} />
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="mx-1">تغییر داده است </span>
                        <HighlightedText>{data.ticket}</HighlightedText>
                        <span className="mx-1"> وضعیت را به </span>
                        <span className="inline-flex items-center gap-1">
                            <Badge
                                className={
                                    ticketStatus[data.status || 0].bgClass
                                }
                            />
                            <HighlightedText className="ml-1 rtl:mr-1">
                                {ticketStatus[data.status || 0].label}
                            </HighlightedText>
                        </span>
                    </div>
                </>
            ) : (
                <p className="my-1">
                    <HighlightedText>{data.userName}</HighlightedText>
                    <span className="mx-1">تغییر داده است </span>
                    <HighlightedText>{data.ticket}</HighlightedText>
                    <span className="mx-1"> وضعیت را به </span>
                    <span className="inline-flex items-center gap-1">
                        <Badge
                            className={ticketStatus[data.status || 0].bgClass}
                        />
                        <HighlightedText>
                            {ticketStatus[data.status || 0].label}
                        </HighlightedText>
                    </span>
                    <span className="ml-1 rtl:mr-1 md;ml-3 rtl:md:mr-3 font-semibold">
                        <UnixDateTime value={data.dateTime} />
                    </span>
                </p>
            )
        case COMMENT:
            return (
                <>
                    {compact ? (
                        <>
                            <div className="flex flex-col gap-y-0.5">
                                <HighlightedText>
                                    {data.userName}
                                </HighlightedText>
                                <span className="text-xs font-semibold">
                                    <UnixDateTime value={data.dateTime} />
                                </span>
                            </div>
                            <div className="mt-2">
                                <span className="mx-1">نظر داده است در</span>
                                <HighlightedText>پست</HighlightedText>
                            </div>
                        </>
                    ) : (
                        <p className="gap-1 inline-flex items-center flex-wrap">
                            <HighlightedText>{data.userName}</HighlightedText>
                            <span className="mx-1">نظر داده است در</span>
                            <HighlightedText>پست</HighlightedText>
                            <span className="ml-1 rtl:mr-1 md;ml-3 rtl:md:mr-3 font-semibold">
                                <UnixDateTime value={data.dateTime} />
                            </span>
                        </p>
                    )}
                    <Card
                        bordered={false}
                        className="mt-4 bg-gray-100 dark:bg-gray-700 shadow-none"
                    >
                        {ReactHtmlParser(data.comment || '', options)}
                    </Card>
                </>
            )
        case COMMENT_MENTION:
            return (
                <>
                    {compact ? (
                        <>
                            <div className="flex flex-col gap-y-0.5">
                                <HighlightedText>
                                    {data.userName}
                                </HighlightedText>
                                <span className="text-xs font-semibold">
                                    <UnixDateTime value={data.dateTime} />
                                </span>
                            </div>
                            <div className="mt-2">
                                <span className="mx-1">
                                    به شما در یک نظر اشاره کرده است
                                </span>
                                <HighlightedText>پست</HighlightedText>
                            </div>
                        </>
                    ) : (
                        <p className="my-1">
                            <HighlightedText>{data.userName}</HighlightedText>
                            <span className="mx-1">
                                به شما در یک نظر اشاره کرده است
                            </span>
                            <HighlightedText>پست</HighlightedText>
                            <span className="ml-1 rtl:mr-1 md;ml-3 rtl:md:mr-3 font-semibold">
                                <UnixDateTime value={data.dateTime} />
                            </span>
                        </p>
                    )}
                    <Card
                        bordered={false}
                        className="mt-4 bg-gray-100 dark:bg-gray-700 shadow-none"
                    >
                        {ReactHtmlParser(data.comment || '', options)}
                    </Card>
                </>
            )
        case ADD_TAGS_TO_TICKET:
            return compact ? (
                <>
                    <div className="flex flex-col gap-y-0.5">
                        <HighlightedText>{data.userName}</HighlightedText>
                        <span className="text-xs font-semibold">
                            <UnixDateTime value={data.dateTime} />
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="mx-1">برچسب ها را اضافه کرده است </span>
                        {data?.tags?.map((label, index) => (
                            <Tag
                                key={label + index}
                                prefix
                                className="mx-1"
                                prefixClass={`${taskLabelColors[label]}`}
                            >
                                {label}
                            </Tag>
                        ))}
                    </div>
                </>
            ) : (
                <div>
                    <HighlightedText>{data.userName} </HighlightedText>
                    <span className="mx-1">برچسب ها را اضافه کرده است </span>
                    <span className="inline-flex items-center gap-1">
                        {data?.tags?.map((label, index) => (
                            <Tag
                                key={label + index}
                                prefix
                                prefixClass={`${taskLabelColors[label]}`}
                            >
                                {label}
                            </Tag>
                        ))}
                    </span>
                    <span className="ml-1 rtl:mr-1 md;ml-3 rtl:md:mr-3 font-semibold">
                        <UnixDateTime value={data.dateTime} />
                    </span>
                </div>
            )
        case ADD_FILES_TO_TICKET:
            return compact ? (
                <>
                    <div className="flex flex-col gap-y-0.5">
                        <HighlightedText>{data.userName}</HighlightedText>
                        <span className="text-xs font-semibold">
                            <UnixDateTime value={data.dateTime} />
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="mx-1">اضافه کرده است</span>
                        {data?.files?.map((file, index) => (
                            <HighlightedText key={file + index}>
                                {file}
                                {!isLastChild(data?.files || [], index) && (
                                    <span className="ltr:mr-1 rtl:ml-1">
                                        ,{' '}
                                    </span>
                                )}
                            </HighlightedText>
                        ))}
                    </div>
                </>
            ) : (
                <div className="inline-flex items-center flex-wrap">
                    <HighlightedText>{data.userName} </HighlightedText>
                    <span className="mx-1">اضافه کرده است</span>
                    {data?.files?.map((file, index) => (
                        <HighlightedText key={file + index}>
                            {file}
                            {!isLastChild(data?.files || [], index) && (
                                <span className="ltr:mr-1 rtl:ml-1">, </span>
                            )}
                        </HighlightedText>
                    ))}
                    <span className="mx-1">به تیکت</span>
                    <HighlightedText>{data.ticket} </HighlightedText>
                    <span className="ml-1 rtl:mr-1 md;ml-3 rtl:md:mr-3 font-semibold">
                        <UnixDateTime value={data.dateTime} />
                    </span>
                </div>
            )
        case ASSIGN_TICKET:
            return compact ? (
                <>
                    <div className="flex flex-col gap-y-0.5">
                        <HighlightedText>{data.userName}</HighlightedText>
                        <span className="text-xs font-semibold">
                            <UnixDateTime value={data.dateTime} />
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="mx-1">تیکت را اختصاص داده است</span>
                        <HighlightedText>{data.ticket}</HighlightedText>
                        <span className="mx-1">به</span>
                        <HighlightedText>{data?.assignee} </HighlightedText>
                    </div>
                </>
            ) : (
                <div>
                    <HighlightedText>{data.userName} </HighlightedText>
                    <span className="mx-1">تیکت را اختصاص داده است</span>
                    <HighlightedText>{data.ticket}</HighlightedText>
                    <span className="mx-1">به</span>
                    <HighlightedText>{data.assignee} </HighlightedText>
                    <span className="ml-1 rtl:mr-1 md;ml-3 rtl:md:mr-3 font-semibold">
                        <UnixDateTime value={data.dateTime} />
                    </span>
                </div>
            )
        case CREATE_TICKET:
            return (
                <div className="inline-flex items-center flex-wrap">
                    <HighlightedText>{data.userName} </HighlightedText>
                    <span className="mx-1">تیکت را ایجاد کرده است</span>
                    <HighlightedText>{data.ticket}</HighlightedText>
                    <span className="ml-1 rtl:mr-1 md;ml-3 rtl:md:mr-3 font-semibold">
                        <UnixDateTime value={data.dateTime} />
                    </span>
                </div>
            )
        default:
            return null
    }
}

export default ActivityEvent
