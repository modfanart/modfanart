import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import TimeRangeInput from './TimeRangeInput'
import Controlled from './Controlled'
import Seconds from './Seconds'
import AmPm from './AmPm'
import Sizes from './Sizes'
import Disabled from './Disabled'
import Affix from './Affix'
import Invalid from './Invalid'

const mdPath = 'TimeInput'

const demoHeader = {
    title: 'ورودی زمان (TimeInput)',
    desc: 'فیلد ورودی که به کاربر امکان وارد کردن زمان مشخصی را می‌دهد.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `مثال پایه‌ای از ورودی زمان.`,
        component: <Basic />,
    },
    {
        mdName: 'TimeRangeInput',
        mdPath: mdPath,
        title: 'ورودی بازه زمانی (Time range input)',
        desc: `مثال پایه‌ای برای ورودی بازه زمانی.`,
        component: <TimeRangeInput />,
    },
    {
        mdName: 'Controlled',
        mdPath: mdPath,
        title: 'کنترلی (Controlled)',
        desc: `استفاده کنترل‌شده.`,
        component: <Controlled />,
    },
    {
        mdName: 'Seconds',
        mdPath: mdPath,
        title: 'نمایش ثانیه‌ها',
        desc: `ما همچنین می‌توانیم ثانیه‌ها را برای ورودی فعال کنیم.`,
        component: <Seconds />,
    },
    {
        mdName: 'AmPm',
        mdPath: mdPath,
        title: 'نمایش AM یا PM',
        desc: `با تنظیم ویژگی <code>format</code> به <code>'12'</code> زمان را به فرمت ۱۲ ساعته تغییر دهید.`,
        component: <AmPm />,
    },
    {
        mdName: 'Sizes',
        mdPath: mdPath,
        title: 'اندازه‌ها (Sizes)',
        desc: `سه اندازه مختلف برای ورودی زمان وجود دارد.`,
        component: <Sizes />,
    },
    {
        mdName: 'Disabled',
        mdPath: mdPath,
        title: 'غیرفعال (Disabled)',
        desc: `ورودی زمان غیرفعال.`,
        component: <Disabled />,
    },
    {
        mdName: 'Affix',
        mdPath: mdPath,
        title: 'افیکس (Affix)',
        desc: `ورودی زمان می‌تواند محتوای <code>suffix</code> یا <code>prefix</code> را در داخل خود داشته باشد.`,
        component: <Affix />,
    },
    {
        mdName: 'Invalid',
        mdPath: mdPath,
        title: 'وضعیت نامعتبر (Invalid state)',
        desc: `نمایش ورودی زمان به عنوان وضعیت نامعتبر زمانی که ویژگی <code>invalid</code> برابر true باشد.`,
        component: <Invalid />,
    },
]

