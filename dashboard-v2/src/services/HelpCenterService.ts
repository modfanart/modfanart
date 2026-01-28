import ApiService from './ApiService'

export async function apiGetSupportHubCategories<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/helps/categories',
        method: 'get',
    })
}

export async function apiGetSupportHubArticles<
    T,
    U extends Record<string, unknown>,
>(params: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/helps/articles',
        method: 'get',
        params,
    })
}

export async function apiGetSupportHubArticle<T>({ id }: { id: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/helps/articles/${id}`,
        method: 'get',
    })
}

export async function apiGetArticleList<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/helps/manage/articles',
        method: 'get',
        params,
    })
}
