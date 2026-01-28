import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Simple from './Simple'
import Group from './Group'
import Disabled from './Disabled'
import Vertical from './Vertical'
import Color from './Color'

const mdPath = 'Radio'

const demoHeader = {
    title: 'رادیو (Radio)',
    desc: 'رادیوها به کاربران این امکان را می‌دهند که یک گزینه از مجموعه‌ای از گزینه‌ها را انتخاب کنند.',
}

const demos = [
    {
        mdName: 'Simple',
        mdPath: mdPath,
        title: 'ساده (Simple)',
        desc: `مثال ساده از رادیو.`,
        component: <Simple />,
    },
    {
        mdName: 'Group',
        mdPath: mdPath,
        title: 'گروه (Group)',
        desc: `مثال گروه رادیو کنترل‌شده.`,
        component: <Group />,
    },
    {
        mdName: 'Disabled',
        mdPath: mdPath,
        title: 'غیرفعال (Disabled)',
        desc: `<code>Radio</code> و <code>Radio.Group</code> به شما این امکان را می‌دهند که از پراپ <code>disabled</code> برای جلوگیری از کلیک کاربر استفاده کنید.`,
        component: <Disabled />,
    },
    {
        mdName: 'Vertical',
        mdPath: mdPath,
        title: 'عمودی (Vertical)',
        desc: `لیست رادیو می‌تواند به صورت عمودی نمایش داده شود.`,
        component: <Vertical />,
    },
    {
        mdName: 'Color',
        mdPath: mdPath,
        title: 'رنگ (Color)',
        desc: `رادیو و گروه می‌توانند از طریق پراپ <code>radioClass</code> استایل سفارشی دریافت کنند.`,
        component: <Color />,
    },
]

const demoApi = [
    {
        component: 'رادیو (Radio)',
        api: [
            {
                propName: 'checked',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا رادیو انتخاب شده است؟',
            },
            {
                propName: 'radioClass',
                type: `<code>string</code>`,
                default: '-',
                desc: 'استایل سفارشی برای رادیو',
            },
            {
                propName: 'defaultChecked',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا وضعیت اولیه رادیو انتخاب شده است؟',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا رادیو غیرفعال است؟',
            },
            {
                propName: 'labelRef',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'رفرنس عنصر برچسب رادیو',
            },
            {
                propName: 'name',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نام فیلد ورودی رادیو',
            },
            {
                propName: 'onChange',
                type: `<code>(value: any, e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'کال‌بک هنگام تغییر مقدار رادیو',
            },
            {
                propName: 'value',
                type: `<code>any</code>`,
                default: `-`,
                desc: 'مقدار رادیو',
            },
            {
                propName: 'vertical',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'نمایش رادیو به صورت عمودی',
            },
        ],
    },
    {
        component: 'گروه رادیو (Radio.Group)',
        api: [
            {
                propName: 'color',
                type: `<code>string</code>`,
                default: 'رنگ تم فعلی',
                desc: 'رنگ سفارشی برای تمام رادیوهای گروه، گزینه‌های رنگ بر اساس <code>theme.colors</code> از Tailwind.',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: '-',
                desc: 'آیا تمام رادیوها غیرفعال هستند؟',
            },
            {
                propName: 'name',
                type: `<code>string</code>`,
                default: '-',
                desc: 'نام رادیوهای گروه رادیو',
            },
            {
                propName: 'onChange',
                type: `<code>(values: any, e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'کال‌بک هنگام تغییر مقدار',
            },
            {
                propName: 'value',
                type: `<code>any</code>`,
                default: `-`,
                desc: 'مقدار انتخاب‌شده رادیوها',
            },
            {
                propName: 'vertical',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'نمایش لیست رادیوها به صورت عمودی',
            },
        ],
    },
]

const Radio = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Radio
