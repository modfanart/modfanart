import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import More from './More'
import Total from './Total'
import PageSize from './PageSize'
import Controlled from './Controlled'

const mdPath = 'Pagination'
const demoHeader = {
    title: 'صفحه‌بندی (Pagination)',
    desc: 'صفحه‌بندی محتوا را به چندین صفحه تقسیم می‌کند و به کاربران این امکان را می‌دهد که بین آن‌ها جابجا شوند.',
}
const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'اساسی (Basic)',
        desc: `استفاده اساسی از صفحه‌بندی (Pagination).`,
        component: <Basic />,
    },
    {
        mdName: 'More',
        mdPath: mdPath,
        title: 'بیشتر (More)',
        desc: `در صورتی که تعداد صفحات زیاد شود، صفحه‌بندی علامت سه نقطه (ellipsis) را برای نشان دادن نتایج قبلی یا ادامه دار نمایش می‌دهد.`,
        component: <More />,
    },
    {
        mdName: 'Total',
        mdPath: mdPath,
        title: 'تعداد کل (Total)',
        desc: `نمایش تعداد کل داده‌ها با تنظیم <code>displayTotal</code> به true.`,
        component: <Total />,
    },
    {
        mdName: 'PageSize',
        mdPath: mdPath,
        title: 'اندازه صفحات (Page sizes)',
        desc: `نمایش تعداد صفحه‌بندی تقسیم شده بر <code>total</code> و <code>pageSize</code>، که معمولاً برای نمایش تعداد داده‌ها در یک صفحه استفاده می‌شود.`,
        component: <PageSize />,
    },
    {
        mdName: 'Controlled',
        mdPath: mdPath,
        title: 'کنترل شده (Controlled)',
        desc: `مثالی از صفحه‌بندی کنترل شده.`,
        component: <Controlled />,
    },
]

const demoApi = [
    {
        component: 'صفحه‌بندی (Pagination)',
        api: [
            {
                propName: 'currentPage',
                type: `<code>number</code>`,
                default: `<code>1</code>`,
                desc: 'شماره صفحه جاری',
            },
            {
                propName: 'displayTotal',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا تعداد کل داده‌ها نمایش داده شود',
            },
            {
                propName: 'onChange',
                type: `<code>(pageNumber: number) => void</code>`,
                default: `<code>-</code>`,
                desc: 'تابعی که هنگام کلیک روی ایندکس صفحه‌بندی فراخوانی می‌شود',
            },
            {
                propName: 'pageSize',
                type: `<code>number</code>`,
                default: `<code>1</code>`,
                desc: 'تعداد داده‌ها در هر صفحه',
            },
            {
                propName: 'total',
                type: `<code>number</code>`,
                default: `<code>5</code>`,
                desc: 'تعداد کل داده‌ها',
            },
        ],
    },
]


const Pagination = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Pagination
