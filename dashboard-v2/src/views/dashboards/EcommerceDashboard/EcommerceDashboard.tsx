import Loading from '@/components/shared/Loading'
import Overview from './components/Overview'
import CustomerDemographic from './components/CustomerDemographic'
import RecentOrder from './components/RecentOrder'
import SalesTarget from './components/SalesTarget'
import TopProduct from './components/TopProduct'
import RevenueByChannel from './components/RevenueByChannel'
import { apiGetEcommerceDashboard } from '@/services/DashboardService'
import useSWR from 'swr'
import type { GetEcommerceDashboardResponse } from './types'

const SalesDashboard = () => {
    const { data, isLoading } = useSWR(
        ['/api/dashboard/ecommerce'],
        () => apiGetEcommerceDashboard<GetEcommerceDashboardResponse>(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
        },
    )

    return (
        <Loading loading={isLoading}>
            {data && (
                <div>
                    <div className="flex flex-col gap-4 max-w-full overflow-x-hidden">
                        <div className="flex flex-col xl:flex-row gap-4">
                            <div className="flex flex-col gap-4 flex-1 xl:col-span-3">
                                <Overview data={data.statisticData} />
                                <CustomerDemographic
                                    data={data.customerDemographic}
                                />
                            </div>
                            <div className="flex flex-col gap-4 2xl:min-w-[360px]">
                                <SalesTarget data={data.salesTarget} />
                                <TopProduct data={data.topProduct} />
                                <RevenueByChannel data={data.revenueByChannel} />
                            </div>
                        </div>

                        <RecentOrder data={data.recentOrders} />
                    </div>
                </div>
            )}
        </Loading>
    )
}

export default SalesDashboard
