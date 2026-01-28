import { useState, useMemo } from 'react'
import Card from '@/components/ui/Card'
import Segment from '@/components/ui/Segment'
import ApexChart from 'react-apexcharts'
import { COLORS } from '@/constants/chart.constant'
import type { AdsPerformanceData } from '../types'

type AdsPerformance = {
    data: AdsPerformanceData
}

const AdsPerformance = ({ data }: AdsPerformance) => {
    const [category, setCategory] = useState('all')

    const series = useMemo(() => {
        const campaignSeries = {
            name: 'کمپین (ROI)',
            type: 'column',
            data: data.campagin,
            color: function ({
                dataPointIndex,
                value,
            }: {
                dataPointIndex: number
                value: number
            }) {
                if (
                    dataPointIndex > 0 &&
                    value < data.campagin[dataPointIndex - 1]
                ) {
                    return COLORS[7]
                }
                return COLORS[9]
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
        }

        const emailSeries = {
            name: 'ایمیل (ROI)',
            type: 'line',
            data: data.email,
            color: COLORS[0],
        }

        if (category === 'all') {
            return [campaignSeries, emailSeries]
        }

        if (category === 'campagin') {
            return [campaignSeries]
        }

        if (category === 'email') {
            return [emailSeries]
        }

        return []
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category])

    return (
        <Card>
            <div className="flex items-center justify-between">
                <h4>عملکرد تبلیغات</h4>
                <div>
                    <Segment
                        className="gap-1"
                        value={category}
                        size="sm"
                        onChange={(val) => setCategory(val as string)}
                    >
                        <Segment.Item value="all">همه</Segment.Item>
                        <Segment.Item value="campagin">کمپین</Segment.Item>
                        <Segment.Item value="email">ایمیل</Segment.Item>
                    </Segment>
                </div>
            </div>
            <div className="mt-6">
                <ApexChart
                    options={{
                        chart: {
                            type: 'line',
                            zoom: {
                                enabled: false,
                            },
                            toolbar: {
                                show: false,
                            },
                        },
                        legend: {
                            show: false,
                        },
                        stroke: {
                            width: category === 'email' ? 2.5 : [0, 2.5],
                            curve: 'smooth',
                            lineCap: 'round',
                        },
                        tooltip: {
                            custom: function ({ series, dataPointIndex }) {
                                const renderCampaignData = () => `
                                        <div class="flex items-center gap-2">
                                            <div class="h-[10px] w-[10px] rounded-full" style="background-color: ${COLORS[9]}"></div>
                                            <div class="flex gap-2">کمپین: <span class="font-bold">${series[0][dataPointIndex]}</span></div>
                                        </div>
                                    `
                                const renderEmailData = () => `
                                        <div class="flex items-center gap-2">
                                            <div class="h-[10px] w-[10px] rounded-full" style="background-color: ${
                                                COLORS[0]
                                            }"></div>
                                            <div class="flex gap-2">ایمیل: <span class="font-bold">${
                                                series[
                                                    category === 'all' ? 1 : 0
                                                ][dataPointIndex]
                                            }</span></div>
                                        </div>
                                    `
                                const render = () => {
                                    switch (category) {
                                        case 'all':
                                            return `${renderCampaignData()}${renderEmailData()}`
                                        case 'campagin':
                                            return renderCampaignData()
                                        case 'email':
                                            return renderEmailData()
                                        default:
                                            return ''
                                    }
                                }
                                return `
                                        <div class="py-2 px-4 rounded-xl">
                                            <div class="flex flex-col gap-2">
                                                <div>${
                                                    data.label[dataPointIndex]
                                                }</div>
                                                ${render()}
                                            </div>
                                        </div>
                                    `
                            },
                        },
                        labels: data.label,
                        yaxis:
                            category === 'all'
                                ? [
                                      {},
                                      {
                                          opposite: true,
                                      },
                                  ]
                                : [],
                        plotOptions: {
                            bar: {
                                horizontal: false,
                                columnWidth: '35px',
                                borderRadius: 4,
                                borderRadiusApplication: 'end',
                            },
                        },
                    }}
                    series={series}
                    height={450}
                />
            </div>
        </Card>
    )
}

export default AdsPerformance
