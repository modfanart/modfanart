import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'

const mdPath = 'AbbreviateNumberDoc'

const demoHeader = {
    title: 'اختصار عدد (AbbreviateNumber)',
    desc: 'AbbreviateNumber طراحی شده است تا اعداد بزرگ را برای خوانایی بهتر اختصار دهد. این تابع اعداد را به قالبی کوتاه‌شده با پسوندهایی مانند "K" برای هزار و "M" برای میلیون تبدیل می‌کند.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'اساسی (Basic)',
        desc: `استفاده اساسی.`,
        component: <Basic />,
    },
]

const demoApi = [
    {
        component: 'اختصار عدد (AbbreviateNumber)',
        api: [
            {
                propName: 'value',
                type: `<code>عدد (number)</code>`,
                default: `-`,
                desc: 'مقدار عددی که باید اختصار داده شده و نمایش داده شود.',
            },
        ],
    },
]



const ActionLinkDoc = () => {
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

export default ActionLinkDoc
