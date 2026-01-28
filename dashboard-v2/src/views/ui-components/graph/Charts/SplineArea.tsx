import Chart from 'react-apexcharts'
import { COLORS } from '@/constants/chart.constant'
import fa from "apexcharts/dist/locales/fa.json"

const SplineArea = () => {
    const data = [
        {
            name: 'داده 1',
            data: [31, 40, 28, 51, 42, 109, 100],
        },
        {
            name: 'داده 2',
            data: [11, 32, 45, 32, 34, 52, 41],
        },
    ]

    return (
        <Chart
            options={{
                chart: {
                    locales: [fa],
                    defaultLocale: 'fa',
                },
                dataLabels: {
                    enabled: false,
                },
                colors: COLORS,
                stroke: {
                    curve: 'smooth',
                },
                xaxis: {
                    type: 'datetime',
                    categories: [
                        '1397/06/28 00:00',
                        '1397/06/28 01:30',
                        '1397/06/28 02:30',
                        '1397/06/28 03:30',
                        '1397/06/28 04:30',
                        '1397/06/28 05:30',
                        '1397/06/28 06:30',
                    ],                    
                },
                tooltip: {
                    x: {
                        format: 'yy/MM/dd HH:mm',
                    },
                },
            }}
            series={data}
            type="area"
            height={300}
        />
    )
}


export default SplineArea
