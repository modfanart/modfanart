import ApiService from './ApiService'

export async function apiGetLogs<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/logs',
        method: 'get',
        params,
    })
}
