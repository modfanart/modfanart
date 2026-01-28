import ApiService from './ApiService'

export async function apiGetProductList<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/products',
        method: 'get',
        params,
    })
}

export async function apiGetProduct<T, U extends Record<string, unknown>>({
    id,
    ...params
}: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/products/${id}`,
        method: 'get',
        params,
    })
}
