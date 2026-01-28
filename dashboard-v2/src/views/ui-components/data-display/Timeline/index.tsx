import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Advance from './Advance'

const mdPath = 'Timeline'

const demoHeader = {
    title: 'تایم‌لاین (Timeline)',
    desc: 'تایم‌لاین لیستی از رویدادها را به ترتیب زمانی نمایش می‌دهد.',
}

const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: ``,
        component: <Basic />,
    },
    {
        mdName: 'Advance',
        mdPath: mdPath,
        title: 'پیشرفته (Advance)',
        desc: ``,
        component: <Advance />,
    },
]

const demoApi = [
    {
        component: 'تایم‌لاین (Timeline.Item)',
        api: [
            {
                propName: 'media',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'مدیا آیتم تایم‌لاین (توجه: عرض مدیا باید بین آیتم‌های تایم‌لاین ثابت باشد)',
            },
        ],
    },
]

const Timeline = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Timeline
