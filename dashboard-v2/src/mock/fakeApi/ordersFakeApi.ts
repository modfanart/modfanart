/* eslint-disable @typescript-eslint/no-explicit-any */
import wildCardSearch from '@/utils/wildCardSearch'
import sortBy, { Primer } from '@/utils/sortBy'
import paginate from '@/utils/paginate'
import { mock } from '../MockAdapter'
import { ordersData, orderDetailsData } from '../data/ordersData'

mock.onGet(`/api/orders`).reply((config) => {
    const { pageIndex, pageSize, sort, query } = config.params

    const { order, key } = sort

    const orders = ordersData as any[]

    const sanitizeorders = orders.filter((elm) => typeof elm !== 'function')
    let data = sanitizeorders
    let total = orders.length

    if (key && order) {
        if (key === 'category' || key === 'name') {
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
        data = wildCardSearch(data, query, 'id')
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

mock.onGet(/\/api\/orders\/\d+/).reply(function (config) {
    const id = config.url?.split('/')[2]
    const order = ordersData.find((order) => order.id === id)

    if (!order) {
        return [404, {}]
    }
    orderDetailsData.id = order.id
    orderDetailsData.paymentStatus = order.status

    return [200, orderDetailsData]
})
