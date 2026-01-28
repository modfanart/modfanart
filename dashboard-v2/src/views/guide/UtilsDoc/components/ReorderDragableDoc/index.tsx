import DemoComponentApi from '@/components/docs/DemoComponentApi'
import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'ReorderDragableDoc'

const demoHeader = {
    title: 'reorderDragable',
    desc: '<p><code>reorderDragable</code> function is used for reordering items within or across droppable areas in a drag-and-drop interface, using the <code>DraggableLocation</code> structure.</p>',
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
                propName: 'quoteMap',
                type: `<code>T extends Record&lt;string, unknown[]&gt;</code>`,
                default: `-`,
                desc: 'An object where the keys represent different droppable areas (lists), and the values are arrays of items in each.',
            },
            {
                propName: 'source',
                type: `<code>{droppableId: string; index: number;}</code>`,
                default: `-`,
                desc: 'The starting location of the dragged item. This contains the droppableId and index of the item.',
            },
            {
                propName: 'destination',
                type: `<code>{droppableId: string; index: number;}</code>`,
                default: `-`,
                desc: 'The target location where the item is being dropped, containing the droppableId and index.',
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
                        propName: 'quoteMap',
                        type: `<code>T</code>`,
                        desc: 'A new object with the updated lists, reflecting the reordered items either within the same list or between different lists.',
                        default: `-`,
                    },
                ],
            },
        ]}
    />
)

const ReorderDragableDoc = () => {
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

export default ReorderDragableDoc
