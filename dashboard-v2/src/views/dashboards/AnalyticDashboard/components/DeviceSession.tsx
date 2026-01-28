import Card from '@/components/ui/Card'
import Chart from '@/components/shared/Chart'
import { COLORS } from '@/constants/chart.constant'
import { TbDeviceDesktop, TbDeviceMobile, TbDeviceTablet } from 'react-icons/tb'
import type { DeviceSessionData } from '../types'

type DeviceSessionProps = {
    data: DeviceSessionData
}

const DeviceSession = ({ data }: DeviceSessionProps) => {
    return (
        <Card>
            <div className="flex items-center justify-between">
                <h4>دستگاه‌های جلسه</h4>
            </div>
            <div className="mt-6">
                <Chart
                    height={280}
                    series={data.series}
                    customOptions={{
                        colors: [COLORS[0], COLORS[7], COLORS[8]],
                        labels: data.labels,
                        plotOptions: {
                            pie: {
                                donut: {
                                    labels: {
                                        show: true,
                                        total: {
                                            show: true,
                                            showAlways: true,
                                            label: '',
                                            formatter: function () {
                                                return ''
                                            },
                                        },
                                    },
                                    size: '75%',
                                },
                            },
                        },
                    }}
                    type="donut"
                />
            </div>
            <div className="mt-8 flex justify-center gap-12 mx-auto">
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-3xl" style={{ color: COLORS[0] }}>
                        <TbDeviceDesktop />
                    </div>
                    <div className="text-center">
                        <span>دسکتاپ</span>
                        <h5>{data.percentage[0]}%</h5>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-3xl" style={{ color: COLORS[7] }}>
                        <TbDeviceMobile />
                    </div>
                    <div className="text-center">
                        <span>موبایل</span>
                        <h5>{data.percentage[1]}%</h5>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-3xl" style={{ color: COLORS[8] }}>
                        <TbDeviceTablet />
                    </div>
                    <div className="text-center">
                        <span>تبلت</span>
                        <h5>{data.percentage[2]}%</h5>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default DeviceSession
