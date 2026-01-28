import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'NavToggleDoc'

const demoHeader = {
    title: 'ناو توگل (NavToggle)',
    desc: 'کامپوننت ناو توگل به عنوان یک سوئیچ برای ناوبری قابل گسترش یا کناری طراحی شده است.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: `مثال استفاده`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'ناو توگل (NavToggle)',
        api: [
            {
                propName: 'toggled',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'وضعیت ناو توگل',
            },
        ],
    },
]


const NavToggleDoc = () => {
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

export default NavToggleDoc
