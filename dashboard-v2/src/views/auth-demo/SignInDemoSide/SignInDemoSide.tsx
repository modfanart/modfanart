import { SignInBase } from '@/views/auth/SignIn'
import Side from '@/components/layouts/AuthLayout/Side'

const SignInDemoSplit = () => {
    return (
        <Side>
            <SignInBase
                disableSubmit={true}
                signUpUrl="/auth/sign-up-side"
                forgetPasswordUrl="/auth/forgot-password-side"
            />
        </Side>
    )
}

export default SignInDemoSplit
