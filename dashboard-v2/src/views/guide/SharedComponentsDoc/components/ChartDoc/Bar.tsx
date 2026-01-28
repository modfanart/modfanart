import Chart from '@/components/shared/Chart'

const Bar = () => {
    const uniqueVisitorsData = {
        series: [
            {
                name: 'مدت زمان جلسه',
                data: [45, 52, 38, 24, 33, 26, 21],
            },
            {
                name: 'مشاهده صفحات',
                data: [35, 41, 62, 42, 13, 18, 29],
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
        ]
    }

    return (
        <Chart
            series={uniqueVisitorsData.series}
            xAxis={uniqueVisitorsData.categories}
            height={410}
            type="bar"
            customOptions={{
                colors: ['#ef4444', '#10b981'],
            }}
        />
    )
}


export default Bar
