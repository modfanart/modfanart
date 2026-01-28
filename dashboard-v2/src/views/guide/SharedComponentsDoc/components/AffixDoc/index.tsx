import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Offset from './Offset'

const mdPath = 'AffixDoc'

const demoHeader = {
    title: 'افیکس (Affix)',
    desc: 'افیکس المان‌ها را به صورت ثابت در موقعیت خود رندر می‌کند.',
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
        mdName: 'Offset',
        mdPath: mdPath,
        title: 'افست (Offset)',
        desc: `با افست`,
        component: <Offset />,
    },
]

const demoApi = [
    {
        component: 'افیکس (Affix)',
        api: [
            {
                propName: 'offset',
                type: `<code>number</code>`,
                default: `-`,
                desc: 'افست از بالای نمای ویوپورت (واحد px)',
            },
        ],
    },
]

const AffixDoc = () => {
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

export default AffixDoc
