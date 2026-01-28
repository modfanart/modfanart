import DemoComponentApi from '@/components/docs/DemoComponentApi'
import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'UseScrollTopDoc'

const demoHeader = {
    title: 'useScrollTop',
    desc: 'This hook tracks the window scroll position and returns a boolean value indicating whether the user has scrolled past the top of the page.',
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
                        propName: 'isSticky',
                        type: `<code>boolean</code>`,
                        default: '',
                        desc: 'Indicates whether the page has been scrolled from the top (i.e., if the element should be sticky).',
                    },
                ],
            },
        ]}
    />
)

const UseScrollTopDoc = () => {
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

export default UseScrollTopDoc
