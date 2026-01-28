import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Size from './Size'
import Disabled from './Disabled'
import DisabledSearch from './DisabledSearch'
import MultiSelection from './MultiSelection'
import Group from './Group'
import Custom from './Custom'
import AsyncOnSearch from './AsyncOnSearch'
import LoadOptionOnExpand from './LoadOptionOnExpand'
import Creatable from './Creatable'

const mdPath = 'Select'

const demoHeader = {
    title: 'انتخاب (Select)',
    desc: 'انتخاب به کاربر این امکان را می‌دهد که یک یا چند گزینه را از یک لیست انتخاب کند. این کامپوننت یک Wrapper برای <a class="underline text-blue-500" href="https://react-select.com/home" target="_blank">react-select</a> است.',
}

const demos = [
    {
        mdName: 'پایه (Basic)',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `استفاده اساسی.`,
        component: <Basic />,
    },
    {
        mdName: 'اندازه (Size)',
        mdPath: mdPath,
        title: 'اندازه (Size)',
        desc: `سه اندازه مختلف برای گزینه‌ها در انتخاب وجود دارد.`,
        component: <Size />,
    },
    {
        mdName: 'انتخاب چندگانه (Multi Selection)',
        mdPath: mdPath,
        title: 'انتخاب چندگانه (Multi Selection)',
        desc: `با تنظیم <code>isMulti</code> به true، می‌توانیم چندین گزینه را از لیست انتخاب کنیم.`,
        component: <MultiSelection />,
    },
    {
        mdName: 'غیرفعال (Disabled)',
        mdPath: mdPath,
        title: 'غیرفعال (Disabled)',
        desc: `مثال برای غیرفعال کردن.`,
        component: <Disabled />,
    },
    {
        mdName: 'غیرفعال جستجو (Disabled Search)',
        mdPath: mdPath,
        title: 'غیرفعال جستجو (Disabled Search)',
        desc: `انتخاب به طور پیش‌فرض قابل جستجو است، اما می‌توانیم این ویژگی را با تنظیم <code>isSearchable</code> به false غیرفعال کنیم.`,
        component: <DisabledSearch />,
    },
    {
        mdName: 'گروه‌بندی (Group)',
        mdPath: mdPath,
        title: 'گروه‌بندی (Group)',
        desc: `گزینه‌ها می‌توانند با داده‌های تو در تو گروه‌بندی شوند.`,
        component: <Group />,
    },
    {
        mdName: 'سفارشی (Custom)',
        mdPath: mdPath,
        title: 'سفارشی (Custom)',
        desc: `React-select به ما اجازه می‌دهد تا بلوک‌های ساختاری کامپوننت را سفارشی کنیم. برای جزئیات بیشتر به <a class="underline text-blue-500" href="https://react-select.com/components" target="_blank">اینجا</a> مراجعه کنید.`,
        component: <Custom />,
    },
    {
        mdName: 'آسنک در جستجو (Async on Search)',
        mdPath: mdPath,
        title: 'آسنک در جستجو (Async on Search)',
        desc: `از کامپوننت آسنک برای بارگذاری گزینه‌ها از یک منبع راه دور به محض تایپ کاربر استفاده کنید.`,
        component: <AsyncOnSearch />,
    },
    {
        mdName: 'بارگذاری گزینه در گسترش (Load Options on Expand)',
        mdPath: mdPath,
        title: 'بارگذاری گزینه در گسترش (Load Options on Expand)',
        desc: `می‌توانیم گزینه‌ها را با کلیک روی Select بارگذاری کنیم.`,
        component: <LoadOptionOnExpand />,
    },
    {
        mdName: 'قابل ساخت (Creatable)',
        mdPath: mdPath,
        title: 'قابل ساخت (Creatable)',
        desc: `مثالی برای ایجاد گزینه جدید از طریق ورودی Select.`,
        component: <Creatable />,
    },
]

const demoApi = [
    {
        component: 'انتخاب (Select)',
        api: [
            {
                propName: 'componentAs',
                type: `<code>ReactNode</code>`,
                default: `<code>ReactSelect</code>`,
                desc: 'دریافت کامپوننت‌های پیشرفته از react-select، مانند <code>Async</code> و <code>Creatable</code>',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه انتخاب',
            },
        ],
    },
]


const reactSelectApi = (
    <div className="demo-api-table mb-12">
        <h4 className="mb-5">وابستگی‌ها</h4>
        <h6 id="react-select-api" className="mb-3">
            React Select
        </h6>
        <p className="mb-1">
            <code>Select</code> یک کامپوننت wrapper برای{' '}
            <a
                className="underline text-blue-500"
                href="https://react-select.com/home"
                target="_blank"
                rel="noreferrer"
            >
                react-select
            </a>
            است.
        </p>
        <p>
            تمام props های react-select می‌توانند بر روی این کامپوننت اعمال شوند، برای لیست کامل API به{' '}
            <a
                className="underline text-blue-500"
                href="https://react-select.com/props"
                target="_blank"
                rel="noreferrer"
            >
                مستندات رسمی
            </a>{' '}
            مراجعه کنید.
        </p>
    </div>
)
const Select = () => {
    return (
        <DemoLayout
            header={demoHeader}
            demos={demos}
            api={demoApi}
            extra={reactSelectApi}
        />
    )
}

export default Select
