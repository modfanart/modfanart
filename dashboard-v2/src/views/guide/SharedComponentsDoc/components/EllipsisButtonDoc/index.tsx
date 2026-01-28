import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'EllipsisButtonDoc'

const demoHeader = {
    title: 'دکمه سه‌نقطه‌ای (EllipsisButton)',
    desc: 'یک کامپوننت دکمه پیشرفته با آیکون سه‌نقطه‌ای که می‌تواند به‌عنوان ماشه‌ای برای باز کردن Dropdown استفاده شود.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: `نمونه‌ای از استفاده با کامپوننت Dropdown.`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'دکمه سه‌نقطه‌ای (EllipsisButton)',
        api: [
            {
                propName: 'variant',
                type: `<code>'solid'</code>  | <code>'twoTone'</code> | <code>'plain'</code> | <code>'default'</code>`,
                default: `<code>'plain'</code>`,
                desc: 'نوع دکمه.',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code> | <code>'xs'</code>`,
                default: `<code>'xs'</code>`,
                desc: 'اندازه دکمه.',
            },
            {
                propName: 'shape',
                type: `<code>'round'</code>  | <code>'circle'</code> | <code>'none'</code>`,
                default: `<code>'circle'</code>`,
                desc: 'شعاع گوشه‌های دکمه.',
            },
        ],
    },
]


const EllipsisButtonDoc = () => {
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

export default EllipsisButtonDoc
