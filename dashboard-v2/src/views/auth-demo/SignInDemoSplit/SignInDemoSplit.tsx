import { SignInBase } from '@/views/auth/SignIn'
import Split from '@/components/layouts/AuthLayout/Split'

const SignInDemoSplit = () => {
    return (
        <Split>
            <SignInBase
                disableSubmit={true}
                signUpUrl="/auth/sign-up-split"
                forgetPasswordUrl="/auth/forgot-password-split"
            />
        </Split>
    )
}

export default SignInDemoSplit
