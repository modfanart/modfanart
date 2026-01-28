import Chart from 'react-apexcharts'
import { COLORS } from '@/constants/chart.constant'
import fa from "apexcharts/dist/locales/fa.json"

const BasicBar = () => {
    const data = [
        {
            name: 'داده 1',
            data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
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
                    },
                },
                colors: COLORS,
                dataLabels: {
                    enabled: false,
                },
                xaxis: {
                    categories: [
                        'کره جنوبی',
                        'کانادا',
                        'بریتانیا',
                        'هلند',
                        'ایتالیا',
                        'فرانسه',
                        'ژاپن',
                        'ایالات متحده',
                        'چین',
                        'آلمان',
                    ],
                },
            }}
            series={data}
            type="bar"
            height={300}
        />
    )
}


export default BasicBar
