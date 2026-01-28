import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Default from './Default'
import CustomToggle from './CustomToggle'
import Trigger from './Trigger'
import Submenu from './Submenu'
import Placement from './Placement'
import DefaultActive from './DefaultActive'
import Disabled from './Disabled'
import DropdownItemVariant from './DropdownItemVariant'
import WithRouterLink from './WithRouterLink'

const mdPath = 'Dropdown'

const demoHeader = {
    title: 'کشویی (Dropdown)',
    desc: 'کشویی به کاربران این امکان را می‌دهد که یک آیتم را از فهرستی از گزینه‌ها انتخاب کنند.',
}


const demos = [
    {
        mdName: 'Default',
        mdPath: mdPath,
        title: 'پیش‌فرض (Default)',
        desc: `استفاده پیش‌فرض از کشویی.`,
        component: <Default />,
    },
    {
        mdName: 'CustomToggle',
        mdPath: mdPath,
        title: 'دکمه سفارشی (Custom Toggle)',
        desc: `ما می‌توانیم با استفاده از پراپ <code>renderTitle</code>، دکمه سفارشی برای کشویی تنظیم کنیم.`,
        component: <CustomToggle />,
    },
    {
        mdName: 'Trigger',
        mdPath: mdPath,
        title: 'توسعه‌دهنده (Trigger)',
        desc: `کشویی به ما این امکان را می‌دهد که حالت <code>trigger</code> را به <code>click</code>، <code>hover</code> یا <code>context</code> تنظیم کنیم.`,
        component: <Trigger />,
    },
    {
        mdName: 'Submenu',
        mdPath: mdPath,
        title: 'زیرمنو (Submenu)',
        desc: `کشویی می‌تواند سطوح چندگانه داشته باشد.`,
        component: <Submenu />,
    },
    {
        mdName: 'Placement',
        mdPath: mdPath,
        title: 'قرارگیری (Placement)',
        desc: `قرارگیری منوی کشویی می‌تواند با استفاده از پراپ <code>placement</code> در اطراف عنصر توسعه‌دهنده در موقعیت‌های مختلف تنظیم شود.`,
        component: <Placement />,
    },
    {
        mdName: 'DefaultActive',
        mdPath: mdPath,
        title: 'پیش‌فرض فعال (Default Active)',
        desc: `مقدار eventKey برای Dropdown.Item را به پراپ <code>activeKey</code> تنظیم کنید تا وضعیت فعال Dropdown.Item را مشخص کنید.`,
        component: <DefaultActive />,
    },
    {
        mdName: 'Disabled',
        mdPath: mdPath,
        title: 'غیرفعال (Disabled)',
        desc: `پراپ <code>disabled</code> می‌تواند هم در Dropdown و هم در Dropdown.Item برای غیرفعال کردن اقدامات کاربر استفاده شود.`,
        component: <Disabled />,
    },
    {
        mdName: 'DropdownItemVariant',
        mdPath: mdPath,
        title: 'نوع آیتم کشویی (Dropdown Item Type)',
        desc: `Dropdown.Item چندین نوع متغیر دارد که می‌توان اعمال کرد، پراپ variant را ارسال کرده و یکی از گزینه‌های <code>'default'</code>، <code>'header'</code>، <code>'divider'</code>، <code>'default'</code> را استفاده کنید.`,
        component: <DropdownItemVariant />,
    },
    {
        mdName: 'WithRouterLink',
        mdPath: mdPath,
        title: 'با RouterLink (With RouterLink)',
        desc: `استفاده با RouterLink.`,
        component: <WithRouterLink />,
    },
]


