import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Simple from './Simple'
import CollapsableMenuItem from './CollapsableMenuItem'
import MenuGroup from './MenuGroup'
import MenuWithIcon from './MenuWithIcon'
import DisabledMenuItem from './DisabledMenuItem'
import DefaultActive from './DefaultActive'
import DefaultExpand from './DefaultExpand'

const mdPath = 'Menu'

const demoHeader = {
    title: 'منو (Menu)',
    desc: 'منوها به کاربران این امکان را می‌دهند که یک آیتم را از گروهی از گزینه‌های موجود انتخاب کنند.',
}

const demos = [
    {
        mdName: 'Simple',
        mdPath: mdPath,
        title: 'ساده (Simple)',
        desc: `مثال ساده‌ای از منو.`,
        component: <Simple />,
    },
    {
        mdName: 'CollapsableMenuItem',
        mdPath: mdPath,
        title: 'آیتم منوی قابل گسترش (Collapsable menu item)',
        desc: `منوها می‌توانند شامل سطوح تو در تو به عنوان آیتم‌های منوی قابل گسترش باشند.`,
        component: <CollapsableMenuItem />,
    },
    {
        mdName: 'MenuGroup',
        mdPath: mdPath,
        title: 'گروه منو (Menu group)',
        desc: `منوها می‌توانند آیتم‌های منو را به گروه‌های مختلف تقسیم کنند.`,
        component: <MenuGroup />,
    },
    {
        mdName: 'MenuWithIcon',
        mdPath: mdPath,
        title: 'با آیکون (With icon)',
        desc: `مثال منویی با آیکون در آیتم‌های منو.`,
        component: <MenuWithIcon />,
    },
    {
        mdName: 'DisabledMenuItem',
        mdPath: mdPath,
        title: 'آیتم منوی غیرفعال (Disabled menu item)',
        desc: `آیتم‌های منو می‌توانند غیرفعال شوند تا از تعامل کاربر با آن‌ها جلوگیری شود.`,
        component: <DisabledMenuItem />,
    },
    {
        mdName: 'DefaultActive',
        mdPath: mdPath,
        title: 'فعال پیش‌فرض (Default active)',
        desc: `ما می‌توانیم آیتم‌های منو را با وارد کردن <code>eventKey</code> مربوطه در <code>defaultActiveKeys</code> فعال کنیم.`,
        component: <DefaultActive />,
    },
    {
        mdName: 'DefaultExpand',
        mdPath: mdPath,
        title: 'گسترش پیش‌فرض (Default expand)',
        desc: `ما می‌توانیم آیتم‌های منوی قابل گسترش را با وارد کردن <code>eventKey</code> مربوطه در <code>defaultExpandedKeys</code> گسترش دهیم.`,
        component: <DefaultExpand />,
    },
]


const demoApi = [
    {
        component: 'منو (Menu)',
        api: [
            {
                propName: 'defaultActiveKeys',
                type: `<code>string[]</code>`,
                default: `<code>[]</code>`,
                desc: 'آیتم منوی پیش‌فرض به عنوان فعال بر اساس کلیدهای وارد شده که به <code>eventkey</code> مربوط می‌شوند.',
            },
            {
                propName: 'defaultCollapseActiveKeys',
                type: `<code>string[]</code>`,
                default: `<code>[]</code>`,
                desc: 'آیتم منوی قابل گسترش پیش‌فرض فعال بر اساس کلیدهای وارد شده که به <code>eventkey</code> مربوط می‌شوند.',
            },
            {
                propName: 'defaultExpandedKeys',
                type: `<code>string[]</code>`,
                default: `<code>[]</code>`,
                desc: 'آیتم منوی قابل گسترش پیش‌فرض بر اساس کلیدهای وارد شده که به <code>eventkey</code> مربوط می‌شوند.',
            },
            {
                propName: 'menuItemHeight',
                type: `<code>string</code> | <code>number</code>`,
                default: `<code>40</code>`,
                desc: 'ارتفاع تمام آیتم‌های منو',
            },
            {
                propName: 'onSelect',
                type: `<code>(e: MouseEvent, eventKey: string) => void</code>`,
                default: `-`,
                desc: 'بازخورد زمانی که آیتم منو انتخاب می‌شود',
            },
            {
                propName: 'sideCollapsed',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا منو به صورت جانبی فشرده شود؟',
            },
            {
                propName: 'variant',
                type: `<code>'light'</code> | <code>'dark'</code> | <code>'themed'</code> | <code>'transparent'</code>`,
                default: `<code>'light'</code>`,
                desc: 'نوع‌های مختلف منو.',
            },
        ],
    },
    {
        component: 'گسترش منو (Menu.MenuCollapse)',
        api: [
            {
                propName: 'active',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا آیتم منوی قابل گسترش برجسته شود؟',
            },
            {
                propName: 'eventKey',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'مقدار منحصر به فرد برای آیتم منوی قابل گسترش',
            },
            {
                propName: 'expanded',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا آیتم منوی قابل گسترش فعلی گسترش یابد؟',
            },
            {
                propName: 'indent',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا باید آیتم‌های فرزند منو تو رفتگی داشته باشند؟',
            },
            {
                propName: 'label',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'محتوای آیتم منوی قابل گسترش',
            },
            {
                propName: 'onToggle',
                type: `<code>(expanded: boolean, e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'بازخورد زمانی که آیتم منوی قابل گسترش تغییر وضعیت می‌دهد',
            },
        ],
    },
    {
        component: 'گروه منو (Menu.MenuGroup)',
        api: [
            {
                propName: 'label',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'محتوای عنوان گروه منوی قابل گسترش',
            },
        ],
    },
    {
        component: 'آیتم منو (Menu.MenuItem)',
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'div'</code>`,
                desc: 'عنصر رندر شده',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا آیتم منو غیرفعال باشد؟',
            },
            {
                propName: 'dotIndent',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا نقطه به عنوان پیشوند در آیتم منو نمایش داده شود؟',
            },
            {
                propName: 'eventKey',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'مقدار منحصر به فرد برای آیتم منو',
            },
            {
                propName: 'isActive',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا آیتم منو فعال باشد؟',
            },
            {
                propName: 'menuItemHeight',
                type: `<code>string</code> | <code>number</code>`,
                default: `<code>40</code>`,
                desc: 'ارتفاع آیتم منو',
            },
            {
                propName: 'onSelect',
                type: `<code>(eventKey: string, e: MouseEvent) => void</code>`,
                default: `<code>40</code>`,
                desc: 'بازخورد زمانی که آیتم منو انتخاب می‌شود',
            },
        ],
    },
]



const Menu = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Menu
