import ApiService from './ApiService'

export async function apiGetMails<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/mails',
        method: 'get',
        params,
    })
}

export async function apiGetMail<T, U extends Record<string, unknown>>({
    id,
}: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/mails/${id}`,
        method: 'get',
    })
}
