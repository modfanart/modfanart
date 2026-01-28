import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Icon from './Icon'
import CustomClass from './CustomClass'

const mdPath = 'GrowShrinkValueDoc'

const demoHeader = {
    title: 'تصویر دوطرفه (GrowShrinkValue)', // DoubleSidedImage
    desc: 'تصویر دوطرفه (GrowShrinkValue) برای نمایش یک مقدار عددی طراحی شده است که می‌تواند رشد یا کاهش را نشان دهد.',
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
        mdName: 'Icon',
        mdPath: mdPath,
        title: 'آیکن (Icon)',
        desc: ``,
        component: <Icon />,
    },
    {
        mdName: 'CustomClass',
        mdPath: mdPath,
        title: 'کلاس سفارشی (CustomClass)',
        desc: ``,
        component: <CustomClass />,
    },
]

const demoApi = [
    {
        component: 'تصویر دوطرفه (GrowShrinkValue)', // DoubleSidedImage
        api: [
            {
                propName: 'showIcon',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا باید آیکن بالا یا پایین نمایش داده شود.',
            },
            {
                propName: 'prefix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوا به عنوان پیشوند قبل از مقدار.',
            },
            {
                propName: 'suffix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوا به عنوان پسوند کنار مقدار.',
            },
            {
                propName: 'positiveIcon',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `<code>'^'</code>`,
                desc: 'آیکن یا محتوایی که وقتی <code>value</code> مثبت است نمایش داده می‌شود.',
            },
            {
                propName: 'negativeIcon',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `<code>'v'</code>`,
                desc: 'آیکن یا محتوایی که وقتی <code>value</code> منفی است نمایش داده می‌شود.',
            },
            {
                propName: 'positiveClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس CSS سفارشی که وقتی <code>value</code> مثبت است اعمال می‌شود.',
            },
            {
                propName: 'negativeClass',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'کلاس CSS سفارشی که وقتی <code>value</code> منفی است اعمال می‌شود.',
            },
            {
                propName: 'value',
                type: `<code>number</code>`,
                default: `<code>0</code>`,
                desc: 'مقدار عددی که باید نمایش داده شود.',
            },
        ],
    },
]


const GrowShrinkValueDoc = () => {
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

export default GrowShrinkValueDoc
