import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'ContainerDoc'

const demoHeader = {
    title: 'کانتینر (Container)',
    desc: 'کانتینر یک کامپوننت برای تنظیم عرض عناصر بر اساس نقطه شکست فعلی است. این کامپوننت به یک عنصر <code>max-width</code> می‌دهد و با <code>min-width</code> نقطه شکست فعلی مطابقت دارد.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: `نمونه‌ای از استفاده`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'کانتینر (Container)',
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'div'</code>`,
                desc: 'عنصر قابل رندر',
            },
        ],
    },
]


const ContainerDoc = () => {
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

export default ContainerDoc
