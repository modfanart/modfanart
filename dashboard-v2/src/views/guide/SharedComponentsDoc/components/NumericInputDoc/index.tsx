import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import WithForm from './WithForm'

const mdPath = 'NumericInputDoc'
const demoHeader = {
    title: 'ورودی عددی فرم (FormNumericInput)',
    desc: 'کامپوننت FormCustomFormatInput که ورودی را با <a class="text-primary underline" href="https://github.com/s-yadav/react-number-format" target="_blank">react-number-format</a> بسته‌بندی می‌کند. برای مثال‌های بیشتر به <a class="text-primary underline" href="https://s-yadav.github.io/react-number-format/docs/numeric_format" target="_blank">مستندات رسمی</a> مراجعه کنید.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `استفاده پایه از FormNumericInput، تمام <a class="text-primary underline" href="https://s-yadav.github.io/react-number-format/docs/numeric_format" target="_blank">ویژگی‌های react-number-format</a> را می‌توان به این کامپوننت اعمال کرد.`,
        component: <Basic />,
    },
    {
        mdName: 'WithForm',
        mdPath: mdPath,
        title: 'همراه با فرم (WithForm)',
        desc: `نمونه‌ای از استفاده با <a class="text-primary underline" href="https://react-hook-form.com/docs/useform" target="_blank">React Hook Form</a>`,
        component: <WithForm />,
    },
]

const demoApi = [
    {
        component: 'ورودی عددی فرم (FormNumericInput)',
        api: [
            {
                propName: 'inputPrefix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پیشوند در داخل ورودی',
            },
            {
                propName: 'inputSuffix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پسوند در داخل ورودی',
            },
            {
                propName: 'thousandSeparator',
                type: `<code>boolean</code> | <code>string</code>`,
                default: `-`,
                desc: 'فعال‌سازی جداکننده هزارگان و امکان تنظیم کاراکتر سفارشی',
            },
            {
                propName: 'decimalSeparator',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نماد جداکننده اعشار',
            },
            {
                propName: 'allowedDecimalSeparators',
                type: `<code>Array<string></code>`,
                default: `-`,
                desc: `کاراکترهایی که فشار دادن آن‌ها منجر به نمایش جداکننده اعشار می‌شود. در صورت عدم تنظیم، جداکننده اعشار و '.' استفاده می‌شوند.`,
            },
            {
                propName: 'thousandsGroupStyle',
                type: `<code>'thousand'</code> | <code>'lakh'</code> | <code>'wan'</code> | <code>'none'</code>`,
                default: `-`,
                desc: `سبک گروه‌بندی هزارگان را مشخص می‌کند.`,
            },
            {
                propName: 'decimalScale',
                type: `<code>number</code>`,
                default: `-`,
                desc: `اگر تنظیم شود، تعداد ارقام بعد از نقطه اعشار را محدود می‌کند.`,
            },
            {
                propName: 'fixedDecimalScale',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: `اگر روی true تنظیم شود، صفرهای انتهایی بعد از جداکننده اعشار برای تطابق با decimalScale اضافه می‌شوند.`,
            },
            {
                propName: 'allowLeadingZeros',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'فعال یا غیرفعال کردن صفرهای ابتدایی در فیلد ورودی. به طور پیش‌فرض، در حالت blur صفرهای ابتدایی حذف می‌شوند. برای فعال‌سازی صفرهای ابتدایی این ویژگی را true کنید.',
            },
            {
                propName: 'allowNegative',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'اگر روی false تنظیم شود، اعداد منفی مجاز نخواهند بود.',
            },
            {
                propName: 'suffix',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'پسوندی که بعد از مقدار ورودی اضافه می‌شود.',
            },
            {
                propName: 'prefix',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'پیشوندی که قبل از مقدار ورودی اضافه می‌شود.',
            },
        ],
    },
]


const reactNumberFormatApi = (
    <div className="demo-api-table mb-12">
        <h4 className="mb-5">وابستگی‌ها</h4>
        <h6 id="react-number-format-api" className="mb-3">
            فرمت عددی React
        </h6>
        <p>
            تمامی خصوصیات مشترک فرمت عددی React می‌توانند روی این کامپوننت اعمال شوند. برای
            لیست کامل به{' '}
            <a
                className="underline text-primary"
                href="https://s-yadav.github.io/react-number-format/docs/props"
                target="_blank"
                rel="noreferrer"
            >
                مستندات رسمی
            </a>{' '}
            مراجعه کنید.{' '}
        </p>
    </div>
)


const FormNumericInputDoc = () => {
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

export default FormNumericInputDoc
