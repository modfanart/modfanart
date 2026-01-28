/* eslint-disable react/no-unescaped-entities */
import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Layout from './Layout'
import Sizes from './Sizes'
import LabelExtra from './LabelExtra'
import FieldValidation from './FieldValidation'
import SchemaValidation from './SchemaValidation'
import DependentValidation from './DependentValidation'
import AsyncValidation from './AsyncValidation'
import DynamicForm from './DynamicForm'
import MixedFormControl from './MixedFormControl'

const mdPath = 'FormControl'

const demoHeader = {
    title: 'کنترل فرم (Form Control)',
    desc: 'فرم برای جمع‌آوری و اعتبارسنجی داده‌های ورودی کاربر استفاده می‌شود. ما از <a class="underline text-primary" href="https://react-hook-form.com/" target="_blank">react-hook-form</a> به عنوان کتابخانه کنترل فرم استفاده می‌کنیم. بیشتر کامپوننت‌های فرم ما با react-hook-form یا دیگر کتابخانه‌های فرم سازگار هستند.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `نمونه استفاده از یک فرم ساده با اعتبارسنجی.`,
        component: <Basic />,
    },
    {
        mdName: 'Layout',
        mdPath: mdPath,
        title: 'چیدمان فرم (Form Layout)',
        desc: `<code>Form</code> یا <code>FormContainer</code> به ما اجازه می‌دهد تمام <code>FormItem</code> ها را از طریق یک prop <code>layout</code> کنترل کنیم.`,
        component: <Layout />,
    },
    {
        mdName: 'Sizes',
        mdPath: mdPath,
        title: 'اندازه فرم (Form Size)',
        desc: `<code>Form</code> یا <code>FormContainer</code> به ما امکان کنترل اندازه <code>FormItem</code> را نیز می‌دهد.`,
        component: <Sizes />,
    },
    {
        mdName: 'LabelExtra',
        mdPath: mdPath,
        title: 'محتوای اضافی برچسب (Label Extra)',
        desc: `می‌توانیم محتوای اضافی به برچسب فرم با استفاده از prop <code>extra</code> در <code>FormItem</code> اضافه کنیم.`,
        component: <LabelExtra />,
    },
    {
        mdName: 'FieldValidation',
        mdPath: mdPath,
        title: 'اعتبارسنجی سطح فیلد (Field-level Validation)',
        desc: `کتابخانه react-hook-form از اعتبارسنجی سطح فیلد پشتیبانی می‌کند.`,
        component: <FieldValidation />,
    },
    {
        mdName: 'SchemaValidation',
        mdPath: mdPath,
        title: 'اعتبارسنجی شِما (Schema Validation)',
        desc: `می‌توانیم از <a class="underline" target="_blank" href="https://zod.dev/">Zod</a> برای اعتبارسنجی شِمای اشیاء استفاده کنیم.`,
        component: <SchemaValidation />,
    },
    {
        mdName: 'DependentValidation',
        mdPath: mdPath,
        title: 'اعتبارسنجی وابسته (Dependent Validation)',
        desc: `می‌توانید از شرط‌های <a class="underline" target="_blank" href="https://zod.dev/">Zod</a> برای انجام اعتبارسنجی فیلد بر اساس مقادیر دیگر فرم استفاده کنید.`,
        component: <DependentValidation />,
    },
    {
        mdName: 'AsyncValidation',
        mdPath: mdPath,
        title: 'اعتبارسنجی ناهمگام (Async Validation)',
        desc: `می‌توانید فیلدها را به صورت ناهمگام اعتبارسنجی کنید.`,
        component: <AsyncValidation />,
    },
    {
        mdName: 'DynamicForm',
        mdPath: mdPath,
        title: 'فرم پویا (Dynamic Form)',
        desc: `نمونه‌ای از استفاده از فرم پویا با <code>FieldArray</code>.`,
        component: <DynamicForm />,
    },
    {
        mdName: 'MixedFormControl',
        mdPath: mdPath,
        title: 'کنترل فرم ترکیبی (Mixed Form Control)',
        desc: `نمایش انواع مختلف کامپوننت‌های مرتبط با فرم در یک فرم.`,
        component: <MixedFormControl />,
    },
]


