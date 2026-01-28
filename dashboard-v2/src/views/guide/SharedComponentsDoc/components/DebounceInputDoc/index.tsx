import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'DebounceInputDoc'

const demoHeader = {
    title: 'ورودی با تاخیر (DebounceInput)',
    desc: 'ورودی با تاخیر یک کامپوننت است که یک فیلد ورودی را با قابلیت تاخیر بسته‌بندی می‌کند. این ویژگی باعث می‌شود مقدار ورودی فقط پس از یک تاخیر مشخص پردازش شود و فرکانس عملیات‌های سنگین مانند فراخوانی API یا به‌روزرسانی وضعیت هنگام تایپ کاهش یابد.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: `نمونه‌ای از استفاده`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'کانتینر (Container)',
        api: [
            {
                propName: 'wait',
                type: `<code>number</code>`,
                default: `<code>500</code>`,
                desc: 'زمان انتظار قبل از اجرای رویداد <code>onChange</code> پس از توقف تایپ کاربر.',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا ورودی غیرفعال باشد.',
            },
            {
                propName: 'invalid',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا ورودی در وضعیت نامعتبر باشد.',
            },
            {
                propName: 'onBlur',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'بازخوانی زمانی که ورودی فوکوس را از دست می‌دهد.',
            },
            {
                propName: 'onChange',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'بازخوانی زمانی که مقدار ورودی تغییر می‌کند.',
            },
            {
                propName: 'onFocus',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `-`,
                desc: 'بازخوانی زمانی که ورودی فوکوس می‌شود.',
            },
            {
                propName: 'prefix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پیشوند در داخل ورودی.',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه ورودی.',
            },
            {
                propName: 'suffix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پسوند در داخل ورودی.',
            },
            {
                propName: 'textArea',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا ورودی به فیلد textarea تبدیل شود.',
            },
            {
                propName: 'type',
                type: `<code>string</code>`,
                default: `<code>'text'</code>`,
                desc: 'نوع ورودی. برای انواع موجود به <a class="text-primary underline" href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types" target="_blank">MDN</a> مراجعه کنید.',
            },
            {
                propName: 'unstyle',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا استایل پیش‌فرض ورودی حذف شود.',
            },
        ],
    },
]


const DebounceInputDoc = () => {
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

export default DebounceInputDoc
