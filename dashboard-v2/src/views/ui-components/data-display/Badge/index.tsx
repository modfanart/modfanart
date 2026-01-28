import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import CountOverflow from './CountOverflow'
import Dot from './Dot'
import Inline from './Inline'
import Color from './Color'

const mdPath = 'Badge'

const demoHeader = {
    title: 'نشان (Badge)',
    desc: `نشان‌ها معمولاً برای برجسته‌سازی وضعیت یک آیتم و اطلاع‌رسانی به کاربر استفاده می‌شوند.`,
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `پراپ <code>content</code> نشان می‌تواند مقادیر <code>string</code> یا <code>number</code> را بپذیرد.`,
        component: <Basic />,
    },
    {
        mdName: 'CountOverflow',
        mdPath: mdPath,
        title: 'تعداد بیش از حد (Count Overflow)',
        desc: `نشان تعداد پراپ <code>maxCount</code> را نشان می‌دهد، اگر تعداد محتوا از مقدار <code>maxCount</code> بیشتر باشد.`,
        component: <CountOverflow />,
    },
    {
        mdName: 'Dot',
        mdPath: mdPath,
        title: 'نقطه (Dot)',
        desc: `اگر پراپ <code>content</code> وجود نداشته باشد، نشان به صورت نقطه نمایش داده می‌شود.`,
        component: <Dot />,
    },
    {
        mdName: 'Inline',
        mdPath: mdPath,
        title: 'درون خطی (Inline)',
        desc: `برای نمایش نشان به صورت درون خطی، پراپ <code>children</code> را خالی بگذارید.`,
        component: <Inline />,
    },
    {
        mdName: 'Color',
        mdPath: mdPath,
        title: 'رنگ (Color)',
        desc: `نشان می‌تواند رنگ‌های مختلفی داشته باشد با تنظیم مقادیر رنگ از طریق <code>backgroundColor</code> و <code>textColor</code>.`,
        component: <Color />,
    },
]

const demoApi = [
    {
        component: 'نشان (Badge)',
        api: [
            {
                propName: 'content',
                type: `<code>string</code> | <code>number</code>`,
                default: `-`,
                desc: 'محتوای نمایش داده شده در نشان',
            },
            {
                propName: 'maxCount',
                type: `<code>number</code>`,
                default: `<code>99</code>`,
                desc: 'حداکثر عددی که باید نمایش داده شود',
            },
            {
                propName: 'innerClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس برای محتوای داخلی نشان',
            },
            {
                propName: 'badgeStyle',
                type: `<code>object</code>`,
                default: `-`,
                desc: 'استایل سفارشی برای نشان',
            },
        ],
    },
]


const Badge = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Badge
