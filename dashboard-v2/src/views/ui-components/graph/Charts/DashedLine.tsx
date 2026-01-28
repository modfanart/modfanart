import Chart from 'react-apexcharts'
import { COLORS } from '@/constants/chart.constant'
import fa from "apexcharts/dist/locales/fa.json"

const DashedLine = () => {
    const data = [
        {
            name: 'مدت زمان جلسه',
            data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
        },
        {
            name: 'مشاهده صفحات',
            data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35],
        },
        {
            name: 'مجموع بازدیدها',
            data: [87, 57, 74, 99, 75, 38, 62, 47, 82, 56, 45, 47],
        },        
    ]

    return (
        <Chart
            options={{
                chart: {
                    height: 350,
                    type: 'line',
                    zoom: {
                        enabled: false,
                    },
                    locales: [fa],
                    defaultLocale: 'fa',
                },
                colors: [...COLORS],
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    width: [3, 5, 3],
                    curve: 'straight',
                    dashArray: [0, 8, 5],
                },
                legend: {
                    tooltipHoverFormatter: function (val, opts) {
                        return (
                            val +
                            ' - ' +
                            opts.w.globals.series[opts.seriesIndex][
                                opts.dataPointIndex
                            ] +
                            ''
                        )
                    },
                },
                markers: {
                    size: 0,
                    hover: {
                        sizeOffset: 6,
                    },
                },
                xaxis: {
                    categories: [
                        '11 دی',
                        '12 دی',
                        '13 دی',
                        '14 دی',
                        '15 دی',
                        '16 دی',
                        '17 دی',
                        '18 دی',
                        '19 دی',
                        '20 دی',
                        '21 دی',
                        '22 دی',
                    ],
                },
                tooltip: {
                    y: [
                        {
                            title: {
                                formatter: function (val) {
                                    return val + ' (mins)'
                                },
                            },
                        },
                        {
                            title: {
                                formatter: function (val) {
                                    return val + ' per session'
                                },
                            },
                        },
                        {
                            title: {
                                formatter: function (val) {
                                    return val
                                },
                            },
                        },
                    ],
                },
                grid: {
                    borderColor: '#f1f1f1',
                },
            }}
            series={data}
            height={300}
        />
    )
}

export default DashedLine