const demoApi = [
    {
        component: 'ورودی زمان (TimeInput)',
        api: [
            {
                propName: 'amLabel',
                type: `<code>'string'</code>`,
                default: `<code>'am'</code>`,
                desc: 'رشته نمایشی برای صبح',
            },
            {
                propName: 'amPmPlaceholder',
                type: `<code>'string'</code>`,
                default: `<code>'am'</code>`,
                desc: 'Placeholder برای فیلد صبح/بعدازظهر',
            },
            {
                propName: 'clearable',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا امکان پاک کردن مقدار وجود دارد',
            },
            {
                propName: 'defaultValue',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'مقدار پیش‌فرض برای TimeInput (اگر کنترل شده است از value استفاده کنید)',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا TimeInput غیرفعال است',
            },
            {
                propName: 'format',
                type: `<code>'12'</code> | <code>'24'</code>`,
                default: `<code>'24'</code>`,
                desc: 'فرمت زمان را تعیین می‌کند',
            },
            {
                propName: 'invalid',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا TimeInput در وضعیت نامعتبر است',
            },
            {
                propName: 'nextRef',
                type: `<code>RefObject</code>`,
                default: `-`,
                desc: 'رفرنس برای تمرکز پس از آخرین فیلد TimeInput، می‌تواند توسط TimeInputRange استفاده شود',
            },
            {
                propName: 'onChange',
                type: `<code>(value: Date) => void</code>`,
                default: `-`,
                desc: 'کال بک زمانی که مقدار TimeInput تغییر کرد',
            },
            {
                propName: 'pmLabel',
                type: `<code>'string'</code>`,
                default: `<code>'pm'</code>`,
                desc: 'رشته نمایشی برای بعدازظهر',
            },
            {
                propName: 'prefix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پیشوند در داخل TimeInput',
            },
            {
                propName: 'showSeconds',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا فیلد ثانیه نمایش داده می‌شود',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه TimeInput',
            },
            {
                propName: 'suffix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `<code>ReactNode</code>`,
                desc: 'نمایش محتوای پسوند در داخل TimeInput',
            },
            {
                propName: 'timeFieldPlaceholder',
                type: `<code>'string'</code>`,
                default: `<code>'--'</code>`,
                desc: 'Placeholder برای فیلد زمان',
            },
            {
                propName: 'timeFieldClass',
                type: `<code>'string'</code>`,
                default: `-`,
                desc: 'کلاس اضافی برای فیلد زمان',
            },
            {
                propName: 'value',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'مقدار TimeInput (کنترل شده)',
            },
        ],
    },
    {
        component:'ورودی رنج زمانی (TimeInput.TimeInputRange)',
        api: [
            {
                propName: 'amLabel',
                type: `<code>'string'</code>`,
                default: `<code>'am'</code>`,
                desc: 'رشته نمایشی برای صبح',
            },
            {
                propName: 'amPmPlaceholder',
                type: `<code>'string'</code>`,
                default: `<code>'am'</code>`,
                desc: 'Placeholder برای فیلد صبح/بعدازظهر',
            },
            {
                propName: 'clearable',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا امکان پاک کردن مقدار وجود دارد',
            },
            {
                propName: 'defaultValue',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'مقدار پیش‌فرض برای TimeInputRange (اگر کنترل شده است از value استفاده کنید)',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا TimeInputRange غیرفعال است',
            },
            {
                propName: 'format',
                type: `<code>'12'</code> | <code>'24'</code>`,
                default: `<code>'24'</code>`,
                desc: 'فرمت زمان را تعیین می‌کند',
            },
            {
                propName: 'invalid',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا TimeInputRange در وضعیت نامعتبر است',
            },
            {
                propName: 'nextRef',
                type: `<code>RefObject</code>`,
                default: `-`,
                desc: 'رفرنس برای تمرکز پس از آخرین فیلد TimeInputRange، می‌تواند توسط TimeInputRangeRange استفاده شود',
            },
            {
                propName: 'onChange',
                type: `<code>(value: Date) => void</code>`,
                default: `-`,
                desc: 'کال بک زمانی که مقدار TimeInputRange تغییر کرد',
            },
            {
                propName: 'pmLabel',
                type: `<code>'string'</code>`,
                default: `<code>'pm'</code>`,
                desc: 'رشته نمایشی برای بعدازظهر',
            },
            {
                propName: 'prefix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پیشوند در داخل TimeInputRange',
            },
            {
                propName: 'separator',
                type: `<code>'string'</code> | <code>'24'</code>`,
                default: `<code>'~'</code>`,
                desc: 'فاصل‌گذار بین ورودی‌های زمان',
            },
            {
                propName: 'showSeconds',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا فیلد ثانیه نمایش داده می‌شود',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه TimeInputRange',
            },
            {
                propName: 'suffix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `<code>ReactNode</code>`,
                desc: 'نمایش محتوای پسوند در داخل TimeInputRange',
            },
            {
                propName: 'timeFieldPlaceholder',
                type: `<code>'string'</code>`,
                default: `<code>'--'</code>`,
                desc: 'Placeholder برای فیلد زمان',
            },
            {
                propName: 'timeFieldClass',
                type: `<code>'string'</code>`,
                default: `-`,
                desc: 'کلاس اضافی برای فیلد زمان',
            },
            {
                propName: 'value',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'مقدار TimeInputRange (کنترل شده)',
            },
        ],
    },
];


const Switcher = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Switcher
