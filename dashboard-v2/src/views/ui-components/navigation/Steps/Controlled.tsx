import { useState } from 'react'
import Steps from '@/components/ui/Steps'
import Button from '@/components/ui/Button'

const Controlled = () => {
    const [step, setStep] = useState(0)

    const onChange = (nextStep: number) => {
        if (nextStep < 0) {
            setStep(0)
        } else if (nextStep > 3) {
            setStep(3)
        } else {
            setStep(nextStep)
        }
    }

    const onNext = () => onChange(step + 1)

    const onPrevious = () => onChange(step - 1)

    return (
        <div>
            <Steps current={step}>
                <Steps.Item title="ورود" />
                <Steps.Item title="سفارش ثبت شده" />
                <Steps.Item title="در حال بررسی" />
                <Steps.Item title="تأیید شده" />
            </Steps>
            <div className="mt-6 h-40 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center">
                <h6>مرحله {`${step + 1}`} محتوا</h6>
            </div>
            <div className="mt-4 text-right">
                <Button
                    className="mx-2"
                    disabled={step === 0}
                    onClick={onPrevious}
                >
                    قبلی
                </Button>
                <Button disabled={step === 3} variant="solid" onClick={onNext}>
                    {step === 3 ? 'تکمیل شده' : 'بعدی'}
                </Button>
            </div>
        </div>
    )
}

export default Controlled
