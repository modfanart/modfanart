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
        label: 'Completed',
        bgClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    },
    1: {
        label: 'In Progress',
        bgClass: 'bg-blue-500',
        textClass: 'text-blue-500',
    },
    2: {
        label: 'Ready for Testing',
        bgClass: 'bg-amber-500',
        textClass: 'text-amber-500',
    },
}

const taskLabelColors: Record<string, string> = {
    'Live Issue': 'bg-rose-500',
    Support: 'bg-blue-500',
    Bug: 'bg-amber-400',
    'Low Priority': 'bg-indigo-500',
}

const UnixDateTime = ({ value }: { value: number }) => {
    // You can keep 12-hour format with AM/PM or switch to 24-hour
    // Here we keep your original logic but in English
    const formattedTime = dayjs.unix(value).format('hh:mm A')
    return <>{formattedTime}</>
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
                        <span className="mx-1">changed status of</span>
                        <HighlightedText>{data.ticket}</HighlightedText>
                        <span className="mx-1">to</span>
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
                    <span className="mx-1">changed status of</span>
                    <HighlightedText>{data.ticket}</HighlightedText>
                    <span className="mx-1">to</span>
                    <span className="inline-flex items-center gap-1">
                        <Badge
                            className={ticketStatus[data.status || 0].bgClass}
                        />
                        <HighlightedText>
                            {ticketStatus[data.status || 0].label}
                        </HighlightedText>
                    </span>
                    <span className="ml-1 rtl:mr-1 md:ml-3 rtl:md:mr-3 font-semibold">
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
                                <span className="mx-1">commented on</span>
                                <HighlightedText>post</HighlightedText>
                            </div>
                        </>
                    ) : (
                        <p className="gap-1 inline-flex items-center flex-wrap">
                            <HighlightedText>{data.userName}</HighlightedText>
                            <span className="mx-1">commented on</span>
                            <HighlightedText>post</HighlightedText>
                            <span className="ml-1 rtl:mr-1 md:ml-3 rtl:md:mr-3 font-semibold">
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
                                    mentioned you in a comment on
                                </span>
                                <HighlightedText>post</HighlightedText>
                            </div>
                        </>
                    ) : (
                        <p className="my-1">
                            <HighlightedText>{data.userName}</HighlightedText>
                            <span className="mx-1">
                                mentioned you in a comment on
                            </span>
                            <HighlightedText>post</HighlightedText>
                            <span className="ml-1 rtl:mr-1 md:ml-3 rtl:md:mr-3 font-semibold">
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
                        <span className="mx-1">added tags</span>
                        {data?.tags?.map((label, index) => (
                            <Tag
                                key={label + index}
                                prefix
                                className="mx-1"
                                prefixClass={
                                    taskLabelColors[label] || 'bg-gray-400'
                                }
                            >
                                {label}
                            </Tag>
                        ))}
                    </div>
                </>
            ) : (
                <div>
                    <HighlightedText>{data.userName}</HighlightedText>
                    <span className="mx-1">added tags</span>
                    <span className="inline-flex items-center gap-1">
                        {data?.tags?.map((label, index) => (
                            <Tag
                                key={label + index}
                                prefix
                                prefixClass={
                                    taskLabelColors[label] || 'bg-gray-400'
                                }
                            >
                                {label}
                            </Tag>
                        ))}
                    </span>
                    <span className="ml-1 rtl:mr-1 md:ml-3 rtl:md:mr-3 font-semibold">
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
                        <span className="mx-1">attached</span>
                        {data?.files?.map((file, index) => (
                            <HighlightedText key={file + index}>
                                {file}
                                {!isLastChild(data?.files || [], index) && ', '}
                            </HighlightedText>
                        ))}
                    </div>
                </>
            ) : (
                <div className="inline-flex items-center flex-wrap">
                    <HighlightedText>{data.userName}</HighlightedText>
                    <span className="mx-1">attached</span>
                    {data?.files?.map((file, index) => (
                        <HighlightedText key={file + index}>
                            {file}
                            {!isLastChild(data?.files || [], index) && ', '}
                        </HighlightedText>
                    ))}
                    <span className="mx-1">to ticket</span>
                    <HighlightedText>{data.ticket}</HighlightedText>
                    <span className="ml-1 rtl:mr-1 md:ml-3 rtl:md:mr-3 font-semibold">
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
                        <span className="mx-1">assigned ticket</span>
                        <HighlightedText>{data.ticket}</HighlightedText>
                        <span className="mx-1">to</span>
                        <HighlightedText>{data?.assignee}</HighlightedText>
                    </div>
                </>
            ) : (
                <div>
                    <HighlightedText>{data.userName}</HighlightedText>
                    <span className="mx-1">assigned ticket</span>
                    <HighlightedText>{data.ticket}</HighlightedText>
                    <span className="mx-1">to</span>
                    <HighlightedText>{data.assignee}</HighlightedText>
                    <span className="ml-1 rtl:mr-1 md:ml-3 rtl:md:mr-3 font-semibold">
                        <UnixDateTime value={data.dateTime} />
                    </span>
                </div>
            )

        case CREATE_TICKET:
            return (
                <div className="inline-flex items-center flex-wrap">
                    <HighlightedText>{data.userName}</HighlightedText>
                    <span className="mx-1">created ticket</span>
                    <HighlightedText>{data.ticket}</HighlightedText>
                    <span className="ml-1 rtl:mr-1 md:ml-3 rtl:md:mr-3 font-semibold">
                        <UnixDateTime value={data.dateTime} />
                    </span>
                </div>
            )

        default:
            return null
    }
}

export default ActivityEvent
