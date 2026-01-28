import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Icon from './Icon'
import CustomIcon from './CustomIcon'
import Type from './Type'
import Title from './Title'
import Closable from './Closable'

const mdPath = 'Alert'

const demoHeader = {
    title: 'هشدار (Alert)',
    desc: 'هشدارها برای بازخورد به اقدامات کاربر یا فعالیت‌های سیستم استفاده می‌شوند. (Alerts are used to feedback to the user action or system activity.)',
}


const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `استفاده‌ی پایه از هشدار.`,
        component: <Basic />,
    },
    {
        mdName: 'Icon',
        mdPath: mdPath,
        title: 'آیکون (Icon)',
        desc: `نمایش آیکون درون هشدار.`,
        component: <Icon />,
    },
    {
        mdName: 'CustomIcon',
        mdPath: mdPath,
        title: 'آیکون سفارشی (CustomIcon)',
        desc: `آیکون می‌تواند با تنظیم آیکون دلخواه به <code>customIcon</code> prop جایگزین شود.`,
        component: <CustomIcon />,
    },
    {
        mdName: 'Type',
        mdPath: mdPath,
        title: 'نوع (Type)',
        desc: `وضعیت هشدارها را با ارسال <code>type</code> prop تغییر دهید. هشدار از انواع <code>info</code>، <code>success</code>، <code>warning</code> و <code>danger</code> پشتیبانی می‌کند.`,
        component: <Type />,
    },
    {
        mdName: 'Title',
        mdPath: mdPath,
        title: 'عنوان (Title)',
        desc: `هشدار همچنین می‌تواند عنوانی داشته باشد با وارد کردن رشته به <code>title</code> prop.`,
        component: <Title />,
    },
    {
        mdName: 'Closable',
        mdPath: mdPath,
        title: 'قابل بستن (Closable)',
        desc: `برای نمایش دکمه بستن که به کاربر این امکان را می‌دهد تا هشدار را ببندد، <code>closable</code> prop را به true تنظیم کنید.`,
        component: <Closable />,
    },
]
const demoApi = [
    {
        component: 'هشدار',
        api: [
            {
                propName: 'title',
                type: `<code>ReactNode</code> | <code>string</code>`,
                default: `-`,
                desc: 'عنوان هشدار',
            },
            {
                propName: 'showIcon',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'نمایش آیکن بر اساس نوع',
            },
            {
                propName: 'customIcon',
                type: `<code>ReactNode</code>`,
                default: `-`,
                desc: 'جایگزینی آیکن پیش‌فرض با آیکن سفارشی',
            },
            {
                propName: 'type',
                type: `<code>'info'</code> | <code>'warning'</code> | <code>'success'</code> | <code>'danger'</code>`,
                default: `<code>'warning'</code>`,
                desc: 'وضعیت هشدار',
            },
            {
                propName: 'closable',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'نمایش دکمه بستن',
            },
            {
                propName: 'customClose',
                type: `<code>ReactNode | <code>string</code>`,
                default: `-`,
                desc: 'جایگزینی دکمه بستن پیش‌فرض',
            },
            {
                propName: 'rounded',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا هشدار دارای حاشیه گرد است',
            },
            {
                propName: 'onClose',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `<code>-</code>`,
                desc: 'تابع بازگشتی هنگام بسته شدن هشدار',
            },
            {
                propName: 'triggerByToast',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'شناسایی برای فعال‌سازی Toast (برای مقاصد Toast)',
            },
            {
                propName: 'duration',
                type: `<code>2000</code>`,
                default: `<code>number</code>`,
                desc: 'فاصله زمانی برای حذف (برای مقاصد Toast)',
            },
        ],
    },
]


const Alert = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Alert
