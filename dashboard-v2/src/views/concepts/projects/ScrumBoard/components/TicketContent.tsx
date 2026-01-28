import { useEffect, useState, useRef } from 'react'
import { useScrumBoardStore } from '../store/scrumBoardStore'
import Spinner from '@/components/ui/Spinner'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dropdown from '@/components/ui/Dropdown'
import CloseButton from '@/components/ui/CloseButton'
import Tag from '@/components/ui/Tag'
import Tabs from '@/components/ui/Tabs'
import Badge from '@/components/ui/Badge'
import ScrollBar from '@/components/ui/ScrollBar'
import NoMedia from '@/assets/svg/NoMedia'
import UsersAvatarGroup from '@/components/shared/UsersAvatarGroup'
import dayjs from 'dayjs'
import cloneDeep from 'lodash/cloneDeep'
import { TbPlus, TbDownload, TbTrash } from 'react-icons/tb'
import isEmpty from 'lodash/isEmpty'
import { createUID, taskLabelColors, labelList } from '../utils'
import { Ticket, Comment, Member } from '../types'
import moment from 'jalali-moment'
interface TransformedComment extends Omit<Comment, 'date'> {
    date: Date
}

const { TabNav, TabList, TabContent } = Tabs

const createCommentObject = (message: string): TransformedComment => {
    return {
        id: createUID(10),
        name: 'Angelina Gotelli',
        src: '/img/avatars/thumb-1.jpg',
        message: message,
        date: new Date(),
    }
}

const AddMoreMember = () => {
    return (
        <Tooltip title="افزودن بیشتر" wrapperClass="flex">
            <Button
                icon={<TbPlus />}
                customColorClass={() =>
                    'border-2 border-dashed hover:ring-0 h-[30px] w-[30px] text-sm'
                }
                size="sm"
                shape="circle"
            />
        </Tooltip>
    )
}

