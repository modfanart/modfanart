export type Product = {
    id: string
    name: string
    productCode: string
    img: string
    price: number
    quantity: number
    total: number
    details: Record<string, string[]>
}

export type Products = Product[]

export type PaymentSummary = {
    subTotal: number
    tax: number
    deliveryFees: number
    total: number
    customerPayment: number
}

export type Activity = {
    date: number
    events: {
        time: number
        action: string
        recipient?: string
    }[]
}

export type Activities = Activity[]

export type Customer = {
    name: string
    email: string
    phone: string
    img: string
    previousOrder: number
    shippingAddress: {
        line1: string
        line2: string
        line3: string
        line4: string
    }
    billingAddress: {
        line1: string
        line2: string
        line3: string
        line4: string
    }
}

export type GetOrderDetailsResponse = {
    id: string
    progressStatus: number
    paymentStatus: number
    dateTime: number
    paymentSummary: PaymentSummary
    note: string
    shipping: {
        deliveryFees: number
        estimatedMin: number
        estimatedMax: number
        shippingLogo: string
        shippingVendor: string
    }
    product: Products
    activity: {
        date: number
        events: {
            time: number
            action: string
            recipient?: string
        }[]
    }[]
    customer: Customer
}
