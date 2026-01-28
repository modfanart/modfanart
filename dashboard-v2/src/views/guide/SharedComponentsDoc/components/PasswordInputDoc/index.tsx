import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'PasswordInputDoc'

const demoHeader = {
    title: 'ورودی رمز عبور (PasswordInput)',
    desc: 'یک کامپوننت ورودی رمز عبور',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: `کامپوننت PasswordInput تمام پراپ‌ها را از <a class="text-indigo-600 underline" href="/ui-components/input#api" target="_blank"><code>Input</code></a> می‌پذیرد.`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'ورودی رمز عبور (PasswordInput)',
        api: [
            {
                propName: 'onVisibleChange',
                type: `<code>(visible:boolean) => void</code>`,
                default: `-`,
                desc: 'کال‌バック زمانی که آیکون کلیک می‌شود',
            },
        ],
    },
]

const PasswordInputDoc = () => {
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
export default PasswordInputDoc
