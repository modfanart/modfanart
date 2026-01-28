import ChatSideNav from './components/ChatSideNav'
import ChatView from './components/ChatView'
import ChatHistoryRenameDialog from './components/ChatHistoryRenameDialog'
import useResponsive from '@/utils/hooks/useResponsive'

const GenerativeChat = () => {
    const { larger } = useResponsive()

    return (
        <div className="h-full">
            <div className="flex flex-auto gap-4 h-full">
                <ChatView />
                {larger.xl && <ChatSideNav />}
                <ChatHistoryRenameDialog />
            </div>
        </div>
    )
}

export default GenerativeChat
