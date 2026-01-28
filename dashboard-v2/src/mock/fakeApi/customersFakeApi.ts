/* eslint-disable @typescript-eslint/no-explicit-any */
import wildCardSearch from '@/utils/wildCardSearch'
import sortBy, { Primer } from '@/utils/sortBy'
import paginate from '@/utils/paginate'
import { mock } from '../MockAdapter'
import { userDetailData } from '../data/usersData'
import { customerActivityLog } from '../data/logData'

mock.onGet(`/api/customers`).reply((config) => {
    console.log('params', config.params)
    const { pageIndex, pageSize, sort, query } = config.params

    const { order, key } = sort

    const users = userDetailData as any[]

    const sanitizeUsers = users.filter((elm) => typeof elm !== 'function')
    let data = sanitizeUsers
    let total = users.length

    if (key && order) {
        if (key !== 'totalSpending') {
            data.sort(
                sortBy(key, order === 'desc', (a) =>
                    (a as string).toUpperCase(),
                ),
            )
        } else {
            data.sort(sortBy(key, order === 'desc', parseInt as Primer))
        }
    }

    if (query) {
        data = wildCardSearch(data, query)
        total = data.length
    }

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

mock.onGet(new RegExp(`/api/customers/*`)).reply(function (config) {
    const id = config.url?.split('/')[2]

    const user = userDetailData.find((user) => user.id === id)

    if (!user) {
        return [404, {}]
    }

    return [200, user]
})

mock.onGet(new RegExp(`/api/customer/log`)).reply(() => {
    return [200, customerActivityLog]
})
