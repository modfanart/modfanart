import ApiService from './ApiService'

export async function apiGetSettingsProfile<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/setting/profile',
        method: 'get',
    })
}

export async function apiGetSettingsNotification<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/setting/notification',
        method: 'get',
    })
}

export async function apiGetSettingsBilling<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/setting/billing',
        method: 'get',
    })
}

export async function apiGetSettingsIntergration<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/setting/intergration',
        method: 'get',
    })
}

export async function apiGetRolesPermissionsUsers<
    T,
    U extends Record<string, unknown>,
>(params: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/rbac/users',
        method: 'get',
        params,
    })
}

export async function apiGetRolesPermissionsRoles<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/rbac/roles',
        method: 'get',
    })
}

export async function apiGetPricingPlans<T>() {
    return ApiService.fetchDataWithAxios<T>({
        url: '/pricing',
        method: 'get',
    })
}
