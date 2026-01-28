export type Period = 'thisMonth' | 'thisWeek' | 'thisYear'

export type StatisticCategory = 'totalProfit' | 'totalOrder' | 'totalImpression'

export type ChannelRevenue = Record<
    Period,
    {
        value: number
        growShrink: number
        percentage: {
            onlineStore: number
            physicalStore: number
            socialMedia: number
        }
    }
>

export type SalesTargetData = Record<
    Period,
    {
        target: number
        achieved: number
        percentage: number
    }
>

export type Product = {
    id: string
    name: string
    productCode: string
    img: string
    sales: number
    growShrink: number
}

export type CustomerDemographicData = {
    id: string
    name: string
    value: number
    coordinates: [number, number]
}

export type PeriodData = {
    value: number
    growShrink: number
    comparePeriod: string
    chartData: {
        series: {
            name: string
            data: number[]
        }[]
        date: string[]
    }
}

export type StatisticData = Record<
    StatisticCategory,
    Record<Period, PeriodData>
>

export type Order = {
    id: string
    date: number
    customer: string
    status: number
    paymentMehod: string
    paymentIdendifier: string
    totalAmount: number
}

export type GetEcommerceDashboardResponse = {
    statisticData: StatisticData
    recentOrders: Order[]
    salesTarget: SalesTargetData
    topProduct: Product[]
    customerDemographic: CustomerDemographicData[]
    revenueByChannel: ChannelRevenue
}
