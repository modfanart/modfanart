import ApiService from './ApiService'

export async function apiGetCalendar<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/calendar',
        method: 'get',
    })
}
