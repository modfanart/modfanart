import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import HeaderFooter from './HeaderFooter'
import HeaderFooterBorder from './HeaderFooterBorder'
import BorderLess from './BorderLess'
import ExtraClass from './ExtraClass'
import Clickable from './Clickable'
import Media from './Media'

const mdPath = 'Cards'

const demoHeader = {
    title: 'کارت‌ها (Cards)',
    desc: 'کارت می‌تواند برای نگهداری گروهی از محتواهای مرتبط استفاده شود.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `استفاده پایه از کارت`,
        component: <Basic />,
    },
    {
        mdName: 'HeaderFooter',
        mdPath: mdPath,
        title: 'سربرگ و پاورقی (Header & Footer)',
        desc: `کارت می‌تواند سربرگ و پاورقی را از طریق ویژگی‌های <code>header</code> و <code>footer</code> تنظیم کند.`,
        component: <HeaderFooter />,
    },
    {
        mdName: 'HeaderFooterBorder',
        mdPath: mdPath,
        title: 'سربرگ و پاورقی با حاشیه (Header & Footer Border)',
        desc: `می‌توانید جداکننده سربرگ و پاورقی را با تنظیم ویژگی‌های <code>headerBorder</code> و <code>footerBorder</code> به <code>false</code> غیرفعال کنید.`,
        component: <HeaderFooterBorder />,
    },
    {
        mdName: 'BorderLess',
        mdPath: mdPath,
        title: 'بدون حاشیه (Borderless)',
        desc: `نمایش کارت بدون حاشیه (با سایه).`,
        component: <BorderLess />,
    },
    {
        mdName: 'ExtraClass',
        mdPath: mdPath,
        title: 'کلاس اضافی (Extra Class)',
        desc: `کلاس اضافی را می‌توان از طریق ویژگی‌های <code>bodyClass</code>، <code>headerClass</code> و <code>footerClass</code> به بخش‌های مربوطه اعمال کرد.`,
        component: <ExtraClass />,
    },
    {
        mdName: 'Clickable',
        mdPath: mdPath,
        title: 'قابل کلیک (Clickable)',
        desc: `ویژگی <code>click</code> را به <code>true</code> تنظیم کنید تا اشاره‌گر موس به دست اشاره تبدیل شود.`,
        component: <Clickable />,
    },
    {
        mdName: 'Media',
        mdPath: mdPath,
        title: 'رسانه (Media)',
        desc: ``,
        component: <Media />,
    },
]
const demoApi = [
    {
        component: 'کارت‌ها (Cards)',
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
                desc: 'نمایش کارت با مرز (بدون سایه)',
            },
            {
                propName: 'clickable',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'نمایش نشانگر موس به صورت اشاره‌گر هنگام hover',
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
                desc: 'بازخورد زمانی که کارت کلیک می‌شود',
            },
        ],
    },
]


const Cards = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Cards
