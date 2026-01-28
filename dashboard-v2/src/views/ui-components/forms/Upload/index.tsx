import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import DragAndDrop from './DragAndDrop'
import Disabled from './Disabled'
import BeforeUpload from './BeforeUpload'
import Customize from './Customize'
import AvatarImage from './AvatarImage'

const mdPath = 'Upload'

const demoHeader = {
    title: 'بارگذاری (Upload)',
    desc: 'بارگذاری یک کامپوننت است که به کاربر امکان پیوست کردن فایل‌ها و تصاویر را می‌دهد، این کامپوننت می‌تواند با فرم استفاده شده و داده‌ها را به مکان دیگری بارگذاری کند.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `مثال پایه‌ای از بارگذاری.`,
        component: <Basic />,
    },
    {
        mdName: 'DragAndDrop',
        mdPath: mdPath,
        title: 'کشیدن و رها کردن (Drag and Drop)',
        desc: `با ویژگی <code>draggable</code> می‌توانیم فایل‌ها را به یک ناحیه خاص بکشیم تا بارگذاری انجام شود.`,
        component: <DragAndDrop />,
    },
    {
        mdName: 'Disabled',
        mdPath: mdPath,
        title: 'غیرفعال (Disabled)',
        desc: `کامپوننت بارگذاری را با تنظیم ویژگی <code>disabled</code> به true غیرفعال کنید.`,
        component: <Disabled />,
    },
    {
        mdName: 'Customize',
        mdPath: mdPath,
        title: 'سفارشی‌سازی (Customize)',
        desc: `می‌توانیم ظاهر پیش‌فرض بارگذاری را تغییر دهیم.`,
        component: <Customize />,
    },
    {
        mdName: 'BeforeUpload',
        mdPath: mdPath,
        title: 'کنترل بارگذاری (Upload Control)',
        desc: `از ویژگی <code>beforeUpload</code> برای ایجاد یک تابع برگشتی به منظور اعتبارسنجی فایل قبل از بارگذاری استفاده کنید.`,
        component: <BeforeUpload />,
    },
    {
        mdName: 'AvatarImage',
        mdPath: mdPath,
        title: 'تصویر آواتار (Avatar)',
        desc: `مثالی برای بارگذاری تصویر آواتار.`,
        component: <AvatarImage />,
    },
]

const demoApi = [
    {
        component: 'بارگذاری (Upload)',
        api: [
            {
                propName: 'accept',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نوع فایل‌هایی که می‌توانند به عنوان ویژگی accept وارد شوند.',
            },
            {
                propName: 'beforeUpload',
                type: `<code>(file: FileList | null, fileList: File[]) => boolean | string</code>`,
                default: `-`,
                desc: 'تابع برگشتی قبل از بارگذاری فایل، که اگر false یا رشته‌ای برگرداند، بارگذاری را متوقف می‌کند.',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا بارگذاری غیرفعال است؟',
            },
            {
                propName: 'draggable',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا بارگذاری کشیدنی فعال است؟',
            },
            {
                propName: 'fileList',
                type: `<code>File[]</code>`,
                default: `<code>[]</code>`,
                desc: 'لیست فایل‌های اولیه.',
            },
            {
                propName: 'fileListClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس برای پوشش لیست فایل‌ها.',
            },
            {
                propName: 'fileItemClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس برای هر مورد فایل.',
            },
            {
                propName: 'onChange',
                type: `<code>(file: File[], fileList: File[]) => void</code>`,
                default: `-`,
                desc: 'تابع برگشتی بعد از بارگذاری فایل.',
            },
            {
                propName: 'onFileRemove',
                type: `<code>(file: File[]) => void</code>`,
                default: `-`,
                desc: 'تابع برگشتی زمانی که یک فایل حذف شد.',
            },
            {
                propName: 'showList',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا لیست فایل‌های بارگذاری شده نشان داده می‌شود؟',
            },
            {
                propName: 'tip',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'پیام راهنما زیر بارگذاری.',
            },
            {
                propName: 'uploadLimit',
                type: `<code>number</code>`,
                default: `-`,
                desc: 'حداکثر تعداد فایل‌هایی که می‌توانند بارگذاری شوند.',
            },
        ],
    },
]


const FormControl = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default FormControl
