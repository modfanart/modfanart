import { create } from 'zustand'
import type { ProductOption, Products, SelectedProduct } from '../types'

export type OrderFormState = {
    productList: Products
    productOption: ProductOption[]
    selectedProduct: SelectedProduct[]
}

type OrderFormAction = {
    setProductList: (payload: Products) => void
    setProductOption: (payload: ProductOption[]) => void
    setSelectedProduct: (payload: SelectedProduct[]) => void
}

const initialState: OrderFormState = {
    productList: [],
    productOption: [],
    selectedProduct: [],
}

export const useOrderFormStore = create<OrderFormState & OrderFormAction>(
    (set) => ({
        ...initialState,
        setProductOption: (payload) => set(() => ({ productOption: payload })),
        setProductList: (payload) => set(() => ({ productList: payload })),
        setSelectedProduct: (payload) =>
            set(() => ({ selectedProduct: payload })),
    }),
)
