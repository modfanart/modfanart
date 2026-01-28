import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'ConfirmDialogDoc'

const demoHeader = {
    title: 'دیالوگ تأیید (ConfirmDialog)',
    desc: 'دیالوگ تأیید یک دیالوگ آماده است که برای تأیید استفاده می‌شود.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: `نمونه‌ای از استفاده.`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'دیالوگ تأیید (ConfirmDialog)',
        api: [
            {
                propName: 'cancelText',
                type: `<code>string</code>`,
                default: `<code>'لغو'</code>`,
                desc: 'متن دکمه لغو',
            },
            {
                propName: 'cancelButtonProps',
                type: `ButtonProps`,
                default: '-',
                desc: 'اعمال ویژگی‌های دکمه برای دکمه لغو',
            },
            {
                propName: 'confirmButtonProps',
                type: `ButtonProps`,
                default: '-',
                desc: 'اعمال ویژگی‌های دکمه برای دکمه تأیید',
            },
            {
                propName: 'confirmText',
                type: `<code>string</code>`,
                default: `<code>'تأیید'</code>`,
                desc: 'متن دکمه تأیید',
            },
            {
                propName: 'onCancel',
                type: `<code>() => void</code>`,
                default: `-`,
                desc: 'تابع فراخوانی پس از کلیک روی دکمه لغو',
            },
            {
                propName: 'onConfirm',
                type: `<code>() => void</code>`,
                default: `-`,
                desc: 'تابع فراخوانی پس از کلیک روی دکمه تأیید',
            },
            {
                propName: 'title',
                type: `<code>string</code>`,
                default: `<code>'اطلاعات'</code>`,
                desc: 'عنوان تأییدیه',
            },
            {
                propName: 'type',
                type: `<code>'info'</code> | <code>'success'</code> | <code>'warning'</code> | <code>'danger'</code>`,
                default: `<code>'info'</code>`,
                desc: 'نوع تأییدیه',
            },
        ],
    },
]


const ConfirmDialogDoc = () => {
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

export default ConfirmDialogDoc
