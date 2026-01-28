import { ResetPasswordBase } from '@/views/auth/ResetPassword'
import Simple from '@/components/layouts/AuthLayout/Simple'

const ResetPasswordDemoSimple = () => {
    return (
        <Simple>
            <ResetPasswordBase signInUrl="/auth/sign-in-simple" />
        </Simple>
    )
}

export default ResetPasswordDemoSimple
