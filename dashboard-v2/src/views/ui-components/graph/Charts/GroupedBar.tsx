import Chart from 'react-apexcharts'
import { COLORS } from '@/constants/chart.constant'
import fa from "apexcharts/dist/locales/fa.json"

const GroupedBar = () => {
    const data = [
        {
            data: [44, 55, 41, 64],
            name: 'داده 1',
        },
        {
            data: [53, 32, 33, 52],
            name: 'داده 2',
        },
    ]

    return (
        <Chart
            options={{
                chart: {
                    locales: [fa],
                    defaultLocale: 'fa',
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        dataLabels: {
                            position: 'top',
                        },
                    },
                },
                colors: COLORS,
                dataLabels: {
                    enabled: true,
                    offsetX: -6,
                    style: {
                        fontSize: '12px',
                        colors: ['#fff'],
                    },
                },
                stroke: {
                    show: true,
                    width: 1,
                    colors: ['#fff'],
                },
                xaxis: {
                    categories: [1400, 1401, 1402, 1403],
                },
            }}
            series={data}
            height={300}
            type="bar"
        />
    )
}

export default GroupedBar