const TicketContent = ({ onTicketClose }: { onTicketClose: () => void }) => {
    const { updateColumns, ticketId, columns, boardMembers } =
        useScrumBoardStore()

    const [ticketData, setTicketData] = useState<
        Partial<Omit<Ticket, 'comments'> & { comments: TransformedComment[] }>
    >({})
    const [loading, setLoading] = useState(false)

    const commentInput = useRef<HTMLInputElement>(null)

    const getTicketDetail = async () => {
        setLoading(true)
        let ticketDetail = {}
        for (const key in columns) {
            if (Object.hasOwnProperty.call(columns, key)) {
                const board = columns[key]
                const result = board.find((ticket) => ticket.id === ticketId)
                if (result) {
                    ticketDetail = result
                }
            }
        }
        setTicketData(ticketDetail)
        setLoading(false)
    }

    useEffect(() => {
        if (isEmpty(ticketData)) {
            getTicketDetail()
        } else {
            onUpdateColumn()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketData, ticketData])

    const submitComment = () => {
        if (commentInput.current) {
            const message = commentInput.current.value
            const comment = createCommentObject(message)
            const comments = cloneDeep(ticketData.comments)
            comments?.push(comment)
            setTicketData((prevState) => ({
                ...prevState,
                ...{ comments: comments },
            }))
            commentInput.current.value = ''
        }
    }

    const handleTicketClose = () => {
        onTicketClose?.()
    }

    const onUpdateColumn = () => {
        const data = cloneDeep(columns)
        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                const board = data[key]
                board.forEach((ticket, index) => {
                    if (ticket.id === ticketId) {
                        data[key][index] = ticketData as Ticket
                    }
                })
            }
        }
        updateColumns(data)
    }

    const onAddMemberClick = (id: string) => {
        const newMember = boardMembers.find((member) => member.id === id)
        const members = cloneDeep(ticketData.members)
        members?.push(newMember as Member)
        setTicketData((prevState) => ({
            ...prevState,
            ...{ members: members },
        }))
    }

    const onAddLabelClick = (label: string) => {
        const labels = cloneDeep(ticketData.labels)
        labels?.push(label)
        setTicketData((prevState) => ({ ...prevState, ...{ labels: labels } }))
    }

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <Spinner size={40} />
                </div>
            ) : (
                <>
                    <div className="flex gap-2 mb-10">
                        <div className="w-full">
                            <div className="flex justify-between">
                                <h4>{ticketData.name}</h4>
                                <div>
                                    <CloseButton onClick={handleTicketClose} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <ScrollBar className="max-h-[700px] overflow-y-auto">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center min-h-[30px]">
                                <div className="font-semibold text-gray-900 dark:text-gray-100 min-w-[150px]">
                                    اختصاص داده شده به:
                                </div>
                                <div className="flex items-center gap-1">
                                    <UsersAvatarGroup
                                        className="gap-1"
                                        avatarProps={{
                                            className: 'cursor-pointer',
                                        }}
                                        avatarGroupProps={{ maxCount: 4 }}
                                        chained={false}
                                        users={ticketData.members}
                                    />
                                    {boardMembers.length !==
                                        ticketData.members?.length && (
                                            <Dropdown
                                                renderTitle={<AddMoreMember />}
                                            >
                                                {boardMembers.map(
                                                    (member) =>
                                                        !ticketData.members?.some(
                                                            (m) =>
                                                                m.id === member.id,
                                                        ) && (
                                                            <Dropdown.Item
                                                                key={member.name}
                                                                eventKey={member.id}
                                                                onSelect={
                                                                    onAddMemberClick
                                                                }
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <Avatar
                                                                            shape="circle"
                                                                            size={
                                                                                22
                                                                            }
                                                                            src={
                                                                                member.img
                                                                            }
                                                                        />
                                                                        <span className="ml-2 rtl:mr-2">
                                                                            {
                                                                                member.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </Dropdown.Item>
                                                        ),
                                                )}
                                            </Dropdown>
                                        )}
                                </div>
                            </div>
                            <div className="flex items-center min-h-[30px]">
                                <div className="font-semibold text-gray-900 dark:text-gray-100 min-w-[150px]">
                                    برچسب:
                                </div>
                                <div className="flex items-center gap-1">
                                    {ticketData.labels?.map((label) => (
                                        <Tag
                                            key={label}
                                            className={taskLabelColors[label]}
                                        >
                                            {label}
                                        </Tag>
                                    ))}
                                    <Dropdown
                                        renderTitle={
                                            <Tag
                                                className="border-dashed cursor-pointer border-2 bg-transparent dark:bg-transparent border-gray-300 dark:border-gray-500 hover:border-primary hover:text-primary"
                                                prefix={<TbPlus />}
                                            >
                                                افزودن برچسب
                                            </Tag>
                                        }
                                        placement="bottom-end"
                                    >
                                        {labelList.map(
                                            (label) =>
                                                !ticketData.labels?.includes(
                                                    label,
                                                ) && (
                                                    <Dropdown.Item
                                                        key={label}
                                                        eventKey={label}
                                                        onSelect={
                                                            onAddLabelClick
                                                        }
                                                    >
                                                        <div className="flex items-center">
                                                            <Badge
                                                                innerClass={`${taskLabelColors[label]}`}
                                                            />
                                                            <span className="ml-2 rtl:mr-2">
                                                                {label}
                                                            </span>
                                                        </div>
                                                    </Dropdown.Item>
                                                ),
                                        )}
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="flex items-center min-h-[30px]">
                                <div className="font-semibold text-gray-900 dark:text-gray-100 min-w-[150px]">
                                    تاریخ سررسید:
                                </div>
                                <span className="font-semibold">
                                    {
                                        ticketData.dueDate &&
                                        moment(ticketData.dueDate).locale('fa').format('jDD jMMMM')
                                    }
                                </span>
                            </div>
                            {ticketData.description && (
                                <div className="flex">
                                    <div className="font-semibold text-gray-900 dark:text-gray-100 min-w-[150px]">
                                        توضیحات:
                                    </div>
                                    <div className="flex">
                                        <p>{ticketData.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Tabs className="mt-6" defaultValue="comments">
                            <TabList>
                                <TabNav value="comments">نظرات</TabNav>
                                <TabNav value="attachments">پیوست‌ها</TabNav>
                            </TabList>
                            <div className="p-4">
                                <TabContent value="comments">
                                    <div className="w-full">
                                        {ticketData.comments &&
                                            ticketData?.comments?.length >
                                            0 && (
                                                <>
                                                    {ticketData.comments.map(
                                                        (comment) => (
                                                            <div
                                                                key={comment.id}
                                                                className="mb-3 flex"
                                                            >
                                                                <div className="mt-2">
                                                                    <Avatar
                                                                        shape="circle"
                                                                        src={
                                                                            comment.src
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="ml-2 rtl:mr-2 p-3 rounded w-100">
                                                                    <div className="flex items-center mb-2">
                                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                                            {
                                                                                comment.name
                                                                            }
                                                                        </span>
                                                                        <span className="mx-1">
                                                                            {' '}
                                                                            |{' '}
                                                                        </span>
                                                                        <span>
                                                                            
                                                                            {moment(
                                                                                comment.date,
                                                                            ).locale('fa').format(
                                                                                'DD MMMM YYYY',
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <p className="mb-0">
                                                                        {
                                                                            comment.message
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </>
                                            )}
                                        <div className="mb-3 flex gap-2">
                                            <Avatar
                                                shape="circle"
                                                src="/img/avatars/thumb-1.jpg"
                                            />
                                            <div className="w-full relative">
                                                <Input
                                                    ref={commentInput}
                                                    textArea
                                                    placeholder="نوشتن نظر"
                                                />
                                                <div className="absolute bottom-4 right-4">
                                                    <div
                                                        className="cursor-pointer font-semibold text-primary "
                                                        onClick={() =>
                                                            submitComment()
                                                        }
                                                    >
                                                        ارسال
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabContent>
                                <TabContent value="attachments">
                                    {ticketData.attachments &&
                                        ticketData?.attachments?.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                            {ticketData.attachments.map(
                                                (file) => (
                                                    <Card
                                                        key={file.id}
                                                        bodyClass="px-3 pt-3 pb-1"
                                                        className="bg-gray-100 dark:bg-gray-700 shadow-none"
                                                        bordered={false}
                                                    >
                                                        <img
                                                            className="max-w-full rounded-lg"
                                                            alt={file.name}
                                                            src={file.src}
                                                        />
                                                        <div className="mt-1 flex justify-between items-center">
                                                            <div>
                                                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    {file.name}
                                                                </div>
                                                                <span className="text-xs">
                                                                    {file.size}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Tooltip title="دانلود">
                                                                    <Button
                                                                        variant="plain"
                                                                        size="xs"
                                                                        icon={
                                                                            <TbDownload />
                                                                        }
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip title="حذف">
                                                                    <Button
                                                                        variant="plain"
                                                                        size="xs"
                                                                        icon={
                                                                            <TbTrash />
                                                                        }
                                                                    />
                                                                </Tooltip>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 items-center justify-center">
                                            <NoMedia height={150} width={150} />
                                            <p className="font-semibold">
                                                بدون پیوست
                                            </p>
                                        </div>
                                    )}
                                </TabContent>
                            </div>
                        </Tabs>
                    </ScrollBar>
                    <div className="text-right mt-4">
                        <Button
                            className="mr-2 rtl:ml-2"
                            size="sm"
                            variant="plain"
                            onClick={() => handleTicketClose()}
                        >
                            لغو
                        </Button>
                        <Button
                            variant="solid"
                            size="sm"
                            onClick={() => handleTicketClose()}
                        >
                            تغییر
                        </Button>
                    </div>
                </>
            )}
        </>
    )
}

export default TicketContent
