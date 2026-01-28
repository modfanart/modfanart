import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Size from './Size'
import Color from './Color'
import CustomIndicator from './CustomIndicator'
import Static from './Static'

const mdPath = 'Spinner'

const demoHeader = {
    title: 'اسپینر (Spinner)',
    desc: 'اسپینر وضعیت بارگذاری یک کامپوننت یا صفحه را نشان می‌دهد و به کاربر کمک می‌کند تا از پردازش داده‌ها آگاه شود.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `استفاده پایه.`,
        component: <Basic />,
    },
    {
        mdName: 'Size',
        mdPath: mdPath,
        title: 'اندازه (Size)',
        desc: `ما می‌توانیم اندازه اسپینر را از طریق پراپ <code>size</code> پیکربندی کنیم.`,
        component: <Size />,
    },
    {
        mdName: 'Color',
        mdPath: mdPath,
        title: 'رنگ (Color)',
        desc: `با استفاده از رنگ متن در CSS می‌توانیم رنگ اسپینر را تغییر دهیم.`,
        component: <Color />,
    },
    {
        mdName: 'CustomIndicator',
        mdPath: mdPath,
        title: 'شاخص سفارشی (Custom Indicator)',
        desc: `اگر اسپینر پیش‌فرض را نمی‌پسندید، می‌توانید آن را با اسپینر دلخواه خود جایگزین کنید.`,
        component: <CustomIndicator />,
    },
    {
        mdName: 'Static',
        mdPath: mdPath,
        title: 'استاتیک (Static)',
        desc: `انیمیشن چرخش را با تنظیم <code>isSpining</code> به false متوقف کنید.`,
        component: <Static />,
    },
]

const demoApi = [
    {
        component: 'اسپینر (Spinner)',
        api: [
            {
                propName: 'color',
                type: `<code>string</code>`,
                default: 'رنگ تم فعلی',
                desc: 'رنگ سفارشی برای اسپینر، گزینه‌های رنگ بر اساس <code>theme.colors</code> از Tailwind.',
            },
            {
                propName: 'enableTheme',
                type: `<code>boolean</code>`,
                default: '<code>true</code>',
                desc: 'آیا اسپینر رنگ تم را به ارث می‌برد یا خیر',
            },
            {
                propName: 'indicator',
                type: `<code>ReactNode</code>`,
                default: '<code>CgSpinner</code>',
                desc: 'شاخص اسپینر',
            },
            {
                propName: 'isSpining',
                type: `<code>boolean</code>`,
                default: '<code>true</code>',
                desc: 'آیا اسپینر در حال چرخش است یا خیر',
            },
            {
                propName: 'size',
                type: `<code>string</code> | <code>number</code>`,
                default: '<code>20</code>',
                desc: 'اندازه اسپینر',
            },
        ],
    },
]


const Spinner = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Spinner
