import DemoComponentApi from '@/components/docs/DemoComponentApi'
import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'ClassNamesDoc'

const demoHeader = {
    title: 'classNames',
    desc: 'utility function combines multiple class names using the <code>classnames</code> library and merges Tailwind CSS class conflicts using the <code>tailwind-merge</code> utility',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'Example',
        desc: ``,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'Params',
        api: [
            {
                propName: 'name',
                type: `<code>cn.ArgumentArray</code>`,
                default: `-`,
                desc: 'A variable-length list of class names or conditions that resolve to class names.',
            },
        ],
    },
]

const extra = (
    <DemoComponentApi
        hideApiTitle
        keyText="return"
        api={[
            {
                component: 'Return',
                api: [
                    {
                        propName: 'classNames',
                        type: `<code>string</code>`,
                        default: `-`,
                        desc: 'ClassNames',
                    },
                ],
            },
        ]}
    />
)

const ClassNamesDoc = () => {
    return (
        <DemoLayout
            hideApiTitle
            hideFooter
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            api={demoApi}
            mdPrefixPath="utils"
            extra={extra}
            keyText="param"
        />
    )
}

export default ClassNamesDoc
