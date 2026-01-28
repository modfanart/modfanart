import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import { NumericFormat } from 'react-number-format'
import type { PaymentSummary } from '../types'

type OrderDetailPaymentProps = {
    paymentSummary: PaymentSummary
    paymentStatus: number
}

const paymentStatusColor: Record<
    number,
    {
        label: string
        bgClass: string
        textClass: string
    }
> = {
    0: {
        label: 'پرداخت شده',
        bgClass: 'bg-success-subtle', // کلاس پس‌زمینه برای وضعیت موفق
        textClass: 'text-success', // کلاس رنگ متن برای وضعیت موفق
    },
    1: {
        label: 'در انتظار',
        bgClass: 'bg-warning-subtle', // کلاس پس‌زمینه برای وضعیت در انتظار
        textClass: 'text-warning', // کلاس رنگ متن برای وضعیت در انتظار
    },
    2: {
        label: 'ناموفق',
        bgClass: 'bg-error-subtle', // کلاس پس‌زمینه برای وضعیت ناموفق
        textClass: 'text-error' // کلاس رنگ متن برای وضعیت ناموفق
    },
}


const OrderDetailPayment = ({
    paymentSummary,
    paymentStatus,
}: OrderDetailPaymentProps) => {
    return (
        <Card>
            <div className="flex items-center gap-2 mb-8">
                <h4>پرداخت</h4>
                <Tag className={paymentStatusColor[paymentStatus || 0].bgClass}>
                    <span
                        className={`capitalize font-semibold ${paymentStatusColor[paymentStatus || 0].textClass}`}
                    >
                        {paymentStatusColor[paymentStatus || 0].label}
                    </span>
                </Tag>
            </div>
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <span className="font-semibold">مجموع موقت</span>
                    <NumericFormat
                        fixedDecimalScale
                        prefix="$"
                        displayType="text"
                        value={paymentSummary.subTotal}
                        decimalScale={2}
                        thousandSeparator={true}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-semibold">هزینه ارسال</span>
                    <NumericFormat
                        fixedDecimalScale
                        prefix="$"
                        displayType="text"
                        value={paymentSummary.deliveryFees}
                        decimalScale={2}
                        thousandSeparator={true}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-semibold">مالیات</span>
                    <NumericFormat
                        fixedDecimalScale
                        prefix="$"
                        displayType="text"
                        value={paymentSummary.tax}
                        decimalScale={2}
                        thousandSeparator={true}
                    />
                </div>
                <div className="flex items-center justify-between heading-text font-bold">
                    <span>مجموع کل</span>
                    <NumericFormat
                        fixedDecimalScale
                        prefix="$"
                        displayType="text"
                        value={paymentSummary.total}
                        decimalScale={2}
                        thousandSeparator={true}
                    />
                </div>
                <hr />
                <div className="flex items-center justify-between">
                    <span className="font-semibold">پرداخت مشتری</span>
                    <h5 className="font-bold">
                        <NumericFormat
                            fixedDecimalScale
                            prefix="$"
                            displayType="text"
                            value={paymentSummary.customerPayment}
                            decimalScale={2}
                            thousandSeparator={true}
                        />
                    </h5>
                </div>
            </div>
        </Card>
    )
}

export default OrderDetailPayment
