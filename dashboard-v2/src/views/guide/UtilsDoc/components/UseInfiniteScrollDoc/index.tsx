import DemoComponentApi from '@/components/docs/DemoComponentApi'
import DemoLayout from '@/components/docs/DemoLayout'
// Demo
import Example from './Example'

const mdPath = 'UseInfiniteScrollDoc/'

const demoHeader = {
    title: 'useInfiniteScroll',
    desc: 'useInfiniteScroll hook provides a convenient way to implement infinite scrolling in a React component.',
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
                propName: 'offset',
                type: `<code>string</code>`,
                default: `'0px'`,
                desc: 'The offset from the bottom of the container at which to trigger the load more action.',
            },
            {
                propName: 'shouldStop',
                type: `<code>boolean</code>`,
                default: `false`,
                desc: 'Flag to stop the infinite scroll from triggering further load more actions.',
            },
            {
                propName: 'onLoadMore',
                type: `<code>() => Promise<void></code>`,
                default: `undefined`,
                desc: 'The function to be called when the user reaches the bottom of the container.',
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
                        propName: 'isLoading',
                        type: `<code>boolean</code>`,
                        default: '',
                        desc: 'Indicates whether the hook is currently loading more content.',
                    },
                    {
                        propName: 'containerRef',
                        type: `<code>LegacyRef<HTMLElement></code>`,
                        default: '',
                        desc: 'A ref callback function to be assigned to the container that requires infinite scrolling.',
                    },
                ],
            },
        ]}
    />
)

const UseInfiniteScrollDoc = () => {
    return (
        <DemoLayout
            hideApiTitle
            hideFooter
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            mdPrefixPath="docs/SharedComponentsDoc/components"
            extra={extra}
            api={demoApi}
            keyText="param"
        />
    )
}

export default UseInfiniteScrollDoc
