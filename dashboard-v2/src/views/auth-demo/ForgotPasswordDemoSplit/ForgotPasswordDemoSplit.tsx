import { ForgotPasswordBase } from '@/views/auth/ForgotPassword'
import Split from '@/components/layouts/AuthLayout/Split'

const ForgotPasswordDemoSplit = () => {
    return (
        <Split>
            <ForgotPasswordBase signInUrl="/auth/sign-in-side" />
        </Split>
    )
}

export default ForgotPasswordDemoSplit
