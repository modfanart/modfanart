import { apiGetProductList } from '@/services/ProductService'
import useSWR from 'swr'
import { useProductListStore } from '../store/productListStore'
import type { GetProductListResponse } from '../types'
import type { TableQueries } from '@/@types/common'

const useProductList = () => {
    const {
        tableData,
        filterData,
        setTableData,
        setFilterData,
        selectedProduct,
        setSelectedProduct,
        setSelectAllProduct,
    } = useProductListStore((state) => state)

    const { data, error, isLoading, mutate } = useSWR(
        ['/api/products', { ...tableData, ...filterData }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) =>
            apiGetProductList<GetProductListResponse, TableQueries>(params),
        {
            revalidateOnFocus: false,
        },
    )

    const productList = data?.list || []

    const productListTotal = data?.total || 0

    return {
        error,
        isLoading,
        tableData,
        filterData,
        mutate,
        productList,
        productListTotal,
        setTableData,
        selectedProduct,
        setSelectedProduct,
        setSelectAllProduct,
        setFilterData,
    }
}

export default useProductList
