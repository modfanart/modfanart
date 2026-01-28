import DemoComponentApi from '@/components/docs/DemoComponentApi'
import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'SleepDoc'

const demoHeader = {
    title: 'sleep',
    desc: 'Fuction of creates a delay or pause in the execution of code for a specified number of milliseconds by returning a promise that resolves after the given time',
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
                propName: 'ms',
                type: `<code>number</code>`,
                default: `-`,
                desc: 'The number of milliseconds to pause the execution.',
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
                        propName: 'resolve',
                        type: `<code>Promise<void></code>`,
                        default: `-`,
                        desc: 'The promise resolves after the delay, allowing the execution of the next operation.',
                    },
                ],
            },
        ]}
    />
)

const SleepDoc = () => {
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

export default SleepDoc
