import { create } from 'zustand'
import type { ChatHistories, ChatHistory, Conversation } from '../types'

type RenameDialog = {
    id: string
    title: string
    open: boolean
}

export type GenerativeChatState = {
    selectedConversation: string
    selectedConversationRecord: string[]
    chatHistory: ChatHistories
    renameDialog: RenameDialog
    isTyping: boolean
}

type GenerativeChatAction = {
    setSelectedConversation: (payload: string) => void
    setSelectedConversationRecord: (payload: string) => void
    setChatHistory: (payload: ChatHistories) => void
    setChatHistoryName: (payload: { id: string; title: string }) => void
    setRenameDialog: (payload: RenameDialog) => void
    setIsTyping: (payload: boolean) => void
    pushChatHistory: (payload: ChatHistory) => void
    pushConversation: (id: string, conversation: Conversation) => void
    disabledChatFresh: (id: string) => void
}

const initialState: GenerativeChatState = {
    selectedConversation: '',
    selectedConversationRecord: [],
    chatHistory: [],
    renameDialog: {
        id: '',
        title: '',
        open: false,
    },
    isTyping: false,
}

export const usGenerativeChatStore = create<
    GenerativeChatState & GenerativeChatAction
>((set, get) => ({
    ...initialState,
    setSelectedConversation: (payload) =>
        set(() => ({ selectedConversation: payload })),
    setChatHistory: (payload) => set(() => ({ chatHistory: payload })),
    setChatHistoryName: (payload) =>
        set(() => {
            const chatHistory = get().chatHistory.map((chat) => {
                if (chat.id === payload.id) {
                    chat.title = payload.title
                }
                return chat
            })
            return { chatHistory }
        }),
    setRenameDialog: (payload) => set(() => ({ renameDialog: payload })),
    setSelectedConversationRecord: (payload) =>
        set(() => {
            let record = get().selectedConversationRecord

            if (record.includes(payload)) {
                record = record.filter((item) => item !== payload)
            } else {
                record.push(payload)
            }

            return { selectedConversationRecord: record }
        }),
    pushChatHistory: (payload) =>
        set(() => ({ chatHistory: [...[payload], ...get().chatHistory] })),
    pushConversation: (id, conversation) =>
        set(() => {
            const chatHistory = get().chatHistory.map((chat) => {
                if (chat.id === id) {
                    if (!chat.conversation) {
                        chat.conversation = []
                    }
                    chat.conversation?.push(conversation)
                }
                return chat
            })
            return { chatHistory }
        }),
    setIsTyping: (payload) => set(() => ({ isTyping: payload })),
    disabledChatFresh: () =>
        set(() => {
            const chatHistory = get().chatHistory.map((chat) => {
                if (chat.id === get().selectedConversation) {
                    chat.conversation = chat.conversation?.map(
                        (conversation) => {
                            if (conversation.fresh) {
                                conversation.fresh = false
                            }
                            return conversation
                        },
                    )
                }
                return chat
            })
            return { chatHistory }
        }),
}))
