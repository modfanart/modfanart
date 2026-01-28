import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Placement from './Placement'
import WidthHeight from './WidthHeight'
import Footer from './Footer'
import CustomStyle from './CustomStyle'
import Closable from './Closable'

const mdPath = 'Drawer'

const demoHeader = {
    title: 'دراور (Drawer)',
    desc: 'دراور یک پنل است که از لبه‌ی صفحه بیرون می‌آید و محتوای تکمیلی را شامل می‌شود.',
}
const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `استفاده پایه از دراور.`,
        component: <Basic />,
    },
    {
        mdName: 'Placement',
        mdPath: mdPath,
        title: 'محل قرارگیری (Placement)',
        desc: `برای تنظیم محل بیرون آمدن دراور، <code>placement</code> prop را به یکی از مقادیر <code>'top'</code>، <code>'right'</code>، <code>'bottom'</code> یا <code>'left'</code> تغییر دهید.`,
        component: <Placement />,
    },
    {
        mdName: 'WidthHeight',
        mdPath: mdPath,
        title: 'عرض و ارتفاع (Width & Height)',
        desc: `ما می‌توانیم عرض و ارتفاع دراور را از طریق <code>height</code> و <code>width</code> prop تنظیم کنیم.`,
        component: <WidthHeight />,
    },
    {
        mdName: 'Footer',
        mdPath: mdPath,
        title: 'فوتر (Footer)',
        desc: `ما همچنین می‌توانیم یک فوتر زیر دراور داشته باشیم.`,
        component: <Footer />,
    },
    {
        mdName: 'CustomStyle',
        mdPath: mdPath,
        title: 'استایل سفارشی (Custom Style)',
        desc: `دراور به ما این امکان را می‌دهد که کلاس‌های اضافی را از طریق <code>headerClass</code>، <code>bodyClass</code> و <code>footerClass</code> تنظیم کنیم.`,
        component: <CustomStyle />,
    },
    {
        mdName: 'Closable',
        mdPath: mdPath,
        title: 'قابل بستن (Closable)',
        desc: `با تنظیم <code>closeable</code> به false، آیکون بستن دراور مخفی خواهد شد.`,
        component: <Closable />,
    },
]

const demoApi = [
    {
        component: 'دراور (Drawer)',
        api: [
            {
                propName: 'placement',
                type: `<code>'top'</code> | <code>'right'</code> | <code>'bottom'</code> | <code>'left'</code> `,
                default: `<code>'right'</code>`,
                desc: `محل قرارگیری دراور`,
            },
            {
                propName: 'width',
                type: `<code>string</code> | <code>number</code>`,
                default: `<code>400</code>`,
                desc: `عرض دراور، (فقط زمانی که محل قرارگیری به <code>'left'</code> یا <code>'right'</code> تنظیم شده باشد)`,
            },
            {
                propName: 'height',
                type: `<code>string</code> | <code>number</code>`,
                default: `<code>400</code>`,
                desc: `ارتفاع دراور، (فقط زمانی که محل قرارگیری به <code>'top'</code> یا <code>'bottom'</code> تنظیم شده باشد)`,
            },
            {
                propName: 'title',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: `عنوان دراور`,
            },
            {
                propName: 'footer',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: `فوتر دراور`,
            },
            {
                propName: 'headerClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: `کلاس اضافی برای هدر دراور (<code>!</code> استفاده از این مدیفایر برای غلبه بر استایل‌های Tailwind CSS توصیه می‌شود)`,
            },
            {
                propName: 'bodyClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: `کلاس اضافی برای بدنه دراور (<code>!</code> استفاده از این مدیفایر برای غلبه بر استایل‌های Tailwind CSS توصیه می‌شود)`,
            },
            {
                propName: 'footerClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: `کلاس اضافی برای فوتر دراور (<code>!</code> استفاده از این مدیفایر برای غلبه بر استایل‌های Tailwind CSS توصیه می‌شود)`,
            },
            {
                propName: 'showBackdrop',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا پس‌زمینه دراور نمایش داده شود',
            },
            {
                propName: 'lockScroll',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا اسکرول پنجره را هنگام باز بودن دراور غیرفعال کند',
            },
            {
                propName: 'isOpen',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا دراور نمایش داده شود',
            },
            {
                propName: 'style',
                type: `<code>object: { content: object, overlay: object }</code>`,
                default: `-`,
                desc: 'استایل برای دراور و پس‌زمینه',
            },
            {
                propName: 'portalClassName',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس نامی که به پورتال دراور اضافه می‌شود',
            },
            {
                propName: 'bodyOpenClassName',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس نامی که به بدنه اضافه می‌شود وقتی که دراور باز است',
            },
            {
                propName: 'htmlOpenClassName',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس نامی که به HTML اضافه می‌شود وقتی که دراور باز است',
            },
            {
                propName: 'overlayClassName',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس نامی برای پس‌زمینه دراور',
            },
            {
                propName: 'appElement',
                type: `<code>SafeHTMLElement</code> | <code>SafeHTMLCollection</code> | <code>SafeNodeList</code> | <code>SafeHTMLElement[]</code>`,
                default: `-`,
                desc: 'تنظیم گره خارجی برای محتوای دراور',
            },
            {
                propName: 'onAfterOpen',
                type: `<code>(overlayElement: HTMLElement, contentElement: HTMLElement) => void</code>`,
                default: `-`,
                desc: 'تابع بازگشتی پس از باز شدن دراور',
            },
            {
                propName: 'closable',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا آیکون بستن دراور نمایش داده شود',
            },
            {
                propName: 'onClose',
                type: `<code>(event: Event) => void</code>`,
                default: `-`,
                desc: 'تابع بازگشتی پس از کلیک بر روی آیکون بستن دراور',
            },
            {
                propName: 'onRequestClose',
                type: `<code>(event: Event) => void</code>`,
                default: `-`,
                desc: 'تابع بازگشتی پس از بسته شدن دراور',
            },
            {
                propName: 'closeTimeoutMS',
                type: `<code>(event: Event) => void</code>`,
                default: `<code>300</code>`,
                desc: 'سرعت تایم‌اوت هنگام بسته شدن دراور',
            },
            {
                propName: 'shouldFocusAfterRender',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا دراور پس از رندر فوکوس شود',
            },
            {
                propName: 'shouldReturnFocusAfterClose',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا دراور پس از بسته شدن فوکوس به المان قبلی بازگردد',
            },
            {
                propName: 'preventScroll',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا دراور از فلگ preventScroll برای بازگرداندن فوکوس به المان قبلی استفاده کند',
            },
            {
                propName: 'shouldCloseOnOverlayClick',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا دراور با کلیک روی پس‌زمینه بسته شود',
            },
            {
                propName: 'shouldCloseOnEsc',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا دراور با فشار دادن کلید esc بسته شود',
            },
            {
                propName: 'parentSelector',
                type: `<code>() => document.body</code>`,
                default: `<code>() => document.body</code>`,
                desc: 'تابعی که برای دریافت المان والد که دراور به آن متصل خواهد شد، فراخوانی می‌شود',
            },
            {
                propName: 'overlayRef',
                type: `<code>(node: Node) => void</code>`,
                default: `-`,
                desc: 'مرجع پس‌زمینه دراور',
            },
            {
                propName: 'contentRef',
                type: `<code>(node: Node) => void</code>`,
                default: `-`,
                desc: 'مرجع محتوای دراور',
            },
        ],
    },
]

const Drawer = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Drawer
