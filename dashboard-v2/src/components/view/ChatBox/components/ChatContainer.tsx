import type { ReactNode } from 'react'
import type { CommonProps } from '@/@types/common'
import classNames from '@/utils/classNames'

export interface ChatContainerProps extends CommonProps {
    header?: ReactNode
    input?: ReactNode
}

const ChatContainer = (props: ChatContainerProps) => {
    const { header, children, className, input } = props

    return (
        <div
            className={classNames(
                'h-full flex flex-col justify-between',
                className,
            )}
        >
            {header}
            {children}
            {input}
        </div>
    )
}

export default ChatContainer
