import { ForgotPasswordBase } from '@/views/auth/ForgotPassword'
import Side from '@/components/layouts/AuthLayout/Side'

const ForgotPasswordDemoSide = () => {
    return (
        <Side>
            <ForgotPasswordBase signInUrl="/auth/sign-in-side" />
        </Side>
    )
}

export default ForgotPasswordDemoSide
