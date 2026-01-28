import Chart from 'react-apexcharts'
import { COLORS } from '@/constants/chart.constant'

const SimpleDonut = () => {
    const data = [
        {
            name: 'آیتم A',
            data: [5],
        },
        {
            name: 'آیتم B',
            data: [55],
        },
        {
            name: 'آیتم C',
            data: [41],
        },
        {
            name: 'آیتم D',
            data: [17],
        },
        {
            name: 'آیتم E',
            data: [15],
        },
    ]

    return (
        <Chart
            options={{
                colors: COLORS,
                labels: ['آیتم A', 'آیتم B', 'آیتم C', 'آیتم D', 'آیتم E'],
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            chart: {
                                width: 200,
                            },
                            legend: {
                                position: 'bottom',
                            },
                        },
                    },
                ],
            }}
            series={data.map(item => item.data[0])} // تبدیل داده‌ها به آرایه‌ای از مقادیر عددی
            height={300}
            type="donut"
        />
    )
}

export default SimpleDonut
