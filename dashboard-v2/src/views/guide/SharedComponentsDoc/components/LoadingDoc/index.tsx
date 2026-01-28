import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Cover from './Cover'
import Custom from './Custom'

const mdPath = 'LoadingDoc'

const demoHeader = {
    title: 'در حال بارگذاری (Loading)',
    desc: 'یک کامپوننت که وضعیت را در هنگام بارگذاری فراهم می‌کند.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'اساسی (Basic)',
        desc: `استفاده اساسی.`,
        component: <Basic />,
    },
    {
        mdName: 'Cover',
        mdPath: mdPath,
        title: 'کاور (Cover)',
        desc: `شما می‌توانید یک المان را با استفاده از <code>type="cover"</code> روی هم قرار دهید.`,
        component: <Cover />,
    },
    {
        mdName: 'Custom',
        mdPath: mdPath,
        title: 'سفارشی (Custom)',
        desc: `شما می‌توانید هر المان سفارشی دیگری را به عنوان لودر با تنظیم پراپ <code>customLoader</code> استفاده کنید.`,
        component: <Custom />,
    },
]

const demoApi = [
    {
        component: 'در حال بارگذاری (Loading)',
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'div'</code>`,
                desc: 'المان رندر شده',
            },
            {
                propName: 'customLoader',
                type: `<code>ReactNode</code>`,
                default: `-`,
                desc: 'لودر سفارشی',
            },
            {
                propName: 'loading',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'وضعیت بارگذاری',
            },
            {
                propName: 'spinnerClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس اضافی برای اسپینر پیش‌فرض',
            },
        ],
    },
]


const LoadingDoc = () => {
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

export default LoadingDoc
