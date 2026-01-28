import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Simple from './Simple'
import WithLoding from './WithLoding'

const mdPath = 'MediaSkeletonDoc'

const demoHeader = {
    title: 'مدیا اسکلتون (MediaSkeleton)',
    desc: 'مدیا اسکلتون ترکیبی از کامپوننت اسکلتون است که وضعیت بارگذاری یک رسانه مانند عنصر را نمایش می‌دهد.',
}

const demos = [
    {
        mdName: 'Simple',
        mdPath: mdPath,
        title: 'ساده (Simple)',
        desc: `استفاده اساسی.`,
        component: <Simple />,
    },
    {
        mdName: 'WithLoding',
        mdPath: mdPath,
        title: 'با بارگذاری (WithLoding)',
        desc: `استفاده همراه با بارگذاری`,
        component: <WithLoding />,
    },
]

const demoApi = [
    {
        component: 'مدیا اسکلتون (MediaSkeleton)',
        api: [
            {
                propName: 'avatarProps',
                type: `<a class="text-indigo-600 underline" href="/ui-components/skeleton#api" target="_blank"><code>SkeletonProps</code></a>`,
                default: `-`,
                desc: 'پراپ‌ها برای اسکلتون آواتار',
            },
            {
                propName: 'showAvatar',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا اسکلتون آواتار نمایش داده شود؟',
            },
            {
                propName: 'textProps',
                type: `<a class="text-indigo-600 underline" href="/ui-components/skeleton#api" target="_blank"><code>SkeletonProps</code></a>`,
                default: `-`,
                desc: 'پراپ‌ها برای اسکلتون متن',
            },
            {
                propName: 'titleProps',
                type: `<a class="text-indigo-600 underline" href="/ui-components/skeleton#api" target="_blank"><code>SkeletonProps</code></a>`,
                default: `-`,
                desc: 'پراپ‌ها برای اسکلتون عنوان',
            },
        ],
    },
]


const MediaSkeletonDoc = () => {
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

export default MediaSkeletonDoc
