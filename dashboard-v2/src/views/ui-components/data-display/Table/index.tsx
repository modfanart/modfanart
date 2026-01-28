import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Simple from './Simple'
import Compact from './Compact'
import Sorting from './Sorting'
import Filtering from './Filtering'
import PaginationTable from './PaginationTable'
import Group from './Group'
import RowSelection from './RowSelection'
import Expanding from './Expanding'
import SubComponent from './SubComponent'
import Editable from './Editable'
import DragAndDrop from './DragAndDrop'
import Resizable from './Resizable'
// import VirtualizedRows from './VirtualizedRows'

const mdPath = 'Table'

const demoHeader = {
    title: 'جدول (Table)',
    desc: 'جداول داده‌ها را در ردیف‌ها و ستون‌ها نمایش می‌دهند که مقایسه و تحلیل اطلاعات را برای کاربران آسان‌تر می‌کند.',
}

const demos = [
    {
        mdName: 'Simple',
        mdPath: mdPath,
        title: 'ساده (Simple)',
        desc: `مثالی از جدول ساده.`,
        component: <Simple />,
    },
    {
        mdName: 'Compact',
        mdPath: mdPath,
        title: 'فشرده (Compact)',
        desc: `جدول با نمای فشرده که امکان نمایش داده‌های بیشتری را فراهم می‌کند.`,
        component: <Compact />,
    },
    {
        mdName: 'Sorting',
        mdPath: mdPath,
        title: 'مرتب‌سازی (Sorting)',
        desc: `ستون‌ها با انتخاب سرصفحه‌های جدول قابل مرتب‌سازی هستند.`,
        component: <Sorting />,
    },
    {
        mdName: 'Filtering',
        mdPath: mdPath,
        title: 'فیلتر کردن (Filtering)',
        desc: `مثالی از فیلتر کردن.`,
        component: <Filtering />,
    },
    {
        mdName: 'PaginationTable',
        mdPath: mdPath,
        title: 'صفحه‌بندی (Pagination)',
        desc: `جدول می‌تواند با کامپوننت <a href="/ui-components/pagination" class="text-blue-500">صفحه‌بندی</a> کار کند.`,
        component: <PaginationTable />,
    },
    {
        mdName: 'Group',
        mdPath: mdPath,
        title: 'گروه‌بندی (Group)',
        desc: `مثالی از گروه‌بندی.`,
        component: <Group />,
    },
    {
        mdName: 'RowSelection',
        mdPath: mdPath,
        title: 'انتخاب ردیف (Row Selection)',
        desc: `مثالی از انتخاب ردیف.`,
        component: <RowSelection />,
    },
    {
        mdName: 'Expanding',
        mdPath: mdPath,
        title: 'باز کردن (Expanding)',
        desc: `مثالی از باز کردن ردیف.`,
        component: <Expanding />,
    },
    {
        mdName: 'SubComponent',
        mdPath: mdPath,
        title: 'زیرکامپوننت (SubComponent)',
        desc: `باز کردن ردیف با زیرکامپوننت.`,
        component: <SubComponent />,
    },
    {
        mdName: 'Editable',
        mdPath: mdPath,
        title: 'قابل ویرایش (Editable)',
        desc: `مثالی از سلول قابل ویرایش.`,
        component: <Editable />,
    },
    {
        mdName: 'DragAndDrop',
        mdPath: mdPath,
        title: 'کشیدن و رها کردن (Drag & Drop)',
        desc: `مثالی از پیاده‌سازی <code>react-dnd</code> در جدول.`,
        component: <DragAndDrop />,
    },
    {
        mdName: 'Resizable',
        mdPath: mdPath,
        title: 'قابل تغییر اندازه (Resizable)',
        desc: `مثالی از تغییر اندازه ستون‌ها.`,
        component: <Resizable />,
    },
    // {
    //     mdName: 'VirtualizedRows',
    //     mdPath: mdPath,
    //     title: 'ردیف‌های مجازی (Virtualized Rows)',
    //     desc: `مثالی از پیاده‌سازی <code>react-window</code> برای بدنه جدول قابل اسکرول.`,
    //     component: <VirtualizedRows />,
    // },
]


const demoApi = [
    {
        component: 'جدول (Table)',
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'table'</code>`,
                desc: 'عنصر رندر شده',
            },
            {
                propName: 'borderlessRow',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا مرز ردیف در جدول غیرفعال شود',
            },
            {
                propName: 'compact',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا جدول به صورت فشرده نمایش داده شود',
            },
            {
                propName: 'hoverable',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا ردیف‌های جدول قابلیت هاور (hover) شدن را دارند',
            },
            {
                propName: 'overflow',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا اجازه داده شود محتوای جدول از حد خود خارج شود',
            },
        ],
    },
    {
        component: 'Table.THead',
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'thead'</code>`,
                desc: 'عنصر رندر شده',
            },
        ],
    },
    {
        component: 'Table.TBody',
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'tbody'</code>`,
                desc: 'عنصر رندر شده',
            },
        ],
    },
    {
        component: 'Table.TFoot',
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'tfoot'</code>`,
                desc: 'عنصر رندر شده',
            },
        ],
    },
    {
        component: 'Table.Tr',
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'tr'</code>`,
                desc: 'عنصر رندر شده',
            },
        ],
    },
    {
        component: 'Table.Th',
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'th'</code>`,
                desc: 'عنصر رندر شده',
            },
        ],
    },
    {
        component: 'Table.Td',
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'td'</code>`,
                desc: 'عنصر رندر شده',
            },
        ],
    },
    {
        component: 'Table.Sorter',
        api: [
            {
                propName: 'sort',
                type: `<code>false | 'asc' | 'desc'</code>`,
                default: `<code>-</code>`,
                desc: 'وضعیت مرتب‌سازی',
            },
        ],
    },
]


const reactTableApi = (
    <div className="demo-api-table mb-12">
        <h4 className="mb-5">وابستگی‌ها</h4>
        <h6 id="react-table-api" className="mb-3">
            React Table
        </h6>
        <p className="mb-1">
            بیشتر مثال‌های بالا با استفاده از{' '}
            <code>react-table</code> یکپارچه شده‌اند، این یک کامپوننت جدول داده سبک و قابل توسعه برای فیلتر، مرتب‌سازی، گروه‌بندی، تجمیع، صفحه‌بندی و نمایش داده‌های عظیم است. برای مشاهده{' '}
            <a
                className="underline text-blue-500"
                href="https://react-table.tanstack.com/docs/overview"
                target="_blank"
                rel="noopener noreferrer"
            >
                مستندات رسمی
            </a>{' '}
            برای مثال‌های بیشتر و نحوه استفاده از هوک‌ها.
        </p>
    </div>
)

const Table = () => {
    return (
        <DemoLayout
            header={demoHeader}
            demos={demos}
            api={demoApi}
            extra={reactTableApi}
        />
    )
}

export default Table
