import Steps from '@/components/ui/Steps'

const Vertical = () => {
    return (
        <div>
            <Steps vertical current={1}>
                <Steps.Item title="ورود" />
                <Steps.Item title="سفارش ثبت شد" />
                <Steps.Item title="در حال بررسی" />
                <Steps.Item title="تأیید شد" />
            </Steps>
        </div>
    )
}

export default Vertical
