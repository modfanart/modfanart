import ApiService from './ApiService'

export async function apiGetChats<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/chats',
        method: 'get',
    })
}

export async function apiGetConversation<T>({ id }: { id: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/conversation/${id}`,
        method: 'get',
    })
}

export async function apiGetContacts<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/contacts`,
        method: 'get',
    })
}

export async function apiGetContactDetails<T>({ id }: { id: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/contacts/${id}`,
        method: 'get',
    })
}
