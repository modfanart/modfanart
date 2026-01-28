import ApiService from './ApiService'

export async function apiGetEcommerceDashboard<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/dashboard/ecommerce',
        method: 'get',
    })
}

export async function apiGetProjectDashboard<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/dashboard/project',
        method: 'get',
    })
}

export async function apiGetAnalyticDashboard<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/dashboard/analytic',
        method: 'get',
    })
}

export async function apiGetMarketingDashboard<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/dashboard/marketing',
        method: 'get',
    })
}
