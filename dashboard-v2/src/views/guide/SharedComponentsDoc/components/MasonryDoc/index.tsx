import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Responsive from './Responsive'

const mdPath = 'MasonryDoc'

const demoHeader = {
    title: 'مِسنری (Masonry)',
    desc: 'یک کامپوننت برای چیدمان مسنری',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'اساسی (Basic)',
        desc: `استفاده اساسی`,
        component: <Basic />,
    },
    {
        mdName: 'Responsive',
        mdPath: mdPath,
        title: 'واکنش‌گرا (Responsive)',
        desc: `مثال واکنش‌گرا`,
        component: <Responsive />,
    },
]

const demoApi = [
    {
        component: 'مِسنری (Masonry)',
        api: [
            {
                propName: 'asElement',
                type: `<code>string</code>`,
                default: `<code>'div'</code>`,
                desc: 'المان رندر شده',
            },
            {
                propName: 'columns',
                type: '<code>number | Object{number, number}</code>',
                default: `-`,
                desc: 'ستون‌های مسنری، می‌تواند به صورت شی برای کنترل واکنش‌گرا باشد',
            },
            {
                propName: 'gap',
                type: `<code>number</code>`,
                default: `-`,
                desc: 'فاصله بین آیتم‌های مسنری',
            },
        ],
    },
]


const PresetSegmentItemOptionDoc = () => {
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

export default PresetSegmentItemOptionDoc
