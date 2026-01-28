import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'GanttChartDoc'

const demoHeader = {
    title: 'نمودار گانت (GanttChart)',
    desc: 'این کامپوننت نسخه‌ای گسترش‌یافته از <a class="text-primary" href="https://github.com/MaTeMaTuK/gantt-task-react" target="_blank">کتابخانه gantt-task-react</a> است. ایده‌آل برای نمایش زمان‌بندی پروژه‌ها، وظایف، و نقاط عطف با گزینه‌های سفارشی‌سازی پیشرفته.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: `مثال استفاده.`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'نمودار گانت (GanttChart)',
        api: [
            {
                propName: 'tasks',
                type: 'ExtendedTask<T>[]',
                default: '[]',
                desc: 'آرایه‌ای از وظایف که در نمودار گانت نمایش داده می‌شوند. هر وظیفه شامل ویژگی‌هایی مانند شناسه، نام، شروع، پایان و پیشرفت است.',
            },
            {
                propName: 'viewMode',
                type: '<code>ViewMode</code>',
                default: '<code>ViewMode.Day</code>',
                desc: 'حالت نمایش نمودار گانت. می‌تواند به ساعت، ربع روز، نیم‌روز، روز، هفته، ماه یا سال تنظیم شود.',
            },
            {
                propName: 'extraColumns',
                type: '{ header: ExtraHeader; cell: ExtraCell }[]',
                default: '[]',
                desc: 'آرایه‌ای از اشیاء که ستون‌های اضافی برای نمایش در لیست وظایف را تعریف می‌کنند. هر شیء شامل یک عنوان و یک رندرکننده سلول است.',
            },
            {
                propName: 'colorsMap',
                type: '<code>Object{string, string}</code>',
                default: '{}',
                desc: 'نقشه‌ای از رنگ‌های سفارشی برای انواع وظایف یا وظایف خاص. این ویژگی امکان سبک‌دهی پویا را بر اساس نوع وظیفه یا پروژه فراهم می‌کند.',
            },
            {
                propName: 'showArrow',
                type: 'boolean',
                default: 'true',
                desc: 'یک پرچم برای تعیین نمایش یا عدم نمایش پیکان‌های وابستگی بین وظایف. وقتی false باشد، پیکان‌ها مخفی می‌شوند.',
            },
            {
                propName: 'headerHeight',
                type: '<code>number</code>',
                default: '50',
                desc: 'ارتفاع سربرگ در نمودار گانت، بر حسب پیکسل.',
            },
            {
                propName: 'columnWidth',
                type: '<code>number</code>',
                default: '65',
                desc: 'عرض هر ستون در نمودار گانت، بر حسب پیکسل.',
            },
            {
                propName: 'rowHeight',
                type: '<code>number</code>',
                default: '50',
                desc: 'ارتفاع هر سطر در نمودار گانت، بر حسب پیکسل.',
            },
            {
                propName: 'barCornerRadius',
                type: '<code>number</code>',
                default: '6',
                desc: 'شعاع گوشه‌های میله‌های وظایف در نمودار گانت.',
            },
            {
                propName: 'TaskListHeader',
                type: '{ headerHeight: number; rowWidth: string; fontFamily: string; fontSize: string; }',
                default: '<code>TaskListHeader</code>',
                desc: 'کامپوننت سربرگ سفارشی برای لیست وظایف. امکان افزودن سربرگ‌های اضافی تعریف‌شده در extraColumns را فراهم می‌کند.',
            },
            {
                propName: 'TaskListTable',
                type: '{ rowHeight: number; rowWidth: string; fontFamily: string; fontSize: string; locale: string; tasks: Task[]; selectedTaskId: string; setSelectedTask: (taskId: string) => void; onExpanderClick: (task: Task) => void; }',
                default: '<code>TaskListTable</code>',
                desc: 'کامپوننت جدول سفارشی برای لیست وظایف که امکان افزودن سلول‌های اضافی تعریف‌شده در extraColumns را فراهم می‌کند.',
            },
            {
                propName: 'TooltipContent',
                type: '{ task: Task; fontSize: string; fontFamily: string; }',
                default: '<code>TooltipContent</code>',
                desc: 'کامپوننت راهنمای سفارشی برای نمایش جزئیات وظایف.',
            },
            {
                propName: 'todayColor',
                type: '<code>string</code>',
                default: '<code>url(#horzLines)</code>',
                desc: 'رنگی که برای برجسته‌کردن روز جاری در نمودار گانت استفاده می‌شود.',
            },
            {
                propName: 'arrowColor',
                type: '<code>string</code>',
                default: '<code>#3380fa</code>',
                desc: 'رنگ پیکان‌های وابستگی بین وظایف.',
            },
            {
                propName: 'onSelect',
                type: '(task: Task, isSelected: boolean) => void',
                default: 'undefined',
                desc: 'تابعی که هنگام انتخاب یا عدم انتخاب یک وظیفه فراخوانی می‌شود.',
            },
            {
                propName: 'onDoubleClick',
                type: '(task: Task) => void',
                default: 'undefined',
                desc: 'تابعی که هنگام دوبار کلیک روی یک وظیفه فراخوانی می‌شود.',
            },
            {
                propName: 'onClick',
                type: '(task: Task) => void',
                default: 'undefined',
                desc: 'تابعی که هنگام کلیک روی یک وظیفه فراخوانی می‌شود.',
            },
            {
                propName: 'onDateChange',
                type: '(task: Task, children: Task[]) => void | boolean | Promise<void> | Promise<boolean>',
                default: 'undefined',
                desc: 'تابعی که هنگام تغییر تاریخ شروع یا پایان وظیفه فراخوانی می‌شود. بازگرداندن false یا خطا عملیات را لغو می‌کند.',
            },
            {
                propName: 'onProgressChange',
                type: '(task: Task, children: Task[]) => void | boolean | Promise<void> | Promise<boolean>',
                default: 'undefined',
                desc: 'تابعی که هنگام تغییر پیشرفت وظیفه فراخوانی می‌شود. بازگرداندن false یا خطا عملیات را لغو می‌کند.',
            },
            {
                propName: 'onDelete',
                type: '(task: Task) => void | boolean | Promise<void> | Promise<boolean>',
                default: 'undefined',
                desc: 'تابعی که هنگام حذف یک وظیفه فراخوانی می‌شود. بازگرداندن false یا خطا عملیات را لغو می‌کند.',
            },
            {
                propName: 'onExpanderClick',
                type: '(task: Task) => void',
                default: 'undefined',
                desc: 'تابعی که هنگام کلیک روی آیکون بازکننده در لیست وظایف فراخوانی می‌شود.',
            },
        ],
    },
]

const ganttTaskReactFormatApi = (
    <div className="demo-api-table mb-12">
        <h4 className="mb-5">وابستگی‌ها</h4>
        <h6 id="react-number-format-api" className="mb-3">
            gantt-task-react
        </h6>
        <p>
            شما می‌توانید تمام ویژگی‌های موجود را در اینجا پیدا کنید{' '}
            <a
                className="underline text-primary"
                href="https://github.com/MaTeMaTuK/gantt-task-react"
                target="_blank"
                rel="noreferrer"
            >
                gantt-task-react
            </a>{' '}
        </p>
    </div>
)


const GanttChartDoc = () => {
    return (
        <DemoLayout
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            api={demoApi}
            mdPrefixPath="shared"
            extra={ganttTaskReactFormatApi}
        />
    )
}

export default GanttChartDoc
