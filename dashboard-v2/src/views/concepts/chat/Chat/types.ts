export type ChatType = 'personal' | 'groups'

export type Chat = {
    id: string
    name: string
    userId: string
    avatar: string
    unread: number
    time: number
    lastConversation: string
    muted: boolean
    chatType: ChatType
    groupId: string
}

export type Message = {
    id: string
    sender: {
        id: string
        name: string
        avatarImageUrl: string
    }
    attachments?: Array<{
        type: 'image' | 'video' | 'audio' | 'misc'
        source: File
        mediaUrl: string
    }>
    content: string
    timestamp: number | Date
    type: 'regular' | 'reply' | 'deleted' | 'divider'
    isMyMessage: boolean
    showAvatar?: boolean
}

export type SelectedChat = {
    id?: string
    user?: {
        id: string
        name: string
        avatarImageUrl: string
    }
    muted?: boolean
    chatType?: ChatType
    members?: {
        id: string
        name: string
        avatarImageUrl: string
    }
}

export type Messages = Message[]

export type Conversation = {
    id: string
    conversation: Messages
}

export type Conversations = Conversation[]

export type Chats = Chat[]

export type UserDetails = {
    id: string
    name: string
    email: string
    img: string
    role: string
    lastOnline: number
    status: string
    title: string
    personalInfo: {
        birthday: string
        phoneNumber: string
    }
    members: {
        id: string
        name: string
        img: string
        email: string
    }[]
}

export type GetChatsResponse = Chats

export type GetConversationResponse = Conversation

export type GetContactsResponse = UserDetails[]

export type GetContactDetailResponse = {
    userDetails: UserDetails
    media: {
        images: {
            id: string
            url: string
            name: string
        }[]
        files: {
            id: string
            name: string
            fileType: string
            srcUrl: string
            size: number
        }[]
        links: {
            id: string
            favicon: string
            title: string
            description: string
            url: string
        }[]
    }
}
