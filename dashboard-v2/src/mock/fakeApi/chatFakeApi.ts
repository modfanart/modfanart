import { mock } from '../MockAdapter'
import {
    chatList,
    conversationList,
    mediaData,
    groupsData,
} from '../data/chatData'
import { userDetailData } from '../data/usersData'

mock.onGet(`/api/chats`).reply(() => {
    return [200, chatList]
})

mock.onGet(`/api/conversation`).reply(() => {
    return [200, chatList]
})

mock.onGet(new RegExp(`/api/conversation*`)).reply((config) => {
    const urlSegment = config.url?.split('/')
    const id = urlSegment?.[(urlSegment?.length || 0) - 1]
    const conversation = conversationList.find(
        (conversation) => conversation.id === id,
    )

    if (!conversation) {
        return [404, {}]
    }

    return [200, conversation]
})

mock.onGet(`/api/contacts`).reply(() => {
    const contactsId = ['4', '8', '6', '3', '2', '9']
    const contacts = userDetailData.filter(
        (user) => !contactsId.includes(user.id),
    )
    return [200, contacts]
})

mock.onGet(new RegExp(`/api/contacts*`)).reply((config) => {
    const urlSegment = config.url?.split('/')
    const id = urlSegment?.[(urlSegment?.length || 0) - 1]

    const groupsId = ['16', '17', '18']

    const userDetails = groupsId.includes(id || '')
        ? groupsData.find((user) => user.id === id)
        : userDetailData.find((user) => user.id === id)

    return [
        200,
        {
            userDetails,
            media: mediaData,
        },
    ]
})
