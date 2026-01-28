import ApiService from './ApiService'

export async function apiPostChat<T>(data: {
    prompt: string
    attachments?: File[]
}) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/ai/chat',
        method: 'post',
        data,
    })
}

export async function apiGetChatHistory<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/ai/chat/history',
        method: 'get',
    })
}

export async function apiGetImages<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/ai/images',
        method: 'get',
        params,
    })
}

export async function apiPostImages<T, U extends Record<string, unknown>>(
    data: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/ai/images',
        method: 'post',
        data,
    })
}
