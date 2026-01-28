import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Placement from './Placement'
import Customize from './Customize'

const mdPath = 'Tooltip'

const demoHeader = {
    title: 'تولتیپ (Tooltip)',
    desc: 'تولتیپ‌ها زمانی که کاربر بر روی یک عنصر حرکت می‌کند ظاهر می‌شوند و اطلاعات مرتبط با آن عنصر را نمایش می‌دهند.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `استفاده پایه از تولتیپ.`,
        component: <Basic />,
    },
    {
        mdName: 'Customize',
        mdPath: mdPath,
        title: 'سفارشی‌سازی (Customize)',
        desc: `محتوای تولتیپ را می‌توان سفارشی‌سازی کرد.`,
        component: <Customize />,
    },
    {
        mdName: 'Placement',
        mdPath: mdPath,
        title: 'موقعیت‌دهی (Placement)',
        desc: `۹ گزینه موقعیت‌دهی برای تولتیپ وجود دارد که به‌صورت پیش‌فرض در موقعیت بالا قرار می‌گیرد.`,
        component: <Placement />,
    },
]

const demoApi = [
    {
        component: 'تولتیپ (Tooltip)',
        api: [
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'غیرفعال کردن قابلیت تغییر وضعیت تولتیپ',
            },
            {
                propName: 'isOpen',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'نمایش تولتیپ به‌صورت پیش‌فرض',
            },
            {
                propName: 'placement',
                type: `<code>'top'</code> | <code>'top-start'</code> | <code>'top-end'</code> | <code>'bottom'</code> | <code>'bottom-start'</code> | <code>'bottom-end'</code> | <code>'right'</code> | <code>'right-start'</code> | <code>'right-end'</code> | <code>'left'</code> | <code>'left-start'</code> | <code>'left-end'</code>`,
                default: `<code>'top'</code>`,
                desc: 'موقعیت تولتیپ',
            },
            {
                propName: 'title',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: ``,
                desc: 'محتوای تولتیپ',
            },
            {
                propName: 'wrapperClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس برای عنصر والد تولتیپ',
            },
        ],
    },
]

const Tooltip = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Tooltip
