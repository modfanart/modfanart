import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'DoubleSidedImageDoc'

const demoHeader = {
    title: 'تصویر دوطرفه (DoubleSidedImage)',
    desc: 'تصویر دوطرفه یک کامپوننت برای جایگذاری تصویر است که می‌تواند منبع تصویر را بر اساس حالت فعلی تم تغییر دهد.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: `کامپوننت تصویر دوطرفه تمام ویژگی‌های تگ <code>img</code> را به‌عنوان props می‌پذیرد.`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'تصویر دوطرفه (DoubleSidedImage)',
        api: [
            {
                propName: 'darkModeSrc',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'منبع تصویر برای نمایش در حالت تاریک.',
            },
        ],
    },
]


const DoubleSidedImageDoc = () => {
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

export default DoubleSidedImageDoc
