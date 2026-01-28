import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Content from './Content'
import Disabled from './Disabled'
import Loading from './Loading'
import Colors from './Colors'
import Controlled from './Controlled'

const mdPath = 'Switcher'

const demoHeader = {
    title: 'سوئیچر (Switcher)',
    desc: 'کامپوننت سوئیچر به عنوان جایگزینی برای چک‌باکس تک‌تک استفاده می‌شود، که می‌تواند بین حالت فعال یا غیرفعال تغییر کند.',
}

const demos = [
    {
        mdName: 'پایه (Basic)',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `مثال پایه برای سوئیچر.`,
        component: <Basic />,
    },
    {
        mdName: 'محتوا (Content)',
        mdPath: mdPath,
        title: 'محتوا (Content)',
        desc: `سوئیچر می‌تواند محتوای مختلفی در حالت فعال یا غیرفعال داشته باشد.`,
        component: <Content />,
    },
    {
        mdName: 'غیرفعال (Disabled)',
        mdPath: mdPath,
        title: 'غیرفعال (Disabled)',
        desc: `برای غیرفعال کردن سوئیچر، <code>disabled</code> را به true تنظیم کنید.`,
        component: <Disabled />,
    },
    {
        mdName: 'در حال بارگذاری (Loading)',
        mdPath: mdPath,
        title: 'در حال بارگذاری (Loading)',
        desc: `می‌توانیم <code>isLoading</code> را به true تنظیم کنیم و وضعیت سوئیچر را در حالت در حال انتظار قرار دهیم.`,
        component: <Loading />,
    },
    {
        mdName: 'رنگ‌ها (Colors)',
        mdPath: mdPath,
        title: 'رنگ‌ها (Colors)',
        desc: `می‌توانیم رنگ سفارشی را از طریق <code>color</code> به سوئیچر اعمال کنیم.`,
        component: <Colors />,
    },
    {
        mdName: 'کنترلی (Controlled)',
        mdPath: mdPath,
        title: 'کنترلی (Controlled)',
        desc: `مثال کنترل‌شده.`,
        component: <Controlled />,
    },
]

const demoApi = [
    {
        component: 'سوئیچر (Switcher)',
        api: [
            {
                propName: 'checked',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا سوئیچر انتخاب شده است؟',
            },
            {
                propName: 'checkedContent',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'محتوای نمایش داده شده زمانی که وضعیت سوئیچر انتخاب شده باشد',
            },
            {
                propName: 'defaultChecked',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا وضعیت اولیه سوئیچر انتخاب شده است؟',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا سوئیچر غیرفعال است؟',
            },
            {
                propName: 'isLoading',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا سوئیچر در حال بارگذاری است؟',
            },
            {
                propName: 'labelRef',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'مرجع برچسب سوئیچر',
            },
            {
                propName: 'name',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نام فیلد ورودی سوئیچر',
            },
            {
                propName: 'onChange',
                type: `<code>(checked: boolean, e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'فراخوانی هنگام تغییر مقدار سوئیچر',
            },
            {
                propName: 'readOnly',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا سوئیچر فقط خواندنی است؟',
            },
            {
                propName: 'switcherClass',
                type: `<code>string</code>`,
                default: 'رنگ تم جاری',
                desc: 'CSS سفارشی برای سوئیچر',
            },
            {
                propName: 'unCheckedContent',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'محتوای نمایش داده شده زمانی که وضعیت سوئیچر انتخاب نشده باشد',
            },
        ],
    },
]

const Switcher = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Switcher
