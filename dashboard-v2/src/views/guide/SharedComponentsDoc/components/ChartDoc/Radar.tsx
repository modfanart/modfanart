import Chart from '@/components/shared/Chart'

const Radar = () => {
    const chartData = {
        series: [
            {
                name: 'سری ۱',
                data: [80, 50, 30, 40, 100, 20],
            },
        ],
        categories: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
    }
    return (
        <Chart
            type="radar"
            series={chartData.series}
            xAxis={chartData.categories}
            height={400}
        />
    )
}


export default Radar
