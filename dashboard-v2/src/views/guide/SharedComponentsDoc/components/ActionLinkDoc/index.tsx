import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import ThemeColor from './ThemeColor'
import Hyperlink from './Hyperlink'

const mdPath = 'ActionLinkDoc'

const demoHeader = {
    title: 'لینک اکشن (ActionLink)',
    desc: 'لینک اکشن به کاربر این امکان را می‌دهد که با کلیک یا ضربه روی آن به صفحه دیگری برود.',
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
        mdName: 'ThemeColor',
        mdPath: mdPath,
        title: 'رنگ تم (Theme color)',
        desc: `شما می‌توانید رنگ تم پیش‌فرض اعمال شده بر روی لینک اکشن را با تنظیم <code>themeColor</code> به false غیرفعال کنید.`,
        component: <ThemeColor />,
    },
    {
        mdName: 'Hyperlink',
        mdPath: mdPath,
        title: 'هایپرلینک (Hyperlink)',
        desc: `شما می‌توانید از لینک اکشن به عنوان هایپرلینک هم استفاده کنید بدون اینکه از props <code>to</code> برای تعیین مقصد استفاده کنید.`,
        component: <Hyperlink />,
    },
]

const demoApi = [
    {
        component: 'لینک اکشن (ActionLink)',
        api: [
            {
                propName: 'replace',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'وقتی مقدار آن true باشد، با کلیک روی لینک، ورودی فعلی در تاریخچه جایگزین می‌شود به جای اینکه ورودی جدیدی اضافه شود.',
            },
            {
                propName: 'state',
                type: `<code>any</code>`,
                default: `-`,
                desc: 'حالت برای نگهداری در مقصد به عنوان <code>Link</code> کامپوننت در <code>react-router</code>',
            },
            {
                propName: 'themeColor',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا رنگ تم برای این لینک اعمال شود.',
            },
            {
                propName: 'to',
                type: `<code>string</code> | <code>{pathName: string, search: string, hash: string}</code>`,
                default: `-`,
                desc: 'موقعیتی که مقصد ناوبری است را توصیف می‌کند.',
            },
        ],
    },
]


const ActionLinkDoc = () => {
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

export default ActionLinkDoc
