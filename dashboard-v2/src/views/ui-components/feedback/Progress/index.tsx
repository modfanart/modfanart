import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import ProgressBar from './ProgressBar'
import Colors from './Colors'
import Size from './Size'
import Circle from './Circle'
import CustomInfo from './CustomInfo'
import Dynamic from './Dynamic'

const mdPath = 'Progress'

const demoHeader = {
    title: 'پیشرفت (Progress)',
    desc: 'یک بارگذاری پیشرفت، پیشرفت جریان عملیات را به صورت بصری نمایش می‌دهد.',
}

const demos = [
    {
        mdName: 'ProgressBar',
        mdPath: mdPath,
        title: 'نوار پیشرفت (Progress Bar)',
        desc: `پیشرفت در نوار پیشرفت توسط پراپ <code>percent</code> کنترل می‌شود.`,
        component: <ProgressBar />,
    },
    {
        mdName: 'Circle',
        mdPath: mdPath,
        title: 'دایره (Circle)',
        desc: `به طور جایگزین، می‌توانیم پیشرفت را در دایره نمایش دهیم با تنظیم پراپ <code>variant</code> به 'circle'`,
        component: <Circle />,
    },
    {
        mdName: 'Colors',
        mdPath: mdPath,
        title: 'رنگ‌ها (Colors)',
        desc: `ما می‌توانیم رنگ سفارشی برای نوار پیشرفت اعمال کنیم. گزینه‌های رنگ موجود بر اساس <code>theme.colors</code> در Tailwind هستند.`,
        component: <Colors />,
    },
    {
        mdName: 'Size',
        mdPath: mdPath,
        title: 'اندازه (Size)',
        desc: `تنظیم اندازه پیشرفت از طریق پراپ <code>size</code> برای نوار پیشرفت یا پراپ <code>width</code> برای پیشرفت دایره‌ای.`,
        component: <Size />,
    },
    {
        mdName: 'CustomInfo',
        mdPath: mdPath,
        title: 'اطلاعات سفارشی (CustomInfo)',
        desc: `ما می‌توانیم هر محتوای سفارشی را از طریق <code>customInfo</code> وارد کنیم.`,
        component: <CustomInfo />,
    },
    {
        mdName: 'Dynamic',
        mdPath: mdPath,
        title: 'دینامیک (Dynamic)',
        desc: `مثالی از پیشرفت دینامیک.`,
        component: <Dynamic />,
    },
]

const demoApi = [
    {
        component: 'پیشرفت (Progress)',
        api: [
            {
                propName: 'color',
                type: `<code>string</code>`,
                default: 'رنگ پیش‌فرض تم',
                desc: 'رنگ سفارشی برای پیشرفت، گزینه‌های رنگ موجود بر اساس <code>theme.colors</code> در Tailwind.',
            },
            {
                propName: 'customInfo',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: '-',
                desc: 'محتوای سفارشی',
            },
            {
                propName: 'gapDegree',
                type: `<code>number</code>`,
                default: '<code>0</code>',
                desc: 'زاویه شکاف در پیشرفت دایره‌ای (فقط زمانی که variant="circle" است قابل استفاده است).',
            },
            {
                propName: 'gapPosition',
                type: `<code>'top'</code> | <code>'right'</code> | <code>'bottom'</code> | <code>'left'</code> `,
                default: `<code>'top'</code>`,
                desc: 'موقعیت شکاف در پیشرفت دایره‌ای (فقط زمانی که variant="circle" است قابل استفاده است).',
            },
            {
                propName: 'percent',
                type: `<code>number</code>`,
                default: '<code>0</code>',
                desc: 'مقدار فعلی پیشرفت',
            },
            {
                propName: 'showInfo',
                type: `<code>boolean</code>`,
                default: '<code>true</code>',
                desc: 'آیا اطلاعات پیشرفت نمایش داده شود یا خیر',
            },
            {
                propName: 'size',
                type: `<code>'sm'</code> | <code>'md'</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه نوار پیشرفت (فقط زمانی که variant="line" است قابل استفاده است)',
            },
            {
                propName: 'strokeLinecap',
                type: `<code>'round'</code> | <code>'square'</code>`,
                default: `<code>'round'</code>`,
                desc: 'سبک خط نوار پیشرفت (فقط زمانی که variant="circle" است قابل استفاده است)',
            },
            {
                propName: 'strokeWidth',
                type: `<code>number</code>`,
                default: `<code>6</code>`,
                desc: 'عرض پیشرفت دایره‌ای (فقط زمانی که variant="circle" است قابل استفاده است)',
            },
            {
                propName: 'trailClass',
                type: `<code>string</code>`,
                default: `<code>-</code>`,
                desc: 'کلاس CSS برای مسیر پیشرفت',
            },
            {
                propName: 'variant',
                type: `<code>'line'</code> | <code>'circle'</code>`,
                default: `<code>'line'</code>`,
                desc: 'نوع پیشرفت',
            },
            {
                propName: 'width',
                type: `<code>number</code> | <code>string</code>`,
                default: `<code>'line'</code>`,
                desc: 'اندازه پیشرفت دایره‌ای (فقط زمانی که variant="circle" است قابل استفاده است)',
            },
        ],
    },
]


const Progress = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Progress
