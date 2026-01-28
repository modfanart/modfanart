import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'IconTextDoc'
const demoHeader = {
    title: 'آیکن و متن (IconText)', // IconText
    desc: 'آیکن و متن (IconText) یک کامپوننت است که برای هم‌راستا کردن آیکن‌ها با متن استفاده می‌شود.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: `استفاده نمونه`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'آیکن و متن (IconText)', // IconText
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'span'</code>`,
                desc: 'عنصری که باید رندر شود.',
            },
            {
                propName: 'icon',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'آیکنی که باید نمایش داده شود.',
            },
        ],
    },
]

const IconTextDoc = () => {
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

export default IconTextDoc
