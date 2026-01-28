import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ActionLink from '@/components/shared/ActionLink'
import ResetPasswordForm from './components/ResetPasswordForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useNavigate } from 'react-router-dom'

type ResetPasswordProps = {
    signInUrl?: string
}

export const ResetPasswordBase = ({
    signInUrl = '/sign-in',
}: ResetPasswordProps) => {
    const [resetComplete, setResetComplete] = useState(false)

    const [message, setMessage] = useTimeOutMessage()

    const navigate = useNavigate()

    const handleContinue = () => {
        navigate(signInUrl)
    }

    return (
        <div>
            <div className="mb-6">
                {resetComplete ? (
                    <>
                        <h3 className="mb-1">تنظیم مجدد انجام شد</h3>
                        <p className="font-semibold heading-text">
                            رمز عبور شما با موفقیت تنظیم مجدد شد
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="mb-1">رمز عبور جدید را وارد کنید</h3>
                        <p className="font-semibold heading-text">
                            رمز عبور جدید شما باید با رمز عبور قبلی متفاوت باشد
                        </p>
                    </>
                )}
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <ResetPasswordForm
                resetComplete={resetComplete}
                setMessage={setMessage}
                setResetComplete={setResetComplete}
            >
                <Button
                    block
                    variant="solid"
                    type="button"
                    onClick={handleContinue}
                >
                    ادامه
                </Button>
            </ResetPasswordForm>
            <div className="mt-4 text-center">
                <span>بازگشت به </span>
                <ActionLink
                    to={signInUrl}
                    className="heading-text font-bold"
                    themeColor={false}
                >
                    ورود
                </ActionLink>
            </div>
        </div>
    )
}

const ResetPassword = () => {
    return <ResetPasswordBase />
}

export default ResetPassword
