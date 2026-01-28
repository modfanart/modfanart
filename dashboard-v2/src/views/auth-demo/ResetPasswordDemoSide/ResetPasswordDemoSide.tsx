import { ResetPasswordBase } from '@/views/auth/ResetPassword'
import Side from '@/components/layouts/AuthLayout/Side'

const ResetPasswordDemoSide = () => {
    return (
        <Side>
            <ResetPasswordBase signInUrl="/auth/sign-in-side" />
        </Side>
    )
}

export default ResetPasswordDemoSide
