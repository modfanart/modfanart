export type Campagin = {
    id: string
    name: string
    startDate: number
    endDate: number
    budget: number
    leadsGenerated: number
    conversions: number
    conversionRate: number
    status: string
    type: string
    audienceGroup: string[]
}

export type KpiSummaryData = Record<
    string,
    {
        value: number
        growShrink: number
    }
>

export type AdsPerformanceData = {
    campagin: number[]
    email: number[]
    label: string[]
}

export type LeadPerformanceData = {
    categories: string[]
    series: number[]
}

export type GetMarketingDashboardResponse = {
    kpiSummary: KpiSummaryData
    adsPerformance: AdsPerformanceData
    recentCampaign: Campagin[]
    leadPerformance: LeadPerformanceData
}
