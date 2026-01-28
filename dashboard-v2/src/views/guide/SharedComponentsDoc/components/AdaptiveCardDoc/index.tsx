import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'

const mdPath = 'AdaptiveCardDoc'

const demoHeader = {
    title: 'کارت قابل انطباق (AdaptableCard)',
    desc: 'یک کامپوننت کارت که می‌تواند بر اساس چیدمان و پس‌زمینه‌های مختلف سازگار شود.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'اساسی (Basic)',
        desc: ``,
        component: <Basic />,
    },
]

const demoApi = [
    {
        component: 'کارت قابل انطباق (AdaptableCard)',
        api: [
            {
                propName: 'header',
                type: `<code>{ content?: string | ReactNode, className?: string, bordered?: boolean, extra?: string | ReactNode }</code>`,
                default: `-`,
                desc: 'تنظیمات هدر کارت',
            },
            {
                propName: 'footer',
                type: `<code>{ content?: string | ReactNode, className?: string, bordered?: boolean }</code>`,
                default: `-`,
                desc: 'تنظیمات فوتر کارت',
            },
            {
                propName: 'bordered',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'نمایش کارت با حاشیه (بدون سایه)',
            },
            {
                propName: 'clickable',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'زمانی که روی کارت هاور می‌کنید، تغییر نشانگر به پوینتر',
            },
            {
                propName: 'bodyClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'اعمال کلاس به بدنه کارت',
            },
            {
                propName: 'onClick',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `<code>-</code>`,
                desc: 'کال‌بک زمانی که کارت کلیک شود',
            },
        ],
    },
]


const AdaptableCardDoc = () => {
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

export default AdaptableCardDoc
