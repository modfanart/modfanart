import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'StickyFooterDoc'
const demoHeader = {
    title: 'فوتر چسبان (StickyFooter)',
    desc: 'فوتر چسبان به المان این امکان را می‌دهد که به پایین صفحه بچسبد حتی زمانی که محتوا هنوز به پایین نرسیده است.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: 'مثال استفاده.',
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'فوتر چسبان (StickyFooter)',
        api: [
            {
                propName: 'defaultClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس برای زمانی که کامپوننت هنوز به پایین چسبیده نیست',
            },
            {
                propName: 'stickyClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس برای زمانی که کامپوننت به پایین چسبیده است',
            },
        ],
    },
]


const StickyFooterDoc = () => {
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

export default StickyFooterDoc
