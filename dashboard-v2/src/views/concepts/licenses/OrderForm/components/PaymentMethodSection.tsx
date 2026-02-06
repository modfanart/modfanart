import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import { FormItem } from '@/components/ui/Form'
import FormCustomFormatInput from '@/components/shared/CustomFormatInput'
import FormPatternInput from '@/components/shared/PatternInput'
import { Controller } from 'react-hook-form'
import { TbCreditCard, TbBrandPaypal, TbBuildingBank } from 'react-icons/tb'
import { components } from 'react-select'
import type {
    FormSectionBaseProps,
    GetPaymentMethodFields,
    PaymentType,
} from '../types'
import type { ControlProps, OptionProps } from 'react-select'
import type { FieldErrors } from 'react-hook-form'
import type { ReactNode } from 'react'

type CreditCardFieldError = FieldErrors<
    GetPaymentMethodFields<'creditOrDebitCard'>
>
type PaypalFieldError = FieldErrors<GetPaymentMethodFields<'paypal'>>
type BankTransferFieldError = FieldErrors<
    GetPaymentMethodFields<'bankTransfer'>
>

type PaymentMethodSectionProps = FormSectionBaseProps & {
    selectedPaymentMethod: string
}

type PaymentMethodOption = {
    label: string
    value: PaymentType
    icon: ReactNode
}

const paymentMethodOptions: PaymentMethodOption[] = [
    {
        label: 'Credit/Debit card',
        value: 'creditOrDebitCard',
        icon: <TbCreditCard />,
    },
    { label: 'Paypal', value: 'paypal', icon: <TbBrandPaypal /> },
    { label: 'Bank transfer', value: 'bankTransfer', icon: <TbBuildingBank /> },
]

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

const { Control } = components

const CustomSelectOption = (props: OptionProps<PaymentMethodOption>) => {
    return (
        <DefaultOption<PaymentMethodOption>
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    <span className="text-xl">{data.icon}</span>
                    <span>{label}</span>
                </span>
            )}
        />
    )
}

const CustomControl = ({
    children,
    ...props
}: ControlProps<PaymentMethodOption>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <span className="text-xl ltr:ml-4 rtl:mr-4 text-primary">
                    {selected.icon}
                </span>
            )}
            {children}
        </Control>
    )
}

const PaymentMethodSection = ({
    control,
    errors,
    selectedPaymentMethod,
}: PaymentMethodSectionProps) => {
    return (
        <Card id="payment">
        <h4 className="mb-6">پرداخت</h4>
        <FormItem
            label="روش پرداخت"
            invalid={Boolean(errors.paymentMethod)}
            errorMessage={errors.paymentMethod?.message}
        >
            <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                    <Select<PaymentMethodOption>
                        options={paymentMethodOptions}
                        {...field}
                        components={{
                            Option: CustomSelectOption,
                            Control: CustomControl,
                        }}
                        placeholder=""
                        value={paymentMethodOptions.filter(
                            (option) => option.value === field.value,
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                    />
                )}
            />
        </FormItem>
        {selectedPaymentMethod === 'creditOrDebitCard' && (
            <>
                <FormItem
                    label="نام کاربر"
                    invalid={Boolean(
                        (errors as CreditCardFieldError).cardHolderName,
                    )}
                    errorMessage={
                        (errors as CreditCardFieldError).cardHolderName?.message
                    }
                >
                    <Controller
                        name="cardHolderName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="نام دارنده کارت"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="شماره کارت اعتباری"
                    invalid={Boolean(
                        (errors as CreditCardFieldError).ccNumber,
                    )}
                    errorMessage={
                        (errors as CreditCardFieldError).ccNumber?.message
                    }
                >
                    <Controller
                        name="ccNumber"
                        control={control}
                        render={({ field }) => (
                            <FormPatternInput
                                placeholder="•••• •••• •••• ••••"
                                format="#### #### #### ####"
                                value={field.value}
                                onValueChange={(e) => {
                                    field.onChange(e.value)
                                }}
                            />
                        )}
                    />
                </FormItem>
                <div className="grid grid-cols-2 gap-4">
                    <FormItem
                        label="تاریخ انقضا"
                        invalid={Boolean(
                            (errors as CreditCardFieldError).cardExpiry,
                        )}
                        errorMessage={
                            (errors as CreditCardFieldError).cardExpiry?.message
                        }
                    >
                        <Controller
                            name="cardExpiry"
                            control={control}
                            render={({ field }) => (
                                <FormCustomFormatInput
                                    placeholder="••/••"
                                    format={cardExpiryFormat}
                                    value={field.value}
                                    onValueChange={(e) => {
                                        field.onChange(e.value)
                                    }}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="کد CVV"
                        invalid={Boolean(
                            (errors as CreditCardFieldError).code,
                        )}
                        errorMessage={
                            (errors as CreditCardFieldError).code?.message
                        }
                    >
                        <Controller
                            name="code"
                            control={control}
                            render={({ field }) => (
                                <FormPatternInput
                                    placeholder="•••"
                                    format="###"
                                    value={field.value}
                                    onValueChange={(e) => {
                                        field.onChange(e.value)
                                    }}
                                />
                            )}
                        />
                    </FormItem>
                </div>
            </>
        )}
        {selectedPaymentMethod === 'paypal' && (
            <>
                <FormItem
                    label="ایمیل پی‌پال"
                    invalid={Boolean(
                        (errors as PaypalFieldError).paypalEmail,
                    )}
                    errorMessage={
                        (errors as PaypalFieldError).paypalEmail?.message
                    }
                >
                    <Controller
                        name="paypalEmail"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                autoComplete="off"
                                placeholder="ایمیل"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </>
        )}
        {selectedPaymentMethod === 'bankTransfer' && (
            <>
                <FormItem
                    label="نام بانک"
                    invalid={Boolean(
                        (errors as BankTransferFieldError).bankName,
                    )}
                    errorMessage={
                        (errors as BankTransferFieldError).bankName?.message
                    }
                >
                    <Controller
                        name="bankName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="نام بانک"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="شماره حساب"
                    invalid={Boolean(
                        (errors as BankTransferFieldError).accountNumber,
                    )}
                    errorMessage={
                        (errors as BankTransferFieldError).accountNumber?.message
                    }
                >
                    <Controller
                        name="accountNumber"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="شماره حساب"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="نام صاحب حساب"
                    invalid={Boolean(
                        (errors as BankTransferFieldError).accountHolderName,
                    )}
                    errorMessage={
                        (errors as BankTransferFieldError).accountHolderName
                            ?.message
                    }
                >
                    <Controller
                        name="accountHolderName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="نام صاحب حساب"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="grid grid-cols-2 gap-4">
                    <FormItem
                        label="شماره IBAN"
                        invalid={Boolean(
                            (errors as BankTransferFieldError).IBAN,
                        )}
                        errorMessage={
                            (errors as BankTransferFieldError).IBAN?.message
                        }
                    >
                        <Controller
                            name="IBAN"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="IBAN"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="شماره مرجع"
                        invalid={Boolean(
                            (errors as BankTransferFieldError).referenceNumber,
                        )}
                        errorMessage={
                            (errors as BankTransferFieldError).referenceNumber
                                ?.message
                        }
                    >
                        <Controller
                            name="referenceNumber"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="شماره مرجع"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>
            </>
        )}
    </Card>
    
    )
}

export default PaymentMethodSection
