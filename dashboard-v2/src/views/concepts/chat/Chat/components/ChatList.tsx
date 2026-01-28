import { useRef, useState, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import ScrollBar from '@/components/ui/ScrollBar'
import ChatSegment from './ChatSegment'
import NewChat from './NewChat'
import { useChatStore } from '../store/chatStore'
import useChat from '../hooks/useChat'
import classNames from '@/utils/classNames'
import useDebounce from '@/utils/hooks/useDebounce'
import { TbVolumeOff, TbSearch, TbX } from 'react-icons/tb'
import dayjs from 'dayjs'
import moment from 'jalali-moment'
import type { ChatType } from '../types'
import type { ChangeEvent } from 'react'

const ChatList = () => {
    const chats = useChatStore((state) => state.chats)
    const chatsFetched = useChatStore((state) => state.chatsFetched)
    const selectedChat = useChatStore((state) => state.selectedChat)
    const setSelectedChat = useChatStore((state) => state.setSelectedChat)
    const setMobileSidebar = useChatStore((state) => state.setMobileSidebar)
    const selectedChatType = useChatStore((state) => state.selectedChatType)
    const setSelectedChatType = useChatStore(
        (state) => state.setSelectedChatType,
    )
    const setChatRead = useChatStore((state) => state.setChatRead)

    const inputRef = useRef<HTMLInputElement>(null)

    const [showSearchBar, setShowSearchBar] = useState(false)
    const [queryText, setQueryText] = useState('')

    const { fetchChats } = useChat()

    useEffect(() => {
        if (!chatsFetched) {
            fetchChats()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (showSearchBar) {
            inputRef.current?.focus()
        } else {
            inputRef.current?.blur()
        }
    }, [showSearchBar])

    const handleChatClick = ({
        id,
        user,
        muted,
        chatType,
        unread,
    }: {
        id: string
        user: { id: string; avatarImageUrl: string; name: string }
        muted: boolean
        chatType: ChatType
        unread: number
    }) => {
        if (unread > 0) {
            setChatRead(id)
        }

        setSelectedChat({
            id,
            user,
            muted,
            chatType,
        })
        setMobileSidebar(false)
    }

    function handleDebounceFn(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.value.length > 0) {
            setSelectedChatType('')
        }

        if (e.target.value.length === 0) {
            setSelectedChatType('personal')
        }

        setQueryText(e.target.value)
    }

    const debounceFn = useDebounce(handleDebounceFn, 500)

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        debounceFn(e)
    }

    const handleSearchToggleClick = () => {
        setShowSearchBar(!showSearchBar)
    }

    return (
        <div className="flex flex-col justify-between h-full">
            <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                    {showSearchBar ? (
                        <input
                            ref={inputRef}
                            className="flex-1 h-full placeholder:text-gray-400 placeholder:text-base placeholder:font-normal bg-transparent focus:outline-none heading-text font-bold"
                            placeholder="جستجوی چت"
                            onChange={handleInputChange}
                        />
                    ) : (
                        <h4>چت کنید</h4>
                    )}
                    <button
                        className="close-button text-lg"
                        type="button"
                        onClick={handleSearchToggleClick}
                    >
                        {showSearchBar ? <TbX /> : <TbSearch />}
                    </button>
                </div>
                <ChatSegment />
            </div>
            <ScrollBar className="h-[calc(100%-150px)] overflow-y-auto">
                <div className="flex flex-col gap-2 h-full">
                    {chats
                        .filter((item) => {
                            if (queryText) {
                                return item.name
                                    .toLowerCase()
                                    .includes(queryText)
                            }

                            return selectedChatType === item.chatType
                        })
                        .map((item) => (
                            <div
                                key={item.id}
                                className={classNames(
                                    'py-3 px-2 flex items-center gap-2 justify-between rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 relative cursor-pointer select-none',
                                    selectedChat.id === item.id &&
                                        'bg-gray-100 dark:bg-gray-700',
                                )}
                                role="button"
                                onClick={() =>
                                    handleChatClick({
                                        id: item.id,
                                        user: {
                                            id: item.userId || item.groupId,
                                            avatarImageUrl: item.avatar,
                                            name: item.name,
                                        },
                                        muted: item.muted,
                                        chatType: item.chatType,
                                        unread: item.unread,
                                    })
                                }
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div>
                                        <Avatar src={item.avatar} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between">
                                            <div className="font-bold heading-text truncate flex gap-2 items-center">
                                                <span>{item.name}</span>
                                                {item.muted && (
                                                    <TbVolumeOff className="opacity-60" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="truncate">
                                            {item.lastConversation}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 items-center">
                                    <small className="font-semibold">
                                        {moment
                                            .unix(item.time)
                                            .locale('fa')
                                            .format('hh:mm A')}
                                    </small>
                                    {item.unread > 0 && (
                                        <Badge className="bg-primary" />
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </ScrollBar>
            <NewChat />
        </div>
    )
}

export default ChatList
