import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Sizes from './Sizes'
import Disabled from './Disabled'
import Affix from './Affix'
import PasswordVisible from './PasswordVisible'
import Textarea from './Textarea'
import Invalid from './Invalid'
import ControlledInput from './ControlledInput'

const mdPath = 'Input'

const demoHeader = {
    title: 'ورودی (Input)',
    desc: 'کامپوننت ورودی، یک فیلد را مشخص می‌کند که کاربر می‌تواند داده وارد کند.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `ساده‌ترین استفاده از ورودی.`,
        component: <Basic />,
    },
    {
        mdName: 'Sizes',
        mdPath: mdPath,
        title: 'اندازه‌ها (Sizes)',
        desc: `سه گزینه برای اندازه فیلد ورودی وجود دارد.`,
        component: <Sizes />,
    },
    {
        mdName: 'Disabled',
        mdPath: mdPath,
        title: 'غیرفعال (Disabled)',
        desc: `ورودی غیرفعال.`,
        component: <Disabled />,
    },
    {
        mdName: 'Affix',
        mdPath: mdPath,
        title: 'پیشوند/پسوند (Affix)',
        desc: `ورودی می‌تواند محتوای <code>suffix</code> یا <code>prefix</code> داخل خود داشته باشد.`,
        component: <Affix />,
    },
    {
        mdName: 'PasswordVisible',
        mdPath: mdPath,
        title: 'رمز قابل مشاهده (Password Visible)',
        desc: `نمونه‌ای از کنترل نوع ورودی از طریق آیکون پیشوند.`,
        component: <PasswordVisible />,
    },
    {
        mdName: 'Textarea',
        mdPath: mdPath,
        title: 'متن‌ چندخطی (Textarea)',
        desc: `تبدیل فیلد ورودی به متن چندخطی با تنظیم <code>textarea</code> به true.`,
        component: <Textarea />,
    },
    {
        mdName: 'Invalid',
        mdPath: mdPath,
        title: 'نامعتبر (Invalid)',
        desc: `نمایش ورودی به‌عنوان وضعیت نامعتبر زمانی که <code>invalid</code> روی true تنظیم شده است.`,
        component: <Invalid />,
    },
    {
        mdName: 'ControlledInput',
        mdPath: mdPath,
        title: 'ورودی کنترل‌شده (Controlled Input)',
        desc: `نمونه‌ای از ورودی کنترل‌شده.`,
        component: <ControlledInput />,
    },
]


const demoApi = [
    {
        component: 'ورودی (Input)',
        api: [
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا ورودی غیرفعال است',
            },
            {
                propName: 'invalid',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا ورودی وضعیت نامعتبر دارد',
            },
            {
                propName: 'onBlur',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'زمانی که ورودی فوکوس را از دست می‌دهد، فراخوانی می‌شود',
            },
            {
                propName: 'onChange',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'زمانی که مقدار ورودی تغییر می‌کند، فراخوانی می‌شود',
            },
            {
                propName: 'onFocus',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'زمانی که ورودی فوکوس می‌شود، فراخوانی می‌شود',
            },
            {
                propName: 'prefix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پیشوند داخل ورودی',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه ورودی',
            },
            {
                propName: 'suffix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پسوند داخل ورودی',
            },
            {
                propName: 'textArea',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا ورودی به فیلد متن چندخطی تبدیل شود',
            },
            {
                propName: 'type',
                type: `<code>string</code>`,
                default: `<code>'text'</code>`,
                desc: 'نوع ورودی، برای انواع موجود به <a class="text-blue-500 underline" href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types" target="_blank">MDN</a> مراجعه کنید',
            },
            {
                propName: 'unstyle',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا استایل پیش‌فرض ورودی حذف شود',
            },
        ],
    },
]


const Input = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Input
