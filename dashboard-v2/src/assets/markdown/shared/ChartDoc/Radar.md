```jsx
import Chart from '@/components/shared/Chart'

const Radar = () => {
    const chartData = {
        series: [
            {
                name: 'Series 1',
                data: [80, 50, 30, 40, 100, 20],
            },
        ],
        categories: ['January', 'February', 'March', 'April', 'May', 'June'],
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
```
