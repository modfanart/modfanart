import { useState } from 'react'
import Steps from '@/components/ui/Steps'

const Clickable = () => {
    const [step, setStep] = useState(1)

    const onStepChange = (index: number) => {
        setStep(index)
    }

    return (
        <div>
            <Steps current={step} onChange={(index) => onStepChange(index)}>
                <Steps.Item title="ورود" />
                <Steps.Item title="سفارش ثبت شد" />
                <Steps.Item title="در حال بررسی" />
                <Steps.Item title="تأیید شد" />
            </Steps>
        </div>
    )
}

export default Clickable
