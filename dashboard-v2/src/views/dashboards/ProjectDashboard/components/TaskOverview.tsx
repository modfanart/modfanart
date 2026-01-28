import { useState } from 'react'
import Card from '@/components/ui/Card'
import Segment from '@/components/ui/Segment'
import Badge from '@/components/ui/Badge'
import Chart from '@/components/shared/Chart'
import { COLORS } from '@/constants/chart.constant'
import isEmpty from 'lodash/isEmpty'
import type { TaskOverviewChart } from '../types'

type TaskOverviewProps = {
    data?: Record<string, TaskOverviewChart>
}

type ChartLegendProps = {
    label: string
    value: number
    color?: string
    showBadge?: boolean
}

const ChartLegend = ({
    label,
    value,
    color,
    showBadge = true,
}: ChartLegendProps) => {
    return (
        <div className="flex gap-2">
            {showBadge && (
                <Badge className="mt-2.5" style={{ backgroundColor: color }} />
            )}
            <div>
                <h5 className="font-bold">{value}</h5>
                <p>{label}</p>
            </div>
        </div>
    )
}

const TaskOverview = ({ data }: TaskOverviewProps) => {
    const [timeRange, setTimeRange] = useState('weekly')

    return (
        <Card>
            <div className="flex sm:flex-row flex-col md:items-center justify-between mb-6 gap-4">
                <h4>نظرسنجی کارها</h4>
                <Segment
                    value={timeRange}
                    size="sm"
                    onChange={(val) => setTimeRange(val as string)}
                >
                    <Segment.Item value="daily">روزانه</Segment.Item>
                    <Segment.Item value="weekly">هفتگی</Segment.Item>
                </Segment>
            </div>
            {!isEmpty(data) && (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <ChartLegend
                                showBadge={false}
                                label="کارهای کل"
                                value={data[timeRange].total}
                            />
                        </div>
                        <div className="flex gap-x-6">
                            <ChartLegend
                                color={COLORS[7]}
                                label={data[timeRange].series[0].name}
                                value={data[timeRange].onGoing}
                            />
                            <ChartLegend
                                color={COLORS[8]}
                                label={data[timeRange].series[1].name}
                                value={data[timeRange].finished}
                            />
                        </div>
                    </div>
                    <div>
                        <Chart
                            series={data[timeRange].series}
                            xAxis={data[timeRange].range}
                            type="bar"
                            customOptions={{
                                colors: [COLORS[7], COLORS[8]],
                                legend: { show: false },
                                plotOptions: {
                                    bar: {
                                        columnWidth: '15px',
                                        borderRadius: 4,
                                        borderRadiusApplication: 'end',
                                    },
                                },
                            }}
                        />
                    </div>
                </>
            )}
        </Card>
    )
}

export default TaskOverview
