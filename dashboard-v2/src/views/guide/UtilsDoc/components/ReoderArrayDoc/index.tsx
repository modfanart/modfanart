import DemoComponentApi from '@/components/docs/DemoComponentApi'
import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'ReoderArrayDoc'

const demoHeader = {
    title: 'reoderArray',
    desc: '<p><code>reorderArray</code> function takes an array and reorders its elements by moving an item from one index to another.</p>',
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
                propName: 'list',
                type: `<code>T[]</code>`,
                default: `-`,
                desc: 'The array to be reordered. This can be an array of any type (T is a generic type).',
            },
            {
                propName: 'startIndex',
                type: `<code>number</code>`,
                default: `-`,
                desc: 'The index of the element in the array that you want to move.',
            },
            {
                propName: 'endIndex',
                type: `<code>number</code>`,
                default: `-`,
                desc: 'The target index where the element should be placed.',
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
                        propName: 'result',
                        type: `<code>T[]</code>`,
                        desc: 'A new array with the element reordered from startIndex to endIndex.',
                        default: `-`,
                    },
                ],
            },
        ]}
    />
)

const ReoderArrayDoc = () => {
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

export default ReoderArrayDoc
