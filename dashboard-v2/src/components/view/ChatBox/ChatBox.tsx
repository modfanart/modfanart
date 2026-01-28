import { forwardRef } from 'react'
import ChatContainer from './components/ChatContainer'
import MessageList from './components/MessageList'
import ChatInput from './components/ChatInput'
import type { MessageListProps } from './components/MessageList'
import type { ChatContainerProps } from './components/ChatContainer'
import type { ChatInputProps } from './components/ChatInput'
import type { ReactNode } from 'react'
import type { ScrollBarRef } from './types'

export type MessageList = MessageListProps['list']

export type ChatBoxProps = {
    messageList: MessageList
    header?: ChatContainerProps['header']
    showMessageList?: boolean
    children?: ReactNode
    containerClass?: string
} & Omit<MessageListProps, 'list'> &
    ChatInputProps

const ChatBox = forwardRef<ScrollBarRef, ChatBoxProps>((props, ref) => {
    const {
        messageList,
        showMessageList = true,
        children,
        header,
        placeholder,
        onInputChange,
        showAvatar,
        avatarGap,
        customRenderer,
        customAction,
        bubbleClass,
        typing,
        messageListClass,
        containerClass,
    } = props

    return (
        <ChatContainer
            className={containerClass}
            header={header}
            input={
                <ChatInput
                    placeholder={placeholder}
                    onInputChange={onInputChange}
                />
            }
        >
            {showMessageList && (
                <MessageList
                    ref={ref}
                    list={messageList}
                    showAvatar={showAvatar}
                    avatarGap={avatarGap}
                    customRenderer={customRenderer}
                    customAction={customAction}
                    typing={typing}
                    messageListClass={messageListClass}
                    bubbleClass={bubbleClass}
                />
            )}
            {children}
        </ChatContainer>
    )
})

ChatBox.displayName = 'ChatBox'

export default ChatBox
