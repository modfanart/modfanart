import type { Control, FieldErrors } from 'react-hook-form'

export type Product = {
    id: string
    name: string
    productCode: string
    img: string
    imgList: {
        id: string
        name: string
        img: string
    }[]
    category: string
    price: number
    stock: number
    status: number
    costPerItem: number
    bulkDiscountPrice: number
    taxRate: number | string
    tag: string[]
    brand: string
    vendor: string
    active: boolean
    sales: number
    salesPercentage: number
    description: string
}

export type GeneralFields = {
    name: string
    productCode: string
    description: string
}

export type PricingFields = {
    price: number | string
    taxRate: number | string
    costPerItem: number | string
    bulkDiscountPrice: number | string
}

export type ImageFields = {
    imgList: {
        id: string
        name: string
        img: string
    }[]
}

export type AttributeFields = {
    category: string
    tags?: { label: string; value: string }[]
    brand?: string
}

export type ProductFormSchema = GeneralFields &
    PricingFields &
    ImageFields &
    AttributeFields

export type FormSectionBaseProps = {
    control: Control<ProductFormSchema>
    errors: FieldErrors<ProductFormSchema>
}
