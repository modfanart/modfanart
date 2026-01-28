import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Default from './Default'
import Icons from './Icons'
import Pill from './Pill'
import Disabled from './Disabled'
import ControlledTabs from './ControlledTabs'

const mdPath = 'Tabs'

const demoHeader = {
    title: 'زبان‌های تب (Tabs)',
    desc: 'تب‌ها به سازماندهی محتوای مرتبط در یک نمای واحد کمک می‌کنند که برای کاربر آسان‌تر است تا بین نماهای مختلف جابجا شود و مرور کند.',
}

const demos = [
    {
        mdName: 'Default',
        mdPath: mdPath,
        title: 'پیش‌فرض (Default)',
        desc: `استفاده از تب‌های پیش‌فرض.`,
        component: <Default />,
    },
    {
        mdName: 'Pill',
        mdPath: mdPath,
        title: 'پیل (Pill)',
        desc: `شما می‌توانید سبک تب‌ها را با تنظیم <code>variant</code> به پیل تغییر دهید.`,
        component: <Pill />,
    },
    {
        mdName: 'Icons',
        mdPath: mdPath,
        title: 'آیکون‌ها (Icons)',
        desc: `پراپ <code>icon</code> در TabNav به ما اجازه می‌دهد آیکن‌ها را با فاصله خودکار وارد کنیم.`,
        component: <Icons />,
    },
    {
        mdName: 'Disabled',
        mdPath: mdPath,
        title: 'غیرفعال (Disabled)',
        desc: `با تنظیم <code>disabled</code> در TabNav از کلیک شدن جلوگیری می‌کنید.`,
        component: <Disabled />,
    },
    {
        mdName: 'ControlledTabs',
        mdPath: mdPath,
        title: 'تب‌های کنترلی (Controlled Tabs)',
        desc: `مثالی از تب‌های کنترلی.`,
        component: <ControlledTabs />,
    },
]

const demoApi = [
    {
        component: 'تب‌ها (Tabs)',
        api: [
            {
                propName: 'defaultValue',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'مقدار اولیه برای تب‌های غیرکنترلی',
            },
            {
                propName: 'onChange',
                type: `<code>(tabValue: string) => void</code>`,
                default: `-`,
                desc: 'کال‌بک وقتی که مقدار تب تغییر می‌کند',
            },
            {
                propName: 'value',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'مقدار کنترلی برای فعال‌سازی تب',
            },
            {
                propName: 'variant',
                type: `<code>'underline'</code> | <code>'pill'</code>`,
                default: `-`,
                desc: 'سبک تب‌ها',
            },
        ],
    },
    {
        component: 'لیست تب‌ها (Tabs.TabList)',
        api: [],
    },
    {
        component: 'ناوبری تب‌ها (Tabs.TabNav)',
        api: [
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا تب غیرفعال باشد',
            },
            {
                propName: 'icon',
                type: `<code>ReactNode</code> | <code>string</code>`,
                default: `-`,
                desc: 'آیکون تب',
            },
            {
                propName: 'value(*)',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'مقدار منحصر به فرد که با <code>TabContent</code> مطابقت دارد',
            },
        ],
    },
    {
        component: 'محتوای تب‌ها (Tabs.TabContent)',
        api: [
            {
                propName: 'value(*)',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'مقدار منحصر به فرد که با <code>TabNav</code> مطابقت دارد',
            },
        ],
    },
]


const Tabs = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Tabs
