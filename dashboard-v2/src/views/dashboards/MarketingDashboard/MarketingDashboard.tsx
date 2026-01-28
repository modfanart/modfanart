import Loading from '@/components/shared/Loading'
import KpiSummary from './components/KpiSummary'
import RecentCampaign from './components/RecentCampaign'
import AdsPerformance from './components/AdsPerformance'
import LeadPerformance from './components/LeadPerformance'
import { apiGetMarketingDashboard } from '@/services/DashboardService'
import useSWR from 'swr'
import type { GetMarketingDashboardResponse } from './types'

const MarketingDashboard = () => {
    const { data, isLoading } = useSWR(
        ['/api/dashboard/marketing'],
        () => apiGetMarketingDashboard<GetMarketingDashboardResponse>(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
        },
    )

    return (
        <Loading loading={isLoading}>
            {data && (
                <div className="flex flex-col gap-4">
                    <KpiSummary data={data.kpiSummary} />
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-y-4 xl:gap-x-4">
                        <div className="col-span-2">
                            <AdsPerformance data={data.adsPerformance} />
                        </div>
                        <LeadPerformance data={data.leadPerformance} />
                    </div>
                    <RecentCampaign data={data.recentCampaign} />
                </div>
            )}
        </Loading>
    )
}

export default MarketingDashboard
