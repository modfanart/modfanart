import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'CookiesStorageDoc'

const demoHeader = {
    title: 'cookiesStorage',
    desc: 'a utility function provides an interface for storing, retrieving, and removing items from cookies.',
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
        component: 'cookiesStorage',
        api: [
            {
                propName: 'getItem',
                type: `<code>(name: string) => string | null</code>`,
                default: '-',
                desc: 'Retrieves the value of a cookie or returns null if the cookie does not exist.',
            },
            {
                propName: 'setItem',
                type: `<code>(name: string, value: string, expires?: number | Date) => void</code>`,
                default: '-',
                desc: 'Sets a cookie with the provided name, value, and expiration date.',
            },
            {
                propName: 'removeItem',
                type: `<code>(name: string) => void</code>`,
                default: '-',
                desc: 'Removes a cookie by its name.',
            },
        ],
    },
]

const CookiesStorageDoc = () => {
    return (
        <DemoLayout
            hideApiTitle
            hideFooter
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            api={demoApi}
            mdPrefixPath="utils"
        />
    )
}

export default CookiesStorageDoc
