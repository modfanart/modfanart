import DemoComponentApi from '@/components/docs/DemoComponentApi'
import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'UseAuthDoc/'

const demoHeader = {
    title: 'useAuth',
    desc: 'A hook that enables any component to get the current auth & users state & methods.',
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
                        propName: 'authenticated',
                        type: `<code>boolean</code>`,
                        default: `-`,
                        desc: 'State of current authencation',
                    },
                    {
                        propName: 'oAuthSignIn',
                        type: `<code>(callback: (payload: {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}) => void) => void</code>`,
                        default: `-`,
                        desc: 'Callback fuction after a single sign on',
                    },
                    {
                        propName: 'signIn',
                        type: `<code>({email: string, password: string}) => ({status: 'success' | 'failed', message: string})</code>`,
                        default: `-`,
                        desc: 'Sign in handler, return status & message as result',
                    },
                    {
                        propName: 'signOut',
                        type: `<code>() => void</code>`,
                        default: `-`,
                        desc: 'Sign out handler',
                    },
                    {
                        propName: 'signUp',
                        type: `<code>({userName: string, email: string, password: string}) => ({status: 'success' | 'failed', message: string})</code>`,
                        default: `-`,
                        desc: 'Sign up handler, return status & message as result',
                    },
                    {
                        propName: 'user',
                        type: `<code>{
    userId?: string | null
    avatar?: string | null
    userName?: string | null
    email?: string | null
    authority?: string[]
}</code>`,
                        default: `-`,
                        desc: 'Signed in user information',
                    },
                ],
            },
        ]}
    />
)

const UseAuthDoc = () => {
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

export default UseAuthDoc
