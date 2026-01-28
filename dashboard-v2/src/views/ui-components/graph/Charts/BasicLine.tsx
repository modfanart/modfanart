import Chart from 'react-apexcharts'
import { COLOR_2 } from '@/constants/chart.constant'
import fa from "apexcharts/dist/locales/fa.json"

const BasicLine = () => {
    const data = [
        {
            name: 'دسکتاپ‌ها',
            data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
        },
    ]

    return (
        <Chart
            options={{
                chart: {
                    type: 'line',
                    zoom: {
                        enabled: false,
                    },
                    locales: [fa],
                    defaultLocale: 'fa',
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    curve: 'smooth',
                    width: 3,
                },
                colors: [COLOR_2],
                xaxis: {
                    categories: [
                        'فروردین',
                        'اردیبهشت',
                        'خرداد',
                        'تیر',
                        'مرداد',
                        'شهریور',
                        'مهر',
                        'آبان',
                        'آذر',
                    ],
                },
            }}
            series={data}
            height={300}
        />
    )
}


export default BasicLine
