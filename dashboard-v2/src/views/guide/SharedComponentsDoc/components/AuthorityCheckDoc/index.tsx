import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'AuthorityCheckDoc'

const demoHeader = {
    title: 'چک مجوز (AuthorityCheck)',
    desc: 'کامپوننت AuthorityCheck برای بررسی اینکه آیا کاربر فعلی مجوز دسترسی دارد یا نه استفاده می‌شود. این کامپوننت می‌تواند برای نمایش یا پنهان کردن برخی المان‌ها که نیاز به مجوز دارند، بر اساس نقش‌های خاص، به کار رود.',
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
        component: 'چک مجوز (AuthorityCheck)',
        api: [
            {
                propName: 'authority',
                type: `<code>Array</code>`,
                default: `<code>[]</code>`,
                desc: 'لیست نقش‌هایی که دسترسی به المان‌های بسته شده را دارند',
            },
            {
                propName: 'userAuthority',
                type: `<code>Array</code>`,
                default: `<code>[]</code>`,
                desc: 'لیست نقش‌های کاربر',
            },
        ],
    },
]

const AuthorityCheckDoc = () => {
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

export default AuthorityCheckDoc
