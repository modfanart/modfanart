import { useChatStore } from '../store/chatStore'
import { apiGetChats } from '@/services/ChatService'
import useSWRMutation from 'swr/mutation'
import type { GetChatsResponse } from '../types'

async function getChats() {
    const data = await apiGetChats<GetChatsResponse>()
    return data
}

const useChat = () => {
    const setChats = useChatStore((state) => state.setChats)
    const setChatsFetched = useChatStore((state) => state.setChatsFetched)

    const { trigger: fetchChats, isMutating: isChatsFetching } = useSWRMutation(
        `/api/chats/`,
        getChats,
        {
            onSuccess: (list) => {
                setChats(list)
                setChatsFetched(true)
            },
        },
    )

    return {
        fetchChats,
        isChatsFetching,
    }
}

export default useChat
