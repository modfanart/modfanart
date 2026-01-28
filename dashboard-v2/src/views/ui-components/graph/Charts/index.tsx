import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import BasicLine from './BasicLine'
import DashedLine from './DashedLine'
import BasicArea from './BasicArea'
import SplineArea from './SplineArea'
import BasicColumn from './BasicColumn'
import StackedColumn from './StackedColumn'
import BasicBar from './BasicBar'
import GroupedBar from './GroupedBar'
import SimplePie from './SimplePie'
import SimpleDonut from './SimpleDonut'

const mdPath = 'Charts'
const demoHeader = {
    title: 'نمودارها (Charts)',
    desc: 'React-ApexCharts یک کامپوننت wrapper برای ApexCharts است که آماده‌سازی برای ادغام در برنامه‌های react.js شما جهت ساخت نمودارهای React جذاب را فراهم می‌کند.',
}

const demos = [
    {
        mdName: 'BasicLine',
        mdPath: mdPath,
        title: 'خطی پایه (Basic Line)',
        desc: ``,
        component: <BasicLine />,
    },
    {
        mdName: 'DashedLine',
        mdPath: mdPath,
        title: 'خطی نقطه‌چین (Dashed Line)',
        desc: ``,
        component: <DashedLine />,
    },
    {
        mdName: 'BasicArea',
        mdPath: mdPath,
        title: 'مساحت پایه (Basic Area)',
        desc: ``,
        component: <BasicArea />,
    },
    {
        mdName: 'SplineArea',
        mdPath: mdPath,
        title: 'مساحت اسپلاین (Spline Area)',
        desc: ``,
        component: <SplineArea />,
    },
    {
        mdName: 'BasicColumn',
        mdPath: mdPath,
        title: 'ستون پایه (Basic Column)',
        desc: ``,
        component: <BasicColumn />,
    },
    {
        mdName: 'StackedColumn',
        mdPath: mdPath,
        title: 'ستون انباشته (Stacked Column)',
        desc: ``,
        component: <StackedColumn />,
    },
    {
        mdName: 'BasicBar',
        mdPath: mdPath,
        title: 'نوار پایه (Basic Bar)',
        desc: ``,
        component: <BasicBar />,
    },
    {
        mdName: 'GroupedBar',
        mdPath: mdPath,
        title: 'نوار گروهی (Grouped Bar)',
        desc: ``,
        component: <GroupedBar />,
    },
    {
        mdName: 'SimplePie',
        mdPath: mdPath,
        title: 'پای ساده (Simple Pie)',
        desc: ``,
        component: <SimplePie />,
    },
    {
        mdName: 'SimpleDonut',
        mdPath: mdPath,
        title: 'دونات ساده (Simple Donut)',
        desc: ``,
        component: <SimpleDonut />,
    },
]

const demoApi = [
    {
        component: 'نمودارها (Charts)',
        api: [
            {
                propName: 'type',
                type: `<code>string</code>`,
                default: `<code>'line'</code>`,
                desc: 'نوع نمودار که یک پراپ ضروری برای مشخص کردن است',
            },
            {
                propName: 'series',
                type: `<code>Array</code>`,
                default: `-`,
                desc: 'داده‌هایی که می‌خواهید در نمودار نمایش داده شود',
            },
            {
                propName: 'width',
                type: `<code>string</code> | <code>number</code>`,
                default: `<code>'100%'</code>`,
                desc: 'عرض نمودار',
            },
            {
                propName: 'height',
                type: `<code>string</code> | <code>number</code>`,
                default: `<code>'auto'</code>`,
                desc: 'ارتفاع نمودار',
            },
            {
                propName: 'options',
                type: `<code>object</code>`,
                default: `<code>{}</code>`,
                desc: 'تمامی پیکربندی‌های اختیاری نمودار در این پراپ قرار می‌گیرد',
            },
        ],
    },
]


const Extra = () => {
    return (
        <>
            <h4 className="mb-4">مثال‌های بیشتر از نمودارها؟</h4>
            <p>
                نمودارهای دیگری نیز وجود دارند که با تغییر چند گزینه می‌توان آنها را ایجاد کرد.
                تنظیمات اصلی باید در خصوصیت <code>options</code> کامپوننت ApexCharts انجام شود
                و بقیه موارد به طور خودکار تنظیم خواهند شد. برای اطلاعات بیشتر به لینک زیر مراجعه کنید:
                <a
                    className="text-blue-500 hover:underline"
                    href="https://apexcharts.com/react-chart-demos/"
                    target="_blank"
                    rel="noreferrer"
                >
                    https://apexcharts.com/react-chart-demos/
                </a>
            </p>
        </>
    )
}


const Charts = () => {
    return (
        <DemoLayout
            header={demoHeader}
            demos={demos}
            api={demoApi}
            extra={<Extra />}
        />
    )
}

export default Charts
