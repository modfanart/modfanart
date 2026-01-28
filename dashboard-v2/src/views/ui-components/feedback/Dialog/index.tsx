import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Size from './Size'
import CloseWithEscBackdrop from './CloseWithEscBackdrop'
import InternalScroll from './InternalScroll'
import StaticBackdrop from './StaticBackdrop'
import CustomStyle from './CustomStyle'
import Closable from './Closable'

const mdPath = 'Dialog'

const demoHeader = {
    title: 'دیالوگ (Dialog)',
    desc: 'دیالوگ یک جعبه است که روی صفحه فعلی قرار می‌گیرد و کاربر را مجبور به تعامل می‌کند.',
}


const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `استفاده پایه از دیالوگ.`,
        component: <Basic />,
    },
    {
        mdName: 'Size',
        mdPath: mdPath,
        title: 'اندازه (Size)',
        desc: `دیالوگ به ما این امکان را می‌دهد که <code>عرض</code> و <code>ارتفاع</code> را برای تنظیم اندازه دیالوگ وارد کنیم.`,
        component: <Size />,
    },
    {
        mdName: 'CloseWithEscBackdrop',
        mdPath: mdPath,
        title: 'غیرفعال کردن بستن با Escape و کلیک روی بک‌دراپ',
        desc: `ما می‌توانیم با تنظیم <code>shouldCloseOnOverlayClick</code> و <code>shouldCloseOnEsc</code> propها، بستن دیالوگ با دکمه Escape و کلیک روی بک‌دراپ را غیرفعال کنیم.`,
        component: <CloseWithEscBackdrop />,
    },
    {
        mdName: 'InternalScroll',
        mdPath: mdPath,
        title: 'اسکرول داخلی (Internal Scroll)',
        desc: `مثالی از اسکرول داخلی دیالوگ.`,
        component: <InternalScroll />,
    },
    {
        mdName: 'StaticBackdrop',
        mdPath: mdPath,
        title: 'قفل کردن اسکرول (Lock Scroll)',
        desc: `ما می‌توانیم با ارسال <code>'overflow-hidden</code> به <code>bodyOpenClassName</code>، اسکرول پنجره را قفل کنیم.`,
        component: <StaticBackdrop />,
    },
    {
        mdName: 'CustomStyle',
        mdPath: mdPath,
        title: 'استایل سفارشی دیالوگ (Custom dialog style)',
        desc: `مثالی از استایل سفارشی دیالوگ.`,
        component: <CustomStyle />,
    },
    {
        mdName: 'Closable',
        mdPath: mdPath,
        title: 'قابل بستن (Closable)',
        desc: `با تنظیم <code>closeable</code> به false، آیکون بستن دیالوگ مخفی خواهد شد.`,
        component: <Closable />,
    },
]

const demoApi = [
    {
        component: 'دیالوگ',
        api: [
            {
                propName: 'width',
                type: `<code>string</code> | <code>number</code>`,
                default: `<code>520</code>`,
                desc: 'عرض دیالوگ',
            },
            {
                propName: 'height',
                type: `<code>string</code> | <code>number</code>`,
                default: `-`,
                desc: 'ارتفاع دیالوگ',
            },
            {
                propName: 'isOpen',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا دیالوگ نمایش داده شود',
            },
            {
                propName: 'style',
                type: `<code>object: { content: object, overlay: object }</code>`,
                default: `<-`,
                desc: 'استایل برای دیالوگ و پس‌زمینه',
            },
            {
                propName: 'contentClassName',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نام کلاس که به محتوای دیالوگ افزوده می‌شود',
            },
            {
                propName: 'portalClassName',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نام کلاس که به دروازه‌ی دیالوگ افزوده می‌شود',
            },
            {
                propName: 'bodyOpenClassName',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نام کلاس که به بدنه اضافه می‌شود وقتی دیالوگ باز است',
            },
            {
                propName: 'htmlOpenClassName',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نام کلاس که به HTML اضافه می‌شود وقتی دیالوگ باز است',
            },
            {
                propName: 'overlayClassName',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نام کلاس برای پس‌زمینه دیالوگ',
            },
            {
                propName: 'appElement',
                type: `<code>SafeHTMLElement</code> | <code>SafeHTMLCollection</code> | <code>SafeNodeList</code> | <code>SafeHTMLElement[]</code>`,
                default: `-`,
                desc: 'تنظیم عنصر خارجی به محتوای دیالوگ',
            },
            {
                propName: 'onAfterOpen',
                type: `<code>(overlayElement: HTMLElement, contentElement: HTMLElement) => void</code>`,
                default: `-`,
                desc: 'تابع بازگشتی بعد از باز شدن دیالوگ',
            },
            {
                propName: 'closable',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا آیکن بستن دیالوگ نمایش داده شود',
            },
            {
                propName: 'onClose',
                type: `<code>(event: Event) => void</code>`,
                default: `-`,
                desc: 'تابع بازگشتی بعد از کلیک بر روی آیکن بستن دیالوگ',
            },
            {
                propName: 'onRequestClose',
                type: `<code>(event: Event) => void</code>`,
                default: `-`,
                desc: 'تابع بازگشتی بعد از بستن دیالوگ',
            },
            {
                propName: 'closeTimeoutMS',
                type: `<code>(event: Event) => void</code>`,
                default: `<code>150</code>`,
                desc: 'زمان تاخیر هنگام بستن دیالوگ',
            },
            {
                propName: 'shouldFocusAfterRender',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا دیالوگ باید بعد از رندر فوکوس شود',
            },
            {
                propName: 'shouldReturnFocusAfterClose',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا باید فوکوس را به عنصری که قبلاً فوکوس شده بود بازگرداند',
            },
            {
                propName: 'preventScroll',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا باید از preventScroll برای بازگرداندن فوکوس به عنصر قبلی استفاده شود',
            },
            {
                propName: 'shouldCloseOnOverlayClick',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا دیالوگ باید زمانی که پس‌زمینه کلیک شد بسته شود',
            },
            {
                propName: 'shouldCloseOnEsc',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا دیالوگ باید زمانی که کلید Esc فشرده شد بسته شود',
            },
            {
                propName: 'parentSelector',
                type: `<code>() => document.body</code>`,
                default: `<code>() => document.body</code>`,
                desc: 'تابعی که برای دریافت عنصر والد برای اتصال دیالوگ به آن فراخوانی خواهد شد',
            },
            {
                propName: 'overlayRef',
                type: `<code>(node: Node) => void</code>`,
                default: `-`,
                desc: 'رفرنس پس‌زمینه دیالوگ',
            },
            {
                propName: 'contentRef',
                type: `<code>(node: Node) => void</code>`,
                default: `-`,
                desc: 'رفرنس محتوای دیالوگ',
            },
        ],
    },
]


const Dialog = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Dialog
