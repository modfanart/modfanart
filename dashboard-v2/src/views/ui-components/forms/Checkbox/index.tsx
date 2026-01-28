import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Default from './Default'
import Group from './Group'
import Disabled from './Disabled'
import Vertical from './Vertical'
import Color from './Color'

const mdPath = 'Checkbox'

const demoHeader = {
    title: 'چک‌باکس (Checkbox)',
    desc: 'چک‌باکس‌ها به کاربران این امکان را می‌دهند که یکی یا چند گزینه را از فهرستی انتخاب کنند.',
}

const demos = [
    {
        mdName: 'Default',
        mdPath: mdPath,
        title: 'پیش‌فرض (Default)',
        desc: `مثال ساده‌ای از چک‌باکس.`,
        component: <Default />,
    },
    {
        mdName: 'Group',
        mdPath: mdPath,
        title: 'گروه (Group)',
        desc: `<code>Checkbox.Group</code> به مدیریت وضعیت چک‌باکس‌ها در یک فهرست کمک می‌کند.`,
        component: <Group />,
    },
    {
        mdName: 'Disabled',
        mdPath: mdPath,
        title: 'غیرفعال (Disabled)',
        desc: `چک‌باکس امکان غیرفعال شدن با استفاده از <code>disabled</code> برای جلوگیری از اجرای رویداد کلیک توسط کاربر را دارد.`,
        component: <Disabled />,
    },
    {
        mdName: 'Vertical',
        mdPath: mdPath,
        title: 'عمودی (Vertical)',
        desc: `فهرست چک‌باکس‌ها می‌تواند به‌صورت عمودی نیز نمایش داده شود.`,
        component: <Vertical />,
    },
    {
        mdName: 'Color',
        mdPath: mdPath,
        title: 'رنگ (Color)',
        desc: `چک‌باکس و گروه چک‌باکس‌ها می‌توانند با استفاده از <code>color</code> پروپ سفارشی شوند.`,
        component: <Color />,
    },
]

const demoApi = [
    {
        component: 'چک‌باکس (Checkbox)',
        api: [
            {
                propName: 'checked',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا چک‌باکس انتخاب شده است',
            },
            {
                propName: 'defaultChecked',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا وضعیت اولیه چک‌باکس انتخاب شده است',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا چک‌باکس غیرفعال است',
            },
            {
                propName: 'value',
                type: `<code>string</code> | <code>number</code>`,
                default: `-`,
                desc: 'مقدار وضعیت انتخاب شده (فقط زمانی که Checkbox.Group یا نوع شیء مرتبط آرایه باشد معتبر است)',
            },
            {
                propName: 'labelRef',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'رفرنس عنصر برچسب چک‌باکس',
            },
            {
                propName: 'checkboxClass',
                type: `<code>string</code>`,
                default: '-',
                desc: 'استایل سفارشی برای چک‌باکس',
            },
            {
                propName: 'onChange',
                type: `<code>(checked: boolean, e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'کالبک زمانی که مقدار چک‌باکس تغییر کند',
            },
            {
                propName: 'name',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نام فیلد ورودی چک‌باکس',
            },
        ],
    },
    {
        component:'انتخاب گروهی (Checkbox.Group)',
        api: [
            {
                propName: 'vertical',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'نمایش فهرست چک‌باکس‌ها به‌صورت عمودی',
            },
            {
                propName: 'color',
                type: `<code>string</code>`,
                default: 'رنگ پیش‌فرض تم جاری',
                desc: 'رنگ سفارشی برای تمام چک‌باکس‌ها در گروه، رنگ‌های قابل استفاده بر اساس <code>theme.colors</code> در tailwind',
            },
            {
                propName: 'value',
                type: `<code>string[]</code> | <code>number[]</code>`,
                default: `-`,
                desc: 'مقدار انتخابی چک‌باکس‌ها را مشخص کنید',
            },
            {
                propName: 'onChange',
                type: `<code>(values: string[] | number[], e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'کالبک زمانی که مقدار تغییر کند',
            },
            {
                propName: 'name',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نام تمام فیلدهای ورودی چک‌باکس‌ها در گروه',
            },
        ],
    },
]


const Checkbox = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Checkbox
