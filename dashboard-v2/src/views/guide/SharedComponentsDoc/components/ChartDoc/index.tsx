import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Line from './Line'
import Bar from './Bar'
import Area from './Area'
import Donut from './Donut'
import Radar from './Radar'

const mdPath = 'ChartDoc'

const demoHeader = {
    title: 'نمودار (Chart)',
    desc: 'این یک کامپوننت سطح بالاتر از <a class="text-primary underline" href="https://apexcharts.com/docs/react-charts/" target="_blank">ApexChart</a> است که با تنظیمات پیش‌فرض نمودارهای متعددی همراه است که با تم سازگار شده‌اند.',
}

const demos = [
    {
        mdName: 'Line',
        mdPath: mdPath,
        title: 'خطی (Line)',
        desc: ``,
        component: <Line />,
    },
    {
        mdName: 'Bar',
        mdPath: mdPath,
        title: 'میله‌ای (Bar)',
        desc: ``,
        component: <Bar />,
    },
    {
        mdName: 'Area',
        mdPath: mdPath,
        title: 'منطقه‌ای (Area)',
        desc: ``,
        component: <Area />,
    },
    {
        mdName: 'Donut',
        mdPath: mdPath,
        title: 'دونات (Donut)',
        desc: ``,
        component: <Donut />,
    },
    {
        mdName: 'Radar',
        mdPath: mdPath,
        title: 'راداری (Radar)',
        desc: ``,
        component: <Radar />,
    },
]

const demoApi = [
    {
        component: 'نمودار (Chart)',
        api: [
            {
                propName: 'customOptions',
                type: `<a class="text-primary underline" href="https://apexcharts.com/docs/options/annotations/" target="_blank">Apexcharts option</a>`,
                default: `-`,
                desc: 'گزینه‌های سفارشی برای نمودار',
            },
            {
                propName: 'donutTitle',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'عنوان داخل نمودار دونات',
            },
            {
                propName: 'height',
                type: `<code>string</code> | <code>number</code>`,
                default: `-`,
                desc: 'ارتفاع نمودار',
            },
            {
                propName: 'series',
                type: `<a class="text-primary underline" href="https://apexcharts.com/docs/series/" target="_blank">Apexcharts Series</a>`,
                default: `-`,
                desc: 'سری داده‌های نمودار',
            },
            {
                propName: 'type',
                type: `<code>'line'</code> | <code>'bar'</code> | <code>'area'</code> | <code>'donut'</code> | <code>'radar'</code>`,
                default: `-`,
                desc: 'نوع نمودار',
            },
            {
                propName: 'width',
                type: `<code>string</code> | <code>number</code>`,
                default: `-`,
                desc: 'عرض نمودار',
            },
            {
                propName: 'xAxis',
                type: `<a class="text-primary underline" href="https://apexcharts.com/docs/options/xaxis/" target="_blank">Apexcharts xAxis</a>`,
                default: `-`,
                desc: 'محور x نمودار',
            },
        ],
    },
]


const ChartDoc = () => {
    return (
        <DemoLayout
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            api={demoApi}
            mdPrefixPath="shared"
        />
    )
}

export default ChartDoc
