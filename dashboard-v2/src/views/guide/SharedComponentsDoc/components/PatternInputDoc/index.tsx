import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import WithForm from './WithForm'

const mdPath = 'PatternInputDoc'

const demoHeader = {
    title: 'ورودی الگو (PatternInput)',
    desc: 'کامپوننت PatternInput، یک کامپوننت ورودی است که با <a class="text-primary underline" href="https://github.com/s-yadav/react-number-format" target="_blank">react-number-format</a> بسته‌بندی شده است، برای مثال‌های بیشتر به <a class="text-primary underline" href="https://s-yadav.github.io/react-number-format/docs/pattern_format" target="_blank">مستندات رسمی</a> مراجعه کنید.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'اساسی (Basic)',
        desc: `استفاده اساسی از PatternInput، تمام <a class="text-primary underline" href="https://s-yadav.github.io/react-number-format/docs/pattern_format" target="_blank">پراپ‌های react-number-format</a> می‌توانند به این کامپوننت اعمال شوند.`,
        component: <Basic />,
    },
    {
        mdName: 'WithForm',
        mdPath: mdPath,
        title: 'با فرم (WithForm)',
        desc: `مثال استفاده با <a class="text-primary underline" href="https://react-hook-form.com/docs/useform" target="_blank">React Hook Form</a>`,
        component: <WithForm />,
    },
]

const demoApi = [
    {
        component: 'الگوی ورودی مستندات (PatternInputDoc)',
        api: [
            {
                propName: 'inputPrefix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پیشوند داخل ورودی',
            },
            {
                propName: 'inputSuffix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پسوند داخل ورودی',
            },
            {
                propName: 'format',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'الگوی فرمت را با استفاده از کاراکتر # (یا patternChar) تعریف می‌کند. # کاراکتر نگهدارنده برای اعداد است.',
            },
            {
                propName: 'allowEmptyFormatting',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: `به طور پیش‌فرض کامپوننت PatternFormat زمانی که مقدار خالی است (null، undefined یا '') هیچ فرمت‌بندی اعمال نمی‌کند. اگر می‌خواهید فرمت‌بندی را برای مقادیر خالی اعمال کنید، باید allowEmptyFormatting را به true تنظیم کنید.`,
            },
            {
                propName: 'mask',
                type: `<code>string</code> | <code>Array<string></code>`,
                default: `-`,
                desc: 'به عنوان کاراکتر ماسک برای مکان‌های عددی استفاده می‌شود، تا زمانی که کاراکتر عددی برای آن موقعیت وارد شود. می‌توانید کاراکترهای ماسک متفاوتی برای هر موقعیت عددی با عبور دادن آرایه‌ای از کاراکترهای ماسک تعیین کنید. توجه: طول کاراکترهای ماسک باید با تعداد # patternChar مطابقت داشته باشد.',
            },
            {
                propName: 'patternChar',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'این کاراکتر به شما کمک می‌کند تا کاراکتر الگوی فرمت را تعریف کنید',
            },
        ],
    },
]


const reactNumberFormatApi = (
    <div className="demo-api-table mb-12">
        <h4 className="mb-5">وابستگی‌ها</h4>
        <h6 id="react-number-format-api" className="mb-3">
            فرمت شماره React
        </h6>
        <p>
            تمامی ویژگی‌های رایج فرمت شماره React را می‌توان بر روی این
            کامپوننت اعمال کرد، برای مشاهده لیست کامل{' '}
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

const PatternInputDoc = () => {
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

export default PatternInputDoc
