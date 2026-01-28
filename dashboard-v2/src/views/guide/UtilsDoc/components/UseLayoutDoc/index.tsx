import DemoComponentApi from '@/components/docs/DemoComponentApi'
import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'UseLayoutDoc'

const demoHeader = {
    title: 'useLayout',
    desc: 'The useLayout hook provides access to the layout context, which various layout data & method to reassemble the page container, its purposely server for the template layout.',
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

const extra = (
    <DemoComponentApi
        hideApiTitle
        keyText="return"
        api={[
            {
                api: [
                    {
                        propName: 'type',
                        type: `<code>LayoutType</code>`,
                        default: '-',
                        desc: 'Indicates the current layout type, which may influence how components are displayed.',
                    },
                    {
                        propName: 'adaptiveCardActive',
                        type: `<code>boolean | undefined</code>`,
                        default: '-',
                        desc: 'Indicating whether an adaptive card layout is active.',
                    },
                    {
                        propName: 'pageContainerReassemble',
                        type: `<code>(props: PageContainerReassembleProps) => ReactNode | undefined</code>`,
                        default: '-',
                        desc: 'Optional function to dynamically reassemble the page container structure with custom properties and components.',
                    },
                ],
            },
        ]}
    />
)

const UseLayoutDoc = () => {
    return (
        <DemoLayout
            hideApiTitle
            hideFooter
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            mdPrefixPath="utils"
            extra={extra}
            keyText="param"
        />
    )
}

export default UseLayoutDoc
