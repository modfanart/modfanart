import Steps from '@/components/ui/Steps'

const Description = () => {
    return (
        <div className="mb-6">
            <Steps vertical current={2}>
                <Steps.Item title="ورود" description="وارد حساب کاربری خود شوید" />
                <Steps.Item
                    title="ثبت سفارش"
                    description="فرآیند ثبت سفارش را آغاز کنید"
                />
                <Steps.Item
                    title="در حال بررسی"
                    description="ما سفارش را بررسی خواهیم کرد"
                />
                <Steps.Item title="تأیید شده" description="سفارش تأیید شده است" />
            </Steps>
        </div>
    )
}

export default Description
