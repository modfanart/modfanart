import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import { useState } from 'react';
import useAuth from '@/auth/useAuth'

const Component = () => {

    const { authenticated, user, signIn, signOut, signUp, oAuthSignIn } = useAuth()
    const [ error, setError ] = useState<string | null>(null)

    const handleSignIn = async ({ email, password }: { email:string, password: string }) => {
    
        const result = await signIn({ email, password })

        if (result.status === 'failed') {
            setError(result.message)
        }
    }

    const handleSignUp = async ({ userName, email, password }: { userName: string, email:string, password: string }) => {
    
        const result = await signUp({ userName, email, password })

        if (result.status === 'failed') {
            setError(result.message)
        }
    }

    const handleGoogleSignIn = async () => {
        oAuthSignIn(async ({redirect, onSignIn}) => {
            try {
                const resp = await apiGoogleOauthSignIn()
                if (resp) {
                    const { token, user } = resp
                    onSignIn({accessToken: token}, user)
                    redirect()
                }
            } catch (error) {
                setError?.((error as string)?.toString() || '')
            }
        })
    }

    const handleSignout = () => {
        signOut()
    }

    return (
        <>
            {authenticated && (
                <div>
                    <h6>Welcome, {user?.userName}</h6>
                    <div>{user?.email}</div>
                </div>
            )}
        </>
    )
}
`}</SyntaxHighlighter>
    )
}

export default Example
