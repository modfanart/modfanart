/* eslint-disable @typescript-eslint/no-explicit-any */
import wildCardSearch from '@/utils/wildCardSearch'
import sortBy, { Primer } from '@/utils/sortBy'
import paginate from '@/utils/paginate'
import { mock } from '../MockAdapter'
import {
    profileData,
    notificationSettingsData,
    billingSettingsData,
    intergrationSettingData,
    roleGroupsData,
    pricingPlansData,
} from '../data/accountsData'
import { userDetailData } from '../data/usersData'

mock.onGet(`/api/setting/profile`).reply(() => {
    return [200, profileData]
})

mock.onGet(`/api/setting/notification`).reply(() => {
    return [200, notificationSettingsData]
})

mock.onGet(`/api/setting/billing`).reply(() => {
    return [200, billingSettingsData]
})

mock.onGet(`/api/setting/intergration`).reply(() => {
    return [200, intergrationSettingData]
})

mock.onGet(`/api/rbac/users`).reply((config) => {
    const { pageIndex, pageSize, sort, query, status, role } = config.params

    const { order, key } = sort

    const users = userDetailData as any[]

    const sanitizeUsers = users.filter((elm) => typeof elm !== 'function')
    let data = sanitizeUsers
    let total = users.length

    if (key && order) {
        if (key !== 'lastOnline') {
            data.sort(
                sortBy(key, order === 'desc', (a) =>
                    (a as string).toUpperCase(),
                ),
            )
        } else {
            data.sort(sortBy(key, order === 'desc', parseInt as Primer))
        }
    }

    if (status) {
        data = data.filter((item) => item.status === status)
    }

    if (role) {
        data = data.filter((item) => item.role === role)
    }

    if (query) {
        data = wildCardSearch(data, query)
    }

    total = data.length
    data = paginate(data, pageSize, pageIndex)

    const responseData = {
        list: data,
        total: total,
    }

    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve([200, responseData])
        }, 500)
    })
})

mock.onGet(`/api/rbac/roles`).reply(() => {
    const users = userDetailData

    const roleGroup = roleGroupsData.map((group) => {
        group.users = users.filter((user) => user.role === group.id) as any
        return group
    })

    return [200, roleGroup]
})

mock.onGet(`/api/pricing`).reply(() => {
    return [200, pricingPlansData]
})
