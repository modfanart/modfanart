import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'PresetSegmentItemOptionDoc'

const demoHeader = {
    title: 'گزینه آیتم بخش از پیش تنظیم شده (PresetSegmentItemOption)',
    desc: 'یک گزینه سفارشی از پیش ساخته شده برای کامپوننت Segment.',
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
        component: 'گزینه آیتم بخش از پیش تنظیم شده (PresetSegmentItemOption)',
        api: [
            {
                propName: 'active',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا این گزینه فعال است',
            },
            {
                propName: 'customCheck',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش یک علامت سفارشی زمانی که active برابر true است',
            },
            {
                propName: 'defaultGutter',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا از فاصله‌گذاری پیش‌فرض استفاده شود',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا این گزینه غیرفعال است',
            },
            {
                propName: 'hoverable',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا اثر هاور غیرفعال باشد',
            },
            {
                propName: 'onSegmentItemClick',
                type: `<code>() => void</code>`,
                default: `-`,
                desc: 'تابع بازخوانی هنگام کلیک روی این گزینه',
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
