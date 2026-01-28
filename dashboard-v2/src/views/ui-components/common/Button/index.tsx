import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Variant from './Variant'
import Size from './Size'
import Color from './Color'
import Disabled from './Disabled'
import Shape from './Shape'
import ButtonWithIcon from './ButtonWithIcon'
import Icon from './Icon'
import Loading from './Loading'
import Block from './Block'

const mdPath = 'Button'

const demoHeader = {
    title: 'دکمه (Button)',
    desc: 'دکمه برای شروع یک عملیات فوری استفاده می شود و زمانی که یک عمل یا رویداد را راه اندازی می کند استفاده می شود',
}

const demos = [
    {
        mdName: 'نوع',
        mdPath: mdPath,
        title: 'نوع (Variant)',
        desc: `چند نوع ظاهر مختلف برای دکمه وجود دارد. می‌توانید مقدار ویژگی <code>variant</code> را به
        <code>default</code>، <code>twoTone</code>، <code>solid</code>، یا <code>plain</code> تنظیم کنید.`,
        component: <Variant />,
    },
    {
        mdName: 'Size',
        mdPath: mdPath,
        title: 'اندازه (Size)',
        desc: `دکمه‌ها دارای چهار نوع اندازه هستند: <code>xs</code>، <code>sm</code>، <code>md</code> و <code>lg</code>. اندازه پیش‌فرض <code>md</code> است.`,
        component: <Size />,
    },
    {
        mdName: 'Color',
        mdPath: mdPath,
        title: 'رنگ (Color)',
        desc: `می‌توانید استایل دکمه‌ها را با بازنویسی کلاس‌های Tailwind CSS سفارشی کنید.`,
        component: <Color />,
    },
    {
        mdName: 'Disabled',
        mdPath: mdPath,
        title: 'غیرفعال (Disabled)',
        desc: `دکمه غیرفعال از تعامل کاربر جلوگیری می‌کند. ویژگی <code>disabled</code> را روی <code>true</code> قرار دهید تا دکمه غیرفعال شود.`,
        component: <Disabled />,
    },
    {
        mdName: 'Shape',
        mdPath: mdPath,
        title: 'شکل (Shape)',
        desc: `شکل دکمه می‌تواند به <code>none</code> یا <code>circle</code> تنظیم شود. شکل پیش‌فرض <code>round</code> است.`,
        component: <Shape />,
    },
    {
        mdName: 'Icon',
        mdPath: mdPath,
        title: 'آیکون (Icon)',
        desc: `می‌توانید با اضافه کردن آیکون به ویژگی <code>icon</code>، دکمه‌ای همراه با آیکون ایجاد کنید.`,
        component: <Icon />,
    },
    {
        mdName: 'ButtonWithIcon',
        mdPath: mdPath,
        title: 'دکمه همراه با آیکون (Button With Icon)',
        desc: `می‌توانید آیکون‌ها را به دکمه‌ها اضافه کنید و آن‌ها را با متن ترکیب کنید، همان‌طور که در مثال‌های زیر نشان داده شده است.`,
        component: <ButtonWithIcon />,
    },
    {
        mdName: 'Loading',
        mdPath: mdPath,
        title: 'در حال بارگذاری (Loading)',
        desc: `با تنظیم ویژگی <code>loading</code> روی true، نشانگر بارگذاری نمایش داده می‌شود و دکمه نیز غیرفعال می‌شود.`,
        component: <Loading />,
    },
    {
        mdName: 'Block',
        mdPath: mdPath,
        title: 'بلوک (Block)',
        desc: `دکمه‌ها می‌توانند با اضافه کردن ویژگی <code>block</code> تمام عرض را پر کنند.`,
        component: <Block />,
    },
]

const demoApi = [
    {
        component: '(دکمه) Button',
        api: [
            {
                propName: 'variant',
                type: `<code>'solid'</code>  | <code>'plain'</code> | <code>'default'</code>`,
                default: `<code>'default'</code>`,
                desc: 'نوع دکمه',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code> | <code>'xs'</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه دکمه',
            },
            {
                propName: 'clickFeedback',
                type: `<code>boolean</code>`,
                default: '<code>true</code>',
                desc: 'اثر بازخورد هنگام کلیک روی دکمه',
            },
            {
                propName: 'customColorClass',
                type: `<code>(state: {active: boolean, unclickable: boolean}) => string</code>`,
                default: '-',
                desc: 'تابع بازگشتی برای ایجاد رنگ سفارشی برای دکمه',
            },
            {
                propName: 'shape',
                type: `<code>'round'</code>  | <code>'circle'</code> | <code>'none'</code>`,
                default: `<code>'round'</code>`,
                desc: 'شعاع حاشیه دکمه',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'از تعامل کاربر با دکمه جلوگیری می‌کند',
            },
            {
                propName: 'icon',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'آیکون را نمایش می‌دهد',
            },
            {
                propName: 'active',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'دکمه را به وضعیت فعال تغییر می‌دهد',
            },
            {
                propName: 'loading',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'یک نشانگر بارگذاری را نشان می‌دهد و دکمه را غیرفعال می‌کند',
            },
            {
                propName: 'block',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'دکمه را به صورت تمام عرض به اندازه کانتینر خود می‌سازد',
            },
        ],
    },
]


const Button = () => {
    return (
        <>
            <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
        </>
    )
}

export default Button
