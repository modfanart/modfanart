import ApiService from './ApiService'

export async function apiGetFiles<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/files',
        method: 'get',
        params,
    })
}
