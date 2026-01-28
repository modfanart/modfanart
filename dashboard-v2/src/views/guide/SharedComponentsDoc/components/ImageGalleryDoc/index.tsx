import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'ImageGalleryDoc'

const demoHeader = {
    title: 'گالری تصاویر (ImageGallery)', // ImageGallery
    desc: '<code>گالری تصاویر (ImageGallery)</code> یک کامپوننت است که گالری تصاویر ساده و قابل تنظیم با قابلیت لایت‌باکس را فراهم می‌کند. این کامپوننت بر اساس کتابخانه <a class="text-primary" href="https://yet-another-react-lightbox.com/" target="_blank">yet-another-react-lightbox</a> ساخته شده است و ادغام آسان گالری‌های تصویری با تجربه‌های بهبود یافته مشاهده را ممکن می‌سازد.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)', // Example
        desc: `استفاده نمونه`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'گالری تصاویر (ImageGallery)',
        api: [
            {
                propName: 'open',
                type: 'boolean',
                default: '',
                desc: 'اگر <code>true</code> باشد، لایت‌باکس باز است.',
            },
            {
                propName: 'close',
                type: '() => void',
                default: '',
                desc: 'یک تابع بازگشتی برای بستن لایت‌باکس.',
            },
            {
                propName: 'index',
                type: 'number',
                default: '0',
                desc: `شاخص اسلاید.<br />
                لایت‌باکس هنگام باز شدن این ویژگی را می‌خواند (در این حالت ویژگی <code>index</code> تعیین‌کننده‌ی شاخص شروع اسلاید است) و زمانی که ویژگی‌های <code>slides</code> یا <code>index</code> تغییر می‌کنند (در این حالت ویژگی <code>index</code> شاخص اسلاید فعلی را تعیین می‌کند). در اکثر موارد نیازی به ارائه این ویژگی ندارید، زیرا لایت‌باکس وضعیت خود را به‌صورت داخلی نگهداری می‌کند. اما ممکن است لازم باشد ویژگی <code>index</code> را زمانی که آرایه‌ی <code>slides</code> را تغییر می‌دهید یا به‌طور کامل جایگزین می‌کنید، ارائه دهید. برای پیگیری شاخص اسلاید فعلی، می‌توانید از تابع بازگشتی <code>on.view</code> استفاده کنید.`,
            },
            {
                propName: 'slides',
                type: 'Slide[]',
                default: '[]',
                desc: `اسلایدهایی که باید در لایت‌باکس نمایش داده شوند. برای جزئیات، به <a href="#Slide">اسلاید</a> مراجعه کنید.<br />
                توجه داشته باشید که به‌روزرسانی آرایه‌ی <code>slides</code> (یا فقط تغییر مرجع آرایه) باعث می‌شود لایت‌باکس وضعیت خود را بر اساس مقادیر فعلی <code>slides</code> و <code>index</code> به‌روزرسانی کند. شما می‌توانید از یک مرجع آرایه ناپایدار (یعنی <code>slides={[{ ... }]}</code> یا <code>slides={items.map((item) => ({ ... }))}</code>) به‌طور امن استفاده کنید به‌شرطی که کامپوننتی که لایت‌باکس را نگه می‌دارد در حالی که لایت‌باکس باز است، دوباره رندر نشود. با این حال، اگر کامپوننت شما ممکن است دوباره رندر شود، مطمئن شوید که یا ویژگی <code>slides</code> را به‌عنوان یک مرجع پایدار آرایه (یعنی <code>const</code> در محدوده ثابت یا با استفاده از <code>React.useState</code> یا <code>React.useMemo</code>) ارائه دهید یا شاخص اسلاید فعلی را در ویژگی <code>index</code> مشخص کنید.`,
            },
            {
                propName: 'render',
                type: 'Render',
                default: '',
                desc: 'توابع رندر سفارشی. برای جزئیات، به <a href="#Render">Render</a> مراجعه کنید.',
            },
            {
                propName: 'plugins',
                type: 'Plugin[]',
                default: '',
                desc: 'افزونه‌های فعال‌شده.<br />مثال: <span class="font-mono">plugins={[Fullscreen, Video]}</span>',
            },
            {
                propName: 'labels',
                type: 'object',
                default: '',
                desc: `برچسب‌ها / ترجمه‌های سفارشی رابط کاربری.<br />
                مثال: <span class="font-mono">labels={{ Next: "اسلاید بعدی" }}</span>`,
            },
            {
                propName: 'toolbar',
                type: `{<br />
                &nbsp;&nbsp;buttons: (React.ReactNode | "close")[];<br />
                }`,
                default: `{ buttons: ["close"] }`,
                desc: 'تنظیمات نوار ابزار.<br /><code>buttons</code> - دکمه‌هایی که در نوار ابزار رندر می‌شوند',
            },
            {
                propName: 'carousel',
                type: `{
  finite?: boolean;
  preload?: number;
  padding?: string | number;
  spacing?: string | number;
  imageFit?: "contain" | "cover"
  imageProps?: React.ImgHTMLAttributes<HTMLImageElement>
}`,
                default: `{ finite: false, preload: 2, padding: "16px", spacing: "30%", imageFit: "contain" }`,
                desc: "تنظیمات کاروسل.<br /><code>finite</code> - اگر <code>true</code> باشد، کاروسل لایت‌باکس به دور خود نمی‌چرخد<br /><code>preload</code> - لایت‌باکس (2 * preload + 1) اسلاید را پیش‌بارگذاری می‌کند<br /><code>padding</code> - فاصله اطراف هر اسلاید<br /><code>spacing</code> - فاصله بین اسلایدها<br /><code>imageFit</code> - تنظیم <code>object-fit</code> برای اسلایدهای تصویری<br /><code>imageProps</code> - ویژگی‌های سفارشی برای تصاویر",
            },
            {
                propName: 'animation',
                type: `{<br />
                &nbsp;&nbsp;fade?: number;<br />
                &nbsp;&nbsp;swipe?: number;<br />
                &nbsp;&nbsp;navigation?: number;<br />
                &nbsp;&nbsp;easing?: {<br />
                &nbsp;&nbsp;&nbsp;&nbsp;fade?: string;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;swipe?: string;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;navigation?: string;<br />
                &nbsp;&nbsp;}<br />
                }`,
                default: `{ fade: 250, swipe: 500, easing: { fade: "ease", swipe: "ease-out", navigation: "ease-in-out" } }`,
                desc: `تنظیمات انیمیشن.<br /><code>fade</code> - مدت زمان انیمیشن محو شدن<br /><code>swipe</code> - مدت زمان انیمیشن سوایپ<br /><code>navigation</code> - تغییر مدت زمان انیمیشن سوایپ هنگام استفاده از ناوبری صفحه‌کلید یا دکمه‌های ناوبری<br /><code>easing</code> - تنظیمات تابع زمان‌بندی انیمیشن<br /><code>fade</code> - تابع زمان‌بندی انیمیشن محو شدن<br /><code>swipe</code> - تابع زمان‌بندی انیمیشن سوایپ<br /><code>navigation</code> - تابع زمان‌بندی انیمیشن ناوبری (هنگام استفاده از صفحه‌کلید یا دکمه‌های ناوبری)`,
            },
            {
                propName: 'controller',
                type: `{<br />
                &nbsp;&nbsp;ref?: React.ForwardedRef&lt;ControllerRef&gt;;<br />
                &nbsp;&nbsp;focus?: boolean;<br />
                &nbsp;&nbsp;aria?: boolean;<br />
                &nbsp;&nbsp;touchAction?: "none" | "pan-y";<br />
                &nbsp;&nbsp;closeOnPullUp?: boolean;<br />
                &nbsp;&nbsp;closeOnPullDown?: boolean;<br />
                &nbsp;&nbsp;closeOnBackdropClick?: boolean;<br />
                }`,
                default: `{ ref: null, focus: true, aria: false, touchAction: "none" }`,
                desc: `تنظیمات کنترلر.<br /><code>ref</code> - مرجع کنترلر لایت‌باکس<br /><code>focus</code> - منسوخ شده، فقط برای استفاده داخلی<br /><code>aria</code> - اگر <code>true</code> باشد، ویژگی‌های ARIA را روی div کنترلر تنظیم می‌کند<br /><code>touchAction</code> - منسوخ شده، فقط برای استفاده داخلی<br /><code>closeOnPullUp</code> - اگر <code>true</code> باشد، لایت‌باکس در هنگام کشیدن به بالا بسته می‌شود<br /><code>closeOnPullDown</code> - اگر <code>true</code> باشد، لایت‌باکس در هنگام کشیدن به پایین بسته می‌شود<br /><code>closeOnBackdropClick</code> - اگر <code>true</code> باشد، لایت‌باکس زمانی که روی پس‌زمینه کلیک شود، بسته می‌شود`,
            },
            {
                propName: 'portal',
                type: `{<br />
                &nbsp;&nbsp;root?: DocumentFragment | Element | null;<br />
                }`,
                default: '',
                desc: `تنظیمات پورتال.<br /><code>root</code> - نقطه نصب سفارشی پورتال. به‌طور پیش‌فرض، پورتال به‌عنوان فرزند بدنه سند نصب می‌شود.`,
            },
            {
                propName: 'noScroll',
                type: `{<br />
                &nbsp;&nbsp;disabled?: boolean;<br />
                }`,
                default: '',
                desc: `تنظیمات ماژول اسکرول.<br /><code>disabled</code> - غیرفعال‌سازی اسکرول لایت‌باکس (درصورتی‌که <code>noScroll</code> به‌طور پیش‌فرض فعال باشد).`,
            },
            {
                propName: 'backdrop',
                type: '{ boolean | "dim" | "none" }',
                default: 'dim',
                desc: 'نحوه نمایش پس‌زمینه در لایت‌باکس.',
            },
        ],
    },
];


const ImageGalleryDoc = () => {
    return (
        <DemoLayout
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            api={demoApi}
            mdPrefixPath="shared"
        />
    )
}

export default ImageGalleryDoc
