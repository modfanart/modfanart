import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Variant from './Variant'
import Size from './Size'
import Animation from './Animation'

const mdPath = 'Skeleton'

const demoHeader = {
    title: 'اسکلتون (Skeleton)',
    desc: 'نمایش پیش‌نمایش جایگزین برای کامپوننت قبل از بارگذاری داده‌ها، که به کاربر اطلاع می‌دهد که داده‌ها در حال پردازش هستند.',
}

const demos = [
    {
        mdName: 'Variant',
        mdPath: mdPath,
        title: 'نوع (Variant)',
        desc: `اسکلتون دو نوع ظاهر مختلف دارد، که با ترکیب چندین اسکلتون می‌توان یک نگهدارنده کامپوننت ساخت.`,
        component: <Variant />,
    },
    {
        mdName: 'Size',
        mdPath: mdPath,
        title: 'اندازه (Size)',
        desc: `اندازه‌های اسکلتون می‌توانند با پراپ‌های <code>width</code> و <code>height</code> سفارشی‌سازی شوند.`,
        component: <Size />,
    },
    {
        mdName: 'Animation',
        mdPath: mdPath,
        title: 'انیمیشن (Animation)',
        desc: `انیمیشن می‌تواند با تنظیم پراپ <code>animation</code> به <code>false</code> غیرفعال شود.`,
        component: <Animation />,
    },
]

const demoApi = [
    {
        component: 'اسکلتون (Skeleton)',
        api: [
            {
                propName: 'animation',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا انیمیشن فعال باشد یا خیر',
            },
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'span'</code>`,
                desc: 'عنصر رندر شده',
            },
            {
                propName: 'height',
                type: `<code>string</code> | <code>number</code>`,
                default: `-`,
                desc: 'ارتفاع اسکلتون',
            },
            {
                propName: 'variant',
                type: `<code>'block'</code>  | <code>'circle'</code>`,
                default: `<code>'block'</code>`,
                desc: 'ظاهر اسکلتون',
            },
            {
                propName: 'width',
                type: `<code>string</code> | <code>number</code>`,
                default: `-`,
                desc: 'عرض اسکلتون',
            },
        ],
    },
]


const Skeleton = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Skeleton
