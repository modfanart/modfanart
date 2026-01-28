import Chart from 'react-apexcharts'
import { COLORS } from '@/constants/chart.constant'
import fa from "apexcharts/dist/locales/fa.json"

const BasicColumn = () => {
    const data = [
        {
            name: 'سود خالص',
            data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
        },
        {
            name: 'درآمد',
            data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
        },
        {
            name: 'جریان نقدی آزاد',
            data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
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
                        horizontal: false,
                        columnWidth: '55%',
                        borderRadius: 4,
                    },
                },
                colors: COLORS,
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent'],
                },
                xaxis: {
                    categories: [
                        'بهمن',
                        'اسفند',
                        'فروردین',
                        'اردیبهشت',
                        'خرداد',
                        'تیر',
                        'مرداد',
                        'شهریور',
                        'مهر',
                    ],
                },
                fill: {
                    opacity: 1,
                },
                tooltip: {
                    y: {
                        formatter: (val) => `${val} هزار تومان`,
                    },
                },
            }}
            series={data}
            height={300}
            type="bar"
        />
    )
}


export default BasicColumn
