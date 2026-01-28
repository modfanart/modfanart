import { apiGetOrderList } from '@/services/OrderService'
import useSWR from 'swr'
import { useOrderListStore } from '../store/orderListStore'
import type { GetOrdersResponse } from '../types'
import type { TableQueries } from '@/@types/common'

export default function useOrderList() {
    const { tableData, filterData, setTableData, setFilterData } =
        useOrderListStore((state) => state)

    const { data, error, isLoading, mutate } = useSWR(
        ['/api/orders', { ...tableData, ...filterData }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) =>
            apiGetOrderList<GetOrdersResponse, TableQueries>(params),
        {
            revalidateOnFocus: false,
        },
    )

    const orderList = data?.list || []

    const orderListTotal = data?.total || 0

    return {
        orderList,
        orderListTotal,
        error,
        isLoading,
        tableData,
        filterData,
        mutate,
        setTableData,
        setFilterData,
    }
}