const demoApi = [
    {
        component: 'کشویی (Dropdown)',
        api: [
            {
                propName: 'title',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'عنوان کشویی',
            },
            {
                propName: 'renderTitle',
                type: `<code>ReactNode</code>`,
                default: `-`,
                desc: 'عنوان سفارشی کشویی',
            },
            {
                propName: 'trigger',
                type: `<code>'click'</code> | <code>'hover'</code> | <code>'context'</code> `,
                default: `<code>'click'</code>`,
                desc: 'حالت فعال‌سازی کشویی',
            },
            {
                propName: 'placement',
                type: `<code>'top-start'</code> | <code>'top-center'</code> | <code>'top-end'</code> | <code>'bottom-start'</code> | <code>'bottom-center'</code> | <code>'bottom-end'</code> | <code>'middle-start-top'</code>| <code>'middle-start-bottom'</code> | <code>'middle-end-top'</code>| <code>'middle-end-bottom'</code>`,
                default: `<code>'bottom-start'</code>`,
                desc: 'موقعیتی که منوی کشویی در آن باز می‌شود',
            },
            {
                propName: 'menuClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس اضافی برای منوی کشویی (<code>!</code> برای اصلاحات tailwind css توصیه می‌شود)',
            },
            {
                propName: 'menuStyle',
                type: `<code>object</code>`,
                default: `-`,
                desc: 'سبک‌های اضافی برای منوی کشویی',
            },
            {
                propName: 'toggleClassName',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس اضافی برای دکمه کشویی (<code>!</code> برای اصلاحات tailwind css توصیه می‌شود)',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا کشویی غیرفعال باشد',
            },
            {
                propName: 'activeKey',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'آیتم مربوط به <code>Dropdown.Item</code> را با مطابقت دادن آن با پراپ <code>eventkey</code> به عنوان فعال مشخص کنید',
            },
            {
                propName: 'onClick',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `<code>-</code>`,
                desc: 'فراخوانی هنگام کلیک بر روی دکمه کشویی',
            },
            {
                propName: 'onMouseEnter',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `<code>-</code>`,
                desc: 'فراخوانی هنگام قرار گرفتن موس روی دکمه کشویی',
            },
            {
                propName: 'onMouseLeave',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `<code>-</code>`,
                desc: 'فراخوانی هنگام خارج شدن موس از دکمه کشویی',
            },
            {
                propName: 'onContextMenu',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `<code>-</code>`,
                desc: 'فراخوانی هنگام کلیک راست روی دکمه کشویی',
            },
            {
                propName: 'onSelect',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `<code>-</code>`,
                desc: 'فراخوانی هنگام کلیک بر روی آیتم کشویی',
            },
            {
                propName: 'onOpen',
                type: `<code>() => void</code>`,
                default: `<code>-</code>`,
                desc: 'فراخوانی هنگام باز شدن کشویی',
            },
            {
                propName: 'onClose',
                type: `<code>() => void</code>`,
                default: `<code>-</code>`,
                desc: 'فراخوانی هنگام بسته شدن کشویی',
            },
            {
                propName: 'onToggle',
                type: `<code>(open: boolean) => void</code>`,
                default: `<code>-</code>`,
                desc: 'فراخوانی هنگام باز یا بسته شدن کشویی',
            },
        ],
    },
    {
        component: 'آیتم کشویی (Dropdown.Item)',
        api: [
            {
                propName: 'active',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا آیتم کشویی جاری فعال است',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا آیتم کشویی جاری غیرفعال است',
            },
            {
                propName: 'variant',
                type: `<code>'default'</code> | <code>'header'</code> | <code>'divider'</code> | <code>'custom'</code>`,
                default: `-`,
                desc: 'نوع آیتم کشویی را تعریف کنید',
            },
            {
                propName: 'eventKey',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'مقدار آیتم کشویی',
            },
            {
                propName: 'onClick',
                type: `<code>() => void</code>`,
                default: `<code>-</code>`,
                desc: 'فراخوانی هنگام کلیک بر روی آیتم کشویی',
            },
            {
                propName: 'onSelect',
                type: `<code>(eventKey: string, e: MouseEvent) => void</code>`,
                default: `<code>-</code>`,
                desc: 'فراخوانی هنگام کلیک بر روی آیتم کشویی',
            },
        ],
    },
    {
        component: 'منوی کشویی (Dropdown.Menu)',
        api: [
            {
                propName: 'title',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'عنوان برای زیرمنو',
            },
            {
                propName: 'eventKey',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'مقدار زیرمنوی کشویی',
            },
            {
                propName: 'placement',
                type: `<code>'top-start'</code> | <code>'top-center'</code> | <code>'top-end'</code> | <code>'bottom-start'</code> | <code>'bottom-center'</code> | <code>'bottom-end'</code> | <code>'middle-start-top'</code>| <code>'middle-start-bottom'</code> | <code>'middle-end-top'</code>| <code>'middle-end-bottom'</code>`,
                default: `-`,
                desc: 'موقعیتی که منوی کشویی در آن باز می‌شود',
            },
        ],
    },    
]

const Dropdown = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Dropdown
