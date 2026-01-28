import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Simple from './Simple'
import WithForm from './WithForm'

const mdPath = 'CustomFormatInputDoc'

const demoHeader = {
    title: 'فرم ورودی با فرمت سفارشی (FormCustomFormatInput)',
    desc: 'FormCustomFormatInput یک کامپوننت ورودی است که با <a class="text-primary underline" href="https://github.com/s-yadav/react-number-format" target="_blank">react-number-format</a> پوشش داده شده است.',
}

const demos = [
    {
        mdName: 'Simple',
        mdPath: mdPath,
        title: 'ساده (Simple)',
        desc: `استفاده ساده از FormCustomFormatInput، همه <a class="text-primary underline" href="https://s-yadav.github.io/react-number-format/docs/customization" target="_blank">props های react-number-format</a> می‌توانند به این کامپوننت نیز اعمال شوند.`,
        component: <Simple />,
    },
    {
        mdName: 'WithForm',
        mdPath: mdPath,
        title: 'با فرم (WithForm)',
        desc: `نمونه‌ای از استفاده با <a class="text-primary underline" href="https://react-hook-form.com/docs/useform" target="_blank">React Hook Form</a>`,
        component: <WithForm />,
    },
]

const demoApi = [
    {
        component: 'فرم ورودی با فرمت سفارشی (FormCustomFormatInput)',
        api: [
            {
                propName: 'inputPrefix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'محتوای پیش‌از‌ورودی را در داخل فیلد ورودی نمایش می‌دهد.',
            },
            {
                propName: 'inputSuffix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'محتوای پس‌از‌ورودی را در داخل فیلد ورودی نمایش می‌دهد.',
            },
            {
                propName: 'format',
                type: `<code>(value: string) => string</code>`,
                default: `-`,
                desc: 'یک تابع فرمت که می‌تواند هر رشته عددی را به یک رشته فرمت‌شده تبدیل کند.',
            },
            {
                propName: 'removeFormatting',
                type: `<code>(value: string) => string</code>`,
                default: `-`,
                desc: 'یک تابع برای حذف فرمت از یک رشته فرمت‌شده و بازگشت به رشته عددی.',
            },
            {
                propName: 'getCaretBoundary',
                type: `<code>(formattedValue: string) => boolean[]</code>`,
                default: `-`,
                desc: 'یک تابع که با دریافت یک رشته فرمت‌شده، مرزهای موقعیت مجاز مکان‌نما را باز می‌گرداند. اساساً یک آرایه از boolean است که نشان می‌دهد مکان‌نما در کجا مجاز به قرار گرفتن است.',
            },
            {
                propName: 'isValidInputCharacter',
                type: `<code>(character: string) => boolean</code>`,
                default: `-`,
                desc: `یک تابع برای تعیین اینکه آیا یک کاراکتر در مقدار فرمت‌شده یک کاراکتر قابل تایپ معتبر است یا خیر. این تابع معمولاً نیازی به ورودی ندارد، زیرا به طور پیش‌فرض برای کاراکترهای عددی (0-9) تنظیم شده است.`,
            },
        ],
    },
]

const reactNumberFormatApi = (
    <div className="demo-api-table mb-12">
        <h4 className="mb-5">وابستگی‌ها</h4>
        <h6 id="react-number-format-api" className="mb-3">
            فرمت اعداد در React
        </h6>
        <p>
            تمامی ویژگی‌های رایج فرمت اعداد در React قابل اعمال بر روی این
            کامپوننت هستند، برای مشاهده کامل لیست این.props.first به{' '}
            <a
                className="underline text-primary"
                href="https://s-yadav.github.io/react-number-format/docs/props"
                target="_blank"
                rel="noreferrer"
            >
                مستندات رسمی
            </a>{' '}
            مراجعه کنید.
        </p>
    </div>
)

const CustomFormatInputDoc = () => {
    return (
        <DemoLayout
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            api={demoApi}
            mdPrefixPath="shared"
            extra={reactNumberFormatApi}
        />
    )
}

export default CustomFormatInputDoc
