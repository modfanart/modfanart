import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Segment from '@/components/ui/Segment'
import classNames from '@/utils/classNames'
import sleep from '@/utils/sleep'
import { usePricingStore } from '../store/pricingStore'
import { TbCheck, TbCreditCard, TbMail } from 'react-icons/tb'
import {
    NumericFormat,
    PatternFormat,
    NumberFormatBase,
} from 'react-number-format'
import { useNavigate } from 'react-router-dom'
import { PaymentCycle } from '../types'

function limit(val: string, max: string) {
    if (val.length === 1 && val[0] > max[0]) {
        val = '0' + val
    }

    if (val.length === 2) {
        if (Number(val) === 0) {
            val = '01'
        } else if (val > max) {
            val = max
        }
    }

    return val
}

function cardExpiryFormat(val: string) {
    const month = limit(val.substring(0, 2), '12')
    const date = limit(val.substring(2, 4), '31')

    return month + (date.length ? '/' + date : '')
}

const PaymentDialog = () => {
    const [loading, setLoading] = useState(false)
    const [paymentSuccessful, setPaymentSuccessful] = useState(false)

    const navigate = useNavigate()

    const { paymentDialog, setPaymentDialog, selectedPlan, setSelectedPlan } =
        usePricingStore()

    const handleDialogClose = async () => {
        setPaymentDialog(false)
        await sleep(200)
        setSelectedPlan({})
        setPaymentSuccessful(false)
    }

    const handlePaymentChange = (paymentCycle: PaymentCycle) => {
        setSelectedPlan({
            ...selectedPlan,
            paymentCycle,
        })
    }

    const handlePay = async () => {
        setLoading(true)
        await sleep(500)
        setLoading(false)
        setPaymentSuccessful(true)
    }

    const handleManageSubscription = async () => {
        navigate('/concepts/account/settings?view=billing')
        await handleDialogClose()
    }

    return (
        <Dialog
            isOpen={paymentDialog}
            closable={!paymentSuccessful}
            onClose={handleDialogClose}
            onRequestClose={handleDialogClose}
        >
            {paymentSuccessful ? (
                <>
                    <div className="text-center mt-6 mb-2">
                        <div className="inline-flex rounded-full p-5 bg-success">
                            <TbCheck className="text-5xl text-white" />
                        </div>
                        <div className="mt-6">
                            <h4>از خرید شما متشکریم!</h4>
                            <p className="text-base max-w-[400px] mx-auto mt-4 leading-relaxed">
                                سفارش شما دریافت شده و در حال پردازش است. به زودی ایمیلی با جزئیات سفارش خود دریافت خواهید کرد.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-8">
                            <Button block onClick={handleManageSubscription}>
                                مدیریت اشتراک
                            </Button>
                            <Button
                                block
                                variant="solid"
                                onClick={handleDialogClose}
                            >
                                بستن
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h4>{selectedPlan.planName} طرح</h4>
                    <div className="mt-6">
                        <Segment
                            defaultValue={selectedPlan.paymentCycle}
                            className="gap-4 flex bg-transparent"
                            onChange={(value) =>
                                handlePaymentChange(value as PaymentCycle)
                            }
                        >
                            {Object.entries(selectedPlan.price || {}).map(
                                ([key, value]) => (
                                    <Segment.Item key={key} value={key}>
                                        {({ active, onSegmentItemClick }) => {
                                            return (
                                                <div
                                                    className={classNames(
                                                        'flex justify-between border rounded-xl border-gray-300 py-5 px-4 select-none ring-1 w-1/2',
                                                        active
                                                            ? 'ring-primary border-primary '
                                                            : 'ring-transparent bg-gray-100',
                                                    )}
                                                    role="button"
                                                    onClick={onSegmentItemClick}
                                                >
                                                    <div>
                                                        <div className="heading-text mb-0.5">
                                                            پرداخت{' '}
                                                            {key === 'monthly'
                                                                ? 'ماهانه'
                                                                : 'سالانه'}
                                                        </div>
                                                        <span className="text-lg font-bold heading-text flex gap-0.5">
                                                            <NumericFormat
                                                                displayType="text"
                                                                value={value}
                                                                prefix={'$'}
                                                                thousandSeparator={
                                                                    true
                                                                }
                                                            />
                                                            <span>{'/'}</span>
                                                            <span>
                                                                {key ===
                                                                    'monthly'
                                                                    ? 'ماه'
                                                                    : 'سال'}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    {active && (
                                                        <TbCheck className="text-primary text-xl" />
                                                    )}
                                                </div>
                                            )
                                        }}
                                    </Segment.Item>
                                ),
                            )}
                        </Segment>
                    </div>
                    <div className="mt-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                            <div className="w-full">
                                <span>ایمیل صورتحساب</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <TbMail className="text-2xl" />
                                    <input
                                        className="focus:outline-none heading-text flex-1"
                                        placeholder="ایمیل را وارد کنید"
                                        type="email"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <div className="w-full">
                                <span>کارت اعتباری</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1">
                                        <TbCreditCard className="text-2xl" />
                                    </div>
                                    <PatternFormat
                                        className="focus:outline-none heading-text w-full"
                                        placeholder="شماره کارت اعتباری"
                                        format="#### #### #### ####"
                                    />
                                    <NumberFormatBase
                                        className="focus:outline-none heading-text max-w-12 sm:max-w-28"
                                        placeholder="MM/YY"
                                        format={cardExpiryFormat}
                                    />
                                    <PatternFormat
                                        className="focus:outline-none heading-text max-w-12 sm:max-w-28"
                                        placeholder="CVC"
                                        format="###"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col items-end">
                        <h4>
                            <span>صورتحساب حالا: </span>
                            <span>
                                <NumericFormat
                                    displayType="text"
                                    value={
                                        selectedPlan.price?.[
                                        selectedPlan.paymentCycle as PaymentCycle
                                        ]
                                    }
                                    prefix={'$'}
                                    thousandSeparator={true}
                                />
                            </span>
                        </h4>
                        <div className="max-w-[350px] ltr:text-right rtl:text-left leading-none mt-2 opacity-80">
                            <small>
                                با کلیک بر روی "پرداخت"، موافقت می‌کنید که هر ماه مبلغ $399 از شما کسر شود، شما می‌توانید هر زمان این اشتراک را لغو کنید.
                            </small>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Button
                            block
                            variant="solid"
                            loading={loading}
                            onClick={handlePay}
                        >
                            پرداخت
                        </Button>
                    </div>
                </>
            )}
        </Dialog>

    )
}

export default PaymentDialog