const demoApi = [
    {
        component: 'فرم کانتینر (FormContainer)',
        api: [
            {
                propName: 'layout',
                type: `<code>'horizontal'</code> | <code>'vertical'</code> | <code>'inline'</code>`,
                default: `<code>'vertical'</code>`,
                desc: 'چیدمان فرم',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه آیتم فرم',
            },
            {
                propName: 'labelWidth',
                type: `<code>string</code>  | <code>number</code>`,
                default: `<code>100</code>`,
                desc: 'عرض برچسب فرم',
            },
        ],
    },
    {
        component:'فرم ایتم (FormItem)',
        api: [
            {
                propName: 'layout',
                type: `<code>'horizontal'</code> | <code>'vertical'</code> | <code>'inline'</code>`,
                default: `-`,
                desc: 'چیدمان فرم',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code>`,
                default: `-`,
                desc: 'اندازه آیتم فرم',
            },
            {
                propName: 'labelWidth',
                type: `<code>string</code>  | <code>number</code>`,
                default: `-`,
                desc: 'عرض برچسب فرم',
            },
            {
                propName: 'errorMessage',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'پیام خطا که هنگام فعال شدن <code>invalid</code> نمایش داده می‌شود',
            },
            {
                propName: 'invalid',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'وضعیت اعتبارسنجی آیتم فرم',
            },
            {
                propName: 'asterisk',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا علامت ستاره در کنار متن برچسب نمایش داده شود',
            },
            {
                propName: 'extra',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'محتوای سفارشی اضافی در کنار متن برچسب',
            },
            {
                propName: 'htmlFor',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'تنظیم مقدار htmlFor برای برچسب فرعی',
            },
        ],
    },
];


const formikNote = (
    <div>
        <h4>ری‌اکت هوک فرم</h4>
        <p className="mt-2">
            کتابخانه <code>React Hook Form</code> یک راه‌حل قدرتمند و انعطاف‌پذیر برای مدیریت فرم‌ها در برنامه‌های ری‌اکت است. این ابزار مدیریت فرم را با ارائه مجموعه‌ای از هوک‌ها و ابزارهایی که فرآیند گرفتن داده‌ها، اعتبارسنجی و ارسال فرم‌ها را ساده می‌کند، آسان می‌سازد. با استفاده از <code>useForm</code>، شما به‌راحتی می‌توانید وضعیت فرم را مدیریت کنید، تغییرات ورودی را پردازش کنید، اعتبارسنجی انجام دهید و فرم‌ها را با حداقل کد اضافی ارسال کنید. برای اطلاعات بیشتر و مثال‌ها به
            <a
                className="underline text-primary"
                href="https://react-hook-form.com/docs/useform"
                target="_blank"
                rel="noreferrer"
            >
                مستندات
            </a>
            مراجعه کنید.
        </p>
        <h4 className="mt-10">زود</h4>
        <p className="mt-2">
            زود یک کتابخانه تعریف اسکیما و اعتبارسنجی است که مبتنی بر تایپ‌اسکریپت طراحی شده است. منظور از "اسکیما" هر نوع داده‌ای، از یک رشته ساده تا یک شیء پیچیده تودرتو است. زود برای کاربرپسندترین تجربه ممکن طراحی شده است. هدف این ابزار حذف تعریف‌های تکراری تایپ‌هاست. با زود، شما یک بار اعتبارسنج را تعریف می‌کنید و زود به‌طور خودکار نوع استاتیک تایپ‌اسکریپت را استنتاج می‌کند. همچنین ترکیب تایپ‌های ساده به ساختارهای داده پیچیده بسیار آسان است. برای اطلاعات بیشتر و مثال‌ها به
            <a
                className="underline text-primary"
                href="https://zod.dev/"
                target="_blank"
                rel="noreferrer"
            >
                مستندات رسمی
            </a>
            مراجعه کنید.
        </p>
    </div>
)

const FormControl = () => {
    return (
        <DemoLayout
            header={demoHeader}
            demos={demos}
            api={demoApi}
            note={formikNote}
        />
    )
}

export default FormControl
