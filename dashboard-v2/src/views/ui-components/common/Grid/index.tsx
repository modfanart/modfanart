import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import GridTemplateColumns from './GridTemplateColumns'
import GridColumnStartEnd from './GridColumnStartEnd'
import GridColumnStartEndLine from './GridColumnStartEndLine'
import GridTemplateRows from './GridTemplateRows'
import GridRowStartEndLine from './GridRowStartEndLine'
import GridRowStartEnd from './GridRowStartEnd'
import GridAutoflow from './GridAutoflow'
import GridAutoColumns from './GridAutoColumns'
import GridAutoRows from './GridAutoRows'
import HoverFocus from './HoverFocus'
import BreakpointsMediaQueries from './BreakpointsMediaQueries'

const mdPath = 'Grid'

const demoHeader = {
    title: 'شبکه (Grid)',
    desc: `سیستم شبکه از Tailwind CSS، برای اطلاعات بیشتر به <a class="text-blue-500 underline" href="https://tailwindcss.com/" target="_blank" >مستندات رسمی</a> مراجعه کنید`,
}
const demos = [
    {
        mdName: 'GridTemplateColumns',
        mdPath: mdPath,
        title: 'قالب ستون‌ها (Grid Template Columns)',
        desc: `<p>از ابزارهای <code>grid-cols-{n}</code> برای ایجاد شبکه‌هایی با <em>n</em> ستون با اندازه مساوی استفاده کنید.</p>`,
        component: <GridTemplateColumns />,
    },
    {
        mdName: 'GridColumnStartEnd',
        mdPath: mdPath,
        title: 'شروع / پایان ستون (Grid Column Start / End)',
        desc: `<p>از ابزارهای <code>col-span-{n}</code> برای گسترش یک عنصر به اندازه <em>n</em> ستون استفاده کنید.</p>`,
        component: <GridColumnStartEnd />,
    },
    {
        mdName: 'GridColumnStartEndLine',
        mdPath: mdPath,
        title: 'شروع / پایان خط ستون (Grid Column Start / End Line)',
        desc: `<p>از ابزارهای <code>col-start-{n}</code> و <code>col-end-{n}</code> برای تعیین مکان شروع یا پایان یک عنصر در خط <em>nth</em> شبکه استفاده کنید. این ابزارها همچنین می‌توانند با <code>col-span-{n}</code> ترکیب شوند تا تعداد خاصی از ستون‌ها را پوشش دهند.</p> <p>توجه داشته باشید که خطوط شبکه CSS از 1 شروع می‌شوند نه از 0، بنابراین یک عنصر تمام عرض در شبکه 6 ستونی از خط 1 شروع و در خط 7 تمام می‌شود.</p>`,
        component: <GridColumnStartEndLine />,
    },
    {
        mdName: 'GridTemplateRows',
        mdPath: mdPath,
        title: 'قالب ردیف‌ها (Grid Template Rows)',
        desc: `<p>از ابزارهای <code>grid-rows-{n}</code> برای ایجاد شبکه‌هایی با <em>n</em> ردیف با اندازه مساوی استفاده کنید.</p>`,
        component: <GridTemplateRows />,
    },
    {
        mdName: 'GridRowStartEndLine',
        mdPath: mdPath,
        title: 'شروع / پایان خط ردیف (Grid Row Start / End Line)',
        desc: `<p>از ابزارهای <code>row-start-{n}</code> و <code>row-end-{n}</code> برای تعیین مکان شروع یا پایان یک عنصر در خط <em>nth</em> ردیف شبکه استفاده کنید. این ابزارها همچنین می‌توانند با <code>row-span-{n}</code> ترکیب شوند تا تعداد خاصی از ردیف‌ها را پوشش دهند.</p> <br /> <p>توجه داشته باشید که خطوط شبکه CSS از 1 شروع می‌شوند نه از 0، بنابراین یک عنصر تمام ارتفاع در شبکه 3 ردیفی از خط 1 شروع و در خط 4 تمام می‌شود.</p>`,
        component: <GridRowStartEndLine />,
    },
    {
        mdName: 'GridRowStartEnd',
        mdPath: mdPath,
        title: 'شروع / پایان ردیف (Grid Row Start / End)',
        desc: `<p>از ابزارهای <code>row-span-{n}</code> برای گسترش یک عنصر به اندازه <em>n</em> ردیف استفاده کنید.</p>`,
        component: <GridRowStartEnd />,
    },
    {
        mdName: 'GridAutoflow',
        mdPath: mdPath,
        title: 'جریان خودکار شبکه (Grid Auto Flow)',
        desc: `<p>از ابزارهای <code>grid-flow-{keyword}</code> برای کنترل نحوه عملکرد الگوریتم قرارگیری خودکار برای چیدمان شبکه استفاده کنید.</p>`,
        component: <GridAutoflow />,
    },
    {
        mdName: 'GridAutoColumns',
        mdPath: mdPath,
        title: 'ستون‌های خودکار شبکه (Grid Auto Columns)',
        desc: `<p>از ابزارهای <code>auto-cols-{size}</code> برای کنترل اندازه ستون‌های به طور خودکار ایجاد شده در شبکه استفاده کنید.</p>`,
        component: <GridAutoColumns />,
    },
    {
        mdName: 'GridAutoRows',
        mdPath: mdPath,
        title: 'ردیف‌های خودکار شبکه (Grid Auto Rows)',
        desc: `<p>از ابزارهای <code>auto-rows-{size}</code> برای کنترل اندازه ردیف‌های به طور خودکار ایجاد شده در شبکه استفاده کنید.</p>`,
        component: <GridAutoRows />,
    },
    {
        mdName: 'HoverFocus',
        mdPath: mdPath,
        title: 'حالت‌های Hover, Focus و سایر حالات',
        desc: `<p>تایلویند به شما اجازه می‌دهد که کلاس‌های ابزاری را در حالات مختلف به طور مشروط اعمال کنید، به عنوان مثال از <code>hover:{class}</code> برای اعمال فقط <code>{class}</code> هنگام hover استفاده کنید.</p>`,
        component: <HoverFocus />,
    },
    {
        mdName: 'BreakpointsMediaQueries',
        mdPath: mdPath,
        title: 'نقاط شکست و media queries',
        desc: `<p>شما همچنین می‌توانید از واریانت‌های مدیا برای هدف‌گذاری نقاط شکست واکنش‌گرا، حالت تاریک، prefers-reduced-motion و غیره استفاده کنید. به عنوان مثال، از <code>md:{class}</code> برای اعمال <code>{class}</code> تنها در اندازه صفحه‌های متوسط و بزرگتر استفاده کنید.</p>`,
        component: <BreakpointsMediaQueries />,
    },
]


const Typography = () => {
    return <DemoLayout header={demoHeader} demos={demos} />
}

export default Typography
