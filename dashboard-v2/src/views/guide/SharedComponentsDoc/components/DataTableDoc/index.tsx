import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Checkable from './Checkable'
import Query from './Query'

const mdPath = 'DataTableDoc'

const demoHeader = {
    title: 'جدول داده (DataTable)',
    desc: 'جدول داده یک کامپوننت است که منطق جدول را به صورت جداگانه محصور کرده است. این کامپوننت می‌تواند برخی از تنظیمات اولیه را از <a class="text-primary underline" href="https://react-table-v7.tanstack.com/" target="_blank">react-table</a> ذخیره کند و شروع سریع با داده‌های جدول غیر همزمان شما داشته باشد.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: ``,
        component: <Basic />,
    },
    {
        mdName: 'Checkable',
        mdPath: mdPath,
        title: 'قابل انتخاب (Checkable)',
        desc: ``,
        component: <Checkable />,
    },
    {
        mdName: 'Query',
        mdPath: mdPath,
        title: 'پرس و جو (Query)',
        desc: ``,
        component: <Query />,
    },
]

const demoApi = [
    {
        component: 'جدول داده (DataTable)',
        api: [
            {
                propName: 'columns',
                type: `<a class="text-primary underline" href="https://tanstack.com/table/v8/docs/guide/column-defs" target="_blank"><code>Array&lt;Column&gt;</code></a>`,
                default: `<code>[]</code>`,
                desc: 'شیء پیکربندی ستون‌های اصلی برای تمام جدول',
            },
            {
                propName: 'data',
                type: `<code>Array&lt;any&gt;</code>`,
                default: `<code>[]</code>`,
                desc: 'آرایه داده‌هایی که می‌خواهید در جدول نمایش دهید',
            },
            {
                propName: 'loading',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا می‌خواهید نشانگر بارگذاری در جدول نمایش داده شود',
            },
            {
                propName: 'onCheckBoxChange',
                type: `<code>(checked: boolean, row: any) => void</code>`,
                default: `-`,
                desc: 'فراخوانی بازگشتی زمانی که وضعیت جعبه چک تغییر می‌کند، مقدار جعبه چک و داده‌های ردیف تغییر یافته را باز می‌گرداند',
            },
            {
                propName: 'onIndeterminateCheckBoxChange',
                type: `<code>(checked: boolean, rows: any) => void</code>`,
                default: `-`,
                desc: 'فراخوانی بازگشتی زمانی که وضعیت جعبه چک نامشخص تغییر می‌کند، مقدار جعبه چک نامشخص و داده‌های تمام ردیف‌ها را باز می‌گرداند',
            },
            {
                propName: 'onPaginationChange',
                type: `<code>(pageIndex: number) => void</code>`,
                default: `-`,
                desc: 'فراخوانی بازگشتی زمانی که صفحه‌بندی تغییر می‌کند',
            },
            {
                propName: 'onSelectChange',
                type: `<code>(pageSize: number) => void</code>`,
                default: `-`,
                desc: 'فراخوانی بازگشتی زمانی که اندازه صفحه تغییر می‌کند',
            },
            {
                propName: 'onSort',
                type: `<code>(pageSize: {order: 'desc' | 'asc', key: string}) => void</code>`,
                default: `-`,
                desc: 'فراخوانی بازگشتی زمانی که هر ستون مرتب‌سازی تغییر می‌کند، ترتیب مرتب‌سازی و شناسه ستون مرتب‌شده را باز می‌گرداند',
            },
            {
                propName: 'pageSizes',
                type: `<code>number[]</code>`,
                default: `<code>[10, 25, 50, 100]</code>`,
                desc: 'گزینه‌های اندازه صفحه قابل انتخاب',
            },
            {
                propName: 'skeletonAvatarColumns',
                type: `<code>number[]</code>`,
                default: `-`,
                desc: 'ستون‌هایی که نمایش آواتار اسکلتی در آن‌ها زمانی که بارگذاری فعال است مشخص می‌شود',
            },
            {
                propName: 'skeletonAvatarProps',
                type: `<a class="text-primary underline" href="/ui-components/avatar#api" target="_blank"><code>AvatarProps</code></a>`,
                default: `-`,
                desc: 'پروپ‌های آواتار اسکلتی',
            },
            {
                propName: 'pagingData',
                type: `<code>{total: number, pageIndex: number, pageSize: number}</code>`,
                default: `<code>{total: 0, pageIndex: 1, pageSize: 10}</code>`,
                desc: 'وضعیت صفحه‌بندی جدول',
            },
        ],
    },
]


const DataTableDoc = () => {
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

export default DataTableDoc
