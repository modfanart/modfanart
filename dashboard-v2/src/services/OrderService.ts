import ApiService from './ApiService'

export async function apiGetOrderList<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/orders',
        method: 'get',
        params,
    })
}

export async function apiGetOrder<T, U extends Record<string, unknown>>({
    id,
    ...params
}: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/orders/${id}`,
        method: 'get',
        params,
    })
}
