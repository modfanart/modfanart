import { ForgotPasswordBase } from '@/views/auth/ForgotPassword'
import Simple from '@/components/layouts/AuthLayout/Simple'

const ForgotPasswordDemoSimple = () => {
    return (
        <Simple>
            <ForgotPasswordBase signInUrl="/auth/sign-in-side" />
        </Simple>
    )
}

export default ForgotPasswordDemoSimple
