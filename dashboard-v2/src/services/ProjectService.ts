import ApiService from './ApiService'

export async function apiGetProjects<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/projects',
        method: 'get',
    })
}

export async function apiPostProject<T, U extends Record<string, unknown>>(
    data: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/projects',
        method: 'post',
        data,
    })
}

export async function apiGetProject<T, U extends Record<string, unknown>>({
    id,
    ...params
}: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/projects/${id}`,
        method: 'get',
        params,
    })
}

export async function apiGetScrumBoards<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/projects/scrum-board',
        method: 'get',
    })
}

export async function apiGetProjectMembers<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/projects/scrum-board/members',
        method: 'get',
    })
}

export async function apiGetProjectTasks<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/projects/tasks',
        method: 'get',
    })
}

export async function apiGetProjectTask<T, U extends Record<string, unknown>>({
    id,
    ...params
}: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/projects/tasks/${id}`,
        method: 'get',
        params,
    })
}
