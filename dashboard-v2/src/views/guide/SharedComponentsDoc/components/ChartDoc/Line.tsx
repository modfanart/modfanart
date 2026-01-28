import Chart from '@/components/shared/Chart'

const Line = () => {
    const visitorChartData = {
        series: [
            {
                name: 'مدت زمان جلسه',
                data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10],
            },
            {
                name: 'مشاهده صفحات',
                data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35],
            },
        ],
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
    }
    return (
        <Chart
            series={visitorChartData.series}
            xAxis={visitorChartData.categories}
            height={400}
        />
    )
}

export default Line
