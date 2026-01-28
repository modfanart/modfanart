import { useState } from 'react'
import Loading from '@/components/shared/Loading'
import AnalyticHeader from './components/AnalyticHeader'
import Metrics from './components/Metrics'
import WebAnalytic from './components/AnalyticChart'
import Traffic from './components/Traffic'
import TopChannel from './components/TopChannel'
import DeviceSession from './components/DeviceSession'
import TopPerformingPages from './components/TopPerformingPages'
import { apiGetAnalyticDashboard } from '@/services/DashboardService'
import useSWR from 'swr'
import type { GetAnalyticDashboardResponse, Period } from './types'

const AnalyticDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('thisMonth')

    const { data, isLoading } = useSWR(
        ['/api/dashboard/analytic'],
        () => apiGetAnalyticDashboard<GetAnalyticDashboardResponse>(),
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
                    <AnalyticHeader
                        selectedPeriod={selectedPeriod}
                        onSelectedPeriodChange={setSelectedPeriod}
                    />
                    <div className="flex flex-col 2xl:grid grid-cols-4 gap-4">
                        <div className="col-span-4 2xl:col-span-3">
                            <WebAnalytic
                                data={data[selectedPeriod].webAnalytic}
                            />
                        </div>
                        <div className="2xl:col-span-1">
                            <Metrics
                                data={data[selectedPeriod].metrics}
                                selectedPeriod={selectedPeriod}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-6 xl:col-span-4">
                            <TopPerformingPages
                                data={data[selectedPeriod].topPages}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6 xl:col-span-4">
                            <DeviceSession
                                data={data[selectedPeriod].deviceSession}
                            />
                        </div>
                        <div className="col-span-12 xl:col-span-4">
                            <TopChannel
                                data={data[selectedPeriod].topChannel}
                            />
                        </div>
                        <div className="col-span-12">
                            <Traffic data={data[selectedPeriod].traffic} />
                        </div>
                    </div>
                </div>
            )}
        </Loading>
    )
}

export default AnalyticDashboard
