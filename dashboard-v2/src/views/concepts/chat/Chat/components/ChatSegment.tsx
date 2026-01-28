import Segment from '@/components/ui/Segment'
import { TbUserCircle, TbUsers } from 'react-icons/tb'
import { useChatStore } from '../store/chatStore'
import type { ChatType } from '../types'

const ChatSegment = () => {
    const selectedChatType = useChatStore((state) => state.selectedChatType)
    const setSelectedChatType = useChatStore(
        (state) => state.setSelectedChatType,
    )

    return (
        <Segment
            className="w-full"
            value={selectedChatType}
            onChange={(value) => setSelectedChatType(value as ChatType)}
        >
            <Segment.Item className="flex-1" value="personal">
                <div className="flex items-center justify-center gap-2">
                    <TbUserCircle className="text-xl" />
                    <span>شخصی</span>
                </div>
            </Segment.Item>
            <Segment.Item className="flex-1" value="groups">
                <div className="flex items-center justify-center gap-2">
                    <TbUsers className="text-xl" />
                    <span>گروه ها</span>
                </div>
            </Segment.Item>
        </Segment>
    )
}

export default ChatSegment
