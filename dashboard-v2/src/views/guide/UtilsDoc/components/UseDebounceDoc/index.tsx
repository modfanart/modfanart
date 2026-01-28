import DemoComponentApi from '@/components/docs/DemoComponentApi'
import DemoLayout from '@/components/docs/DemoLayout'
// Demo
import Example from './Example'

const mdPath = 'UseDebounceDoc/'

const demoHeader = {
    title: 'useDebounce ',
    desc: 'This hook provides an easy way to debounce any function, ensuring that it only executes after a specified delay.',
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
                propName: 'func',
                type: `<code> (...args: any)</code>`,
                default: `-`,
                desc: 'The function to debounce.',
            },
            {
                propName: 'wait',
                type: `<code>number</code>`,
                default: `-`,
                desc: 'The number of milliseconds to delay. If not provided, the function will be debounced with a default delay (usually determined by lodash)',
            },
        ],
    },
]

const extra = (
    <DemoComponentApi
        keyText="return"
        api={[
            {
                component: 'Return',
                api: [
                    {
                        propName: 'func',
                        type: `<code> (...args: any)</code>`,
                        default: `-`,
                        desc: 'A debounced version of the provided function, which will delay its execution based on the specified wait time and options.',
                    },
                ],
            },
        ]}
    />
)

const UseDebounceDoc = () => {
    return (
        <DemoLayout
            hideApiTitle
            hideFooter
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            mdPrefixPath="docs/SharedComponentsDoc/components"
            api={demoApi}
            extra={extra}
            keyText="param"
        />
    )
}

export default UseDebounceDoc
