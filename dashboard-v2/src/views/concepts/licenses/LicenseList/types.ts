export type Order = {
    id: string
    date: number
    customer: string
    status: number
    paymentMehod: string
    paymentIdendifier: string
    totalAmount: number
}

export type Orders = Order[]

export type Filter = {
    date: [Date, Date]
    status: string
    paymentMethod: string[]
}

export type GetOrdersResponse = {
    list: Orders
    total: number
}
