import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Title from './Title'
import Vertical from './Vertical'
import Description from './Description'
import CustomIcon from './CustomIcon'
import Error from './Error'
import Controlled from './Controlled'
import Clickable from './Clickable'

const mdPath = 'Steps'

const demoHeader = {
    title: 'مراحل (Steps)',
    desc: 'کامپوننت مراحل پیشرفت و وظایف را از طریق ترتیب تسلسل نمایش می‌دهد.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'اساسی (Basic)',
        desc: `استفاده پیش‌فرض از کامپوننت مراحل (Steps).`,
        component: <Basic />,
    },
    {
        mdName: 'Title',
        mdPath: mdPath,
        title: 'عنوان (Title)',
        desc: `مثال مراحل با عنوان.`,
        component: <Title />,
    },
    {
        mdName: 'Vertical',
        mdPath: mdPath,
        title: 'عمودی (Vertical)',
        desc: `نمایش مراحل به‌طور پیش‌فرض افقی است، اما می‌توان آن را با استفاده از پراپ <code>vertical</code> به عمودی تغییر داد.`,
        component: <Vertical />,
    },
    {
        mdName: 'Description',
        mdPath: mdPath,
        title: 'توضیحات (Description)',
        desc: `مراحل می‌توانند توضیحات داشته باشند، اما این ویژگی تنها برای چیدمان عمودی قابل استفاده است.`,
        component: <Description />,
    },
    {
        mdName: 'CustomIcon',
        mdPath: mdPath,
        title: 'آیکون سفارشی (Custom Icon)',
        desc: `برچسب مراحل می‌تواند با آیکون‌ها جایگزین شود.`,
        component: <CustomIcon />,
    },
    {
        mdName: 'Error',
        mdPath: mdPath,
        title: 'خطا (Error)',
        desc: `با تنظیم پراپ 'error' در <code>status</code> می‌توان مشخص کرد که مرحله در وضعیت خطا قرار دارد.`,
        component: <Error />,
    },
    {
        mdName: 'Controlled',
        mdPath: mdPath,
        title: 'مراحل کنترل شده (Controlled steps)',
        desc: `ما می‌توانیم با کنترل پراپ <code>current</code> مراحل را داینامیک کنیم.`,
        component: <Controlled />,
    },
    {
        mdName: 'Clickable',
        mdPath: mdPath,
        title: 'قابل کلیک (Clickable)',
        desc: `با تنظیم پراپ <code>onChange</code> می‌توان مراحل را قابل کلیک کرد.`,
        component: <Clickable />,
    },
]

const demoApi = [
    {
        component: 'مراحل (Steps)',
        api: [
            {
                propName: 'current',
                type: `<code>number</code>`,
                default: `<code>0</code>`,
                desc: 'مرحله جاری، از 0 شمرده می‌شود',
            },
            {
                propName: 'onChange',
                type: `<code>(index: number) => void</code>`,
                default: `-`,
                desc: 'تابعی که هنگام تغییر مراحل فراخوانی می‌شود',
            },
            {
                propName: 'status',
                type: `<code>'complete'</code> | <code>'pending'</code> | <code>'in-progress'</code> | <code>'error'</code>`,
                default: `<code>'in-progress'</code>`,
                desc: 'وضعیت مرحله جاری',
            },
            {
                propName: 'vertical',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا مراحل به صورت عمودی نمایش داده شوند',
            },
        ],
    },
    {
        component: 'مراحل.آیتم (Steps.Item)',
        api: [
            {
                propName: 'customIcon',
                type: `<code>ReactNode</code> | <code>string</code>`,
                default: `-`,
                desc: 'عنصر سفارشی برای برچسب مرحله',
            },
            {
                propName: 'description',
                type: `<code>ReactNode</code> | <code>string</code>`,
                default: `-`,
                desc: 'توضیحات مرحله، فقط برای حالت عمودی قابل استفاده است',
            },
            {
                propName: 'title',
                type: `<code>ReactNode</code> | <code>string</code>`,
                default: `-`,
                desc: 'عنوان مرحله',
            },
        ],
    },
]


const Steps = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Steps
