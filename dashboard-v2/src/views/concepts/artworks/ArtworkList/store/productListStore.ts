import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { Product, Filter } from '../types'

export const initialTableData: TableQueries = {
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: {
        order: '',
        key: '',
    },
}

export const initialFilterData = {
    minAmount: 0,
    maxAmount: 5000,
    productStatus: 'published',
    productType: ['Bags', 'Cloths', 'Devices', 'Shoes', 'Watches'],
}

export type ProductsListState = {
    tableData: TableQueries
    filterData: Filter
    selectedProduct: Partial<Product>[]
}

type ProductsListAction = {
    setFilterData: (payload: Filter) => void
    setTableData: (payload: TableQueries) => void
    setSelectedProduct: (checked: boolean, customer: Product) => void
    setSelectAllProduct: (customer: Product[]) => void
}

const initialState: ProductsListState = {
    tableData: initialTableData,
    filterData: initialFilterData,
    selectedProduct: [],
}

export const useProductListStore = create<
    ProductsListState & ProductsListAction
>((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setTableData: (payload) => set(() => ({ tableData: payload })),
    setSelectedProduct: (checked, row) =>
        set((state) => {
            const prevData = state.selectedProduct
            if (checked) {
                return { selectedProduct: [...prevData, ...[row]] }
            } else {
                if (prevData.some((prevProduct) => row.id === prevProduct.id)) {
                    return {
                        selectedProduct: prevData.filter(
                            (prevProduct) => prevProduct.id !== row.id,
                        ),
                    }
                }
                return { selectedProduct: prevData }
            }
        }),
    setSelectAllProduct: (row) => set(() => ({ selectedProduct: row })),
}))
