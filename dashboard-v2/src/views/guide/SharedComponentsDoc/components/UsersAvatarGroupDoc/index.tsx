import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'UsersAvatarGroupDoc'

const demoHeader = {
    title: 'گروه آواتار کاربران (UsersAvatarGroup)',
    desc: 'گروه آواتار کاربران چندین آواتار کاربران را به صورت یک پشته به هم متصل می‌کند.',
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
        component: 'گروه آواتار کاربران (UsersAvatarGroup)',
        api: [
            {
                propName: 'avatarGroupProps',
                type: `<a class="text-indigo-600 underline" href="/ui-components/avatar#api" target="_blank"><code>Avatar.GroupProps</code></a>`,
                default: `<code>{}</code>`,
                desc: 'پراپرتی‌های Avatar.Group',
            },
            {
                propName: 'avatarProps',
                type: `<a class="text-indigo-600 underline" href="/ui-components/avatar#api" target="_blank"><code>Avatar.GroupProps</code></a>`,
                default: `<code>{}</code>`,
                desc: 'پراپرتی‌های Avatar',
            },
            {
                propName: 'imgKey',
                type: `<code>string</code>`,
                default: `<code>'img'</code>`,
                desc: 'کلید ویژگی برای شناسایی منبع تصویر',
            },
            {
                propName: 'nameKey',
                type: `<code>string</code>`,
                default: `<code>'name'</code>`,
                desc: 'کلید ویژگی برای شناسایی نام آواتار',
            },
            {
                propName: 'onAvatarClick',
                type: `<code>(data: UserDataObject) => void</code>`,
                default: `-`,
                desc: 'کلید ویژگی برای شناسایی نام آواتار',
            },
            {
                propName: 'users',
                type: `<code>Array&lt;UserDataObject&gt;</code>`,
                default: `<code>[]</code>`,
                desc: 'داده‌های کاربران.',
            },
        ],
    },
]


const UsersAvatarGroupDoc = () => {
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

export default UsersAvatarGroupDoc
