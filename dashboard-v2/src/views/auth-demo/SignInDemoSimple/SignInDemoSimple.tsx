import { SignInBase } from '@/views/auth/SignIn'
import Simple from '@/components/layouts/AuthLayout/Simple'

const SignInDemoSimple = () => {
    return (
        <Simple>
            <SignInBase
                disableSubmit={true}
                signUpUrl="/auth/sign-up-simple"
                forgetPasswordUrl="/auth/forgot-password-simple"
            />
        </Simple>
    )
}

export default SignInDemoSimple
