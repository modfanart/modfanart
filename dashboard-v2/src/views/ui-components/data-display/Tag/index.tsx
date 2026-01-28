import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Affix from './Affix'
import Custom from './Custom'

const mdPath = 'Tag'

const demoHeader = {
    title: 'برچسب (Tag)',
    desc: 'کامپوننت برچسب برای دسته‌بندی محتوا با یک کلمه کلیدی استفاده می‌شود.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `استفاده پایه از کامپوننت برچسب.`,
        component: <Basic />,
    },
    {
        mdName: 'Affix',
        mdPath: mdPath,
        title: 'پیشوند و پسوند (Affix)',
        desc: `برچسب می‌تواند دارای پیشوند و پسوند باشد و هر دو قابل سفارشی‌سازی هستند.`,
        component: <Affix />,
    },
    {
        mdName: 'Custom',
        mdPath: mdPath,
        title: 'سفارشی (Custom)',
        desc: `می‌توانیم با اعمال کلاس‌های Tailwind CSS، استایل‌های مختلفی برای برچسب داشته باشیم.`,
        component: <Custom />,
    },
]

const demoApi = [
    {
        component: 'برچسب (Tag)',
        api: [
            {
                propName: 'prefix',
                type: `<code>boolean</code> | <code>ReactNode</code>`,
                default: `<code>false</code>`,
                desc: 'پیشوند برچسب',
            },
            {
                propName: 'prefixClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس CSS برای پیشوند برچسب، تنها زمانی قابل استفاده است که نوع پیشوند بولین باشد',
            },
            {
                propName: 'suffix',
                type: `<code>boolean</code> | <code>ReactNode</code>`,
                default: `<code>false</code>`,
                desc: 'پسوند برچسب',
            },
            {
                propName: 'suffixClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس CSS برای پسوند برچسب، تنها زمانی قابل استفاده است که نوع پسوند بولین باشد',
            },
        ],
    },
]


const Tag = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Tag
