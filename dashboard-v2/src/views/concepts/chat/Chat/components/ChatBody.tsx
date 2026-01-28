import { useState, useEffect, useRef, useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import ChatBox from '@/components/view/ChatBox'
import ChatAction from './ChatAction'
import StartConverstation from '@/assets/svg/StartConverstation'
import { useChatStore } from '../store/chatStore'
import { apiGetConversation } from '@/services/ChatService'
import classNames from '@/utils/classNames'
import useResponsive from '@/utils/hooks/useResponsive'
import dayjs from 'dayjs'
import uniqueId from 'lodash/uniqueId'
import { TbChevronLeft } from 'react-icons/tb'
import type { GetConversationResponse, Message, ChatType } from '../types'
import type { ScrollBarRef } from '@/components/view/ChatBox'

const getFileType = (file: File) => {
    console.log('file.type', file.type)
    switch (file.type) {
        case 'image/jpg':
        case 'image/jpeg':
        case 'image/png':
        case 'image/webp':
            return 'image'
        case 'video/mp4':
        case 'video/avi':
            return 'video'
        case 'audio/mp3':
        case 'audio/wav':
            return 'audio'
        default:
            return 'misc'
    }
}

const ChatBody = () => {
    const scrollRef = useRef<ScrollBarRef>(null)
    const selectedChat = useChatStore((state) => state.selectedChat)
    const conversationRecord = useChatStore((state) => state.conversationRecord)
    const pushConversationRecord = useChatStore(
        (state) => state.pushConversationRecord,
    )
    const setSelectedChat = useChatStore((state) => state.setSelectedChat)
    const pushConversationMessage = useChatStore(
        (state) => state.pushConversationMessage,
    )
    const setContactInfoDrawer = useChatStore(
        (state) => state.setContactInfoDrawer,
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setIsFetchingConversation] = useState(false)
    const [conversation, setConversation] = useState<Message[]>([])

    const { smaller } = useResponsive()

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }

    const handleProfileClick = () => {
        setContactInfoDrawer({
            userId: selectedChat.user?.id as string,
            chatId: selectedChat.id as string,
            chatType: selectedChat.chatType as ChatType,
            open: true,
        })
    }

    const handlePushMessage = (message: Message) => {
        pushConversationMessage(selectedChat.id as string, message)
        setConversation((prevConversation) => {
            prevConversation.push(message)
            return structuredClone(prevConversation)
        })
    }

    const handleInputChange = async ({
        value,
        attachments,
    }: {
        value: string
        attachments?: File[]
    }) => {
        const newMessage: Message = {
            id: uniqueId('chat-conversation-'),
            sender: {
                id: '1',
                name: 'Angelina Gotelli',
                avatarImageUrl: '/img/avatars/thumb-1.jpg',
            },
            content: value,
            attachments: attachments?.map((attachment) => {
                return {
                    type: getFileType(attachment),
                    source: attachment,
                    mediaUrl: URL.createObjectURL(attachment),
                }
            }),
            timestamp: dayjs().toDate(),
            type: 'regular',
            isMyMessage: true,
        }
        handlePushMessage(newMessage)
    }

    const cardHeaderProps = {
        header: {
            content: (
                <div className="flex items-center gap-2">
                    {smaller.md && (
                        <button
                            className="text-xl hover:text-primary"
                            onClick={() => setSelectedChat({})}
                        >
                            <TbChevronLeft />
                        </button>
                    )}
                    <button
                        className="flex items-center gap-2"
                        role="button"
                        onClick={handleProfileClick}
                    >
                        <div>
                            <Avatar src={selectedChat.user?.avatarImageUrl} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex justify-between">
                                <div className="font-bold heading-text truncate">
                                    {selectedChat.user?.name}
                                </div>
                            </div>
                            <div>
                                {selectedChat?.chatType === 'groups'
                                    ? 'برای اطلاعات گروه اینجا را کلیک کنید'
                                    : 'آخرین بار اخیرا دیده شده است'}
                            </div>
                        </div>
                    </button>
                </div>
            ),
            extra: <ChatAction muted={selectedChat.muted} />,
            className: 'bg-gray-100 dark:bg-gray-600 h-[100px]',
        },
    }

    useEffect(() => {
        const fetchConvesation = async () => {
            setIsFetchingConversation(true)

            const record = conversationRecord.find(
                (item) => item.id === selectedChat.id,
            )

            if (record) {
                setConversation(record.conversation)
            } else {
                const resp = await apiGetConversation<GetConversationResponse>({
                    id: selectedChat.id as string,
                })
                setConversation(resp.conversation)
                pushConversationRecord(resp)
            }

            setIsFetchingConversation(false)
            scrollToBottom()
        }

        if (selectedChat.id) {
            setConversation([])
            fetchConvesation()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChat.id, conversation])

    const messageList = useMemo(() => {
        return conversation.map((item) => {
            item.timestamp = dayjs
                .unix(item.timestamp as number)
                .toDate() as Date
            if (item.isMyMessage) {
                item.showAvatar = false
            }
            return item
        })
    }, [conversation])

    return (
        <div
            className={classNames(
                'w-full md:block',
                !selectedChat.id && 'hidden',
            )}
        >
            {selectedChat.id ? (
                <Card
                    className="flex-1 h-full max-h-full dark:border-gray-700"
                    bodyClass="h-[calc(100%-100px)] relative"
                    {...cardHeaderProps}
                >
                    <ChatBox
                        ref={scrollRef}
                        messageList={messageList}
                        placeholder="یک درخواست اینجا وارد کنید"
                        showAvatar={true}
                        avatarGap={true}
                        messageListClass="h-[calc(100%-100px)]"
                        bubbleClass="max-w-[300px]"
                        onInputChange={handleInputChange}
                    />
                </Card>
            ) : (
                <div className="flex-1 h-full max-h-full flex flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-800">
                    <StartConverstation height={250} width={250} />
                    <div className="mt-10 text-center">
                        <h3>شروع به چت کنید!</h3>
                        <p className="mt-2 text-base">
                            یک مکالمه را انتخاب کنید یا یک مکالمه جدید را شروع کنید
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatBody
