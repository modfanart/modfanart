import { SignUpBase } from '@/views/auth/SignUp'
import Split from '@/components/layouts/AuthLayout/Split'

const SignUpDemoSplit = () => {
    return (
        <Split>
            <SignUpBase disableSubmit={true} signInUrl="/auth/sign-in-split" />
        </Split>
    )
}

export default SignUpDemoSplit
