import { useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import FormCustomFormatInput from '@/components/shared/CustomFormatInput'
import FormPatternInput from '@/components/shared/PatternInput'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

type CreditCard = {
    cardHolderName: string
    ccNumber?: string
    cardExpiry?: string
    code?: string
}

type FormSchema = CreditCard

type CreditCardDialogProps = {
    title: string
    dialogOpen: boolean
    onDialogClose: () => void
    defaultValues: CreditCard
    onSubmit: (value: FormSchema) => void
}

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

const validationSchema: ZodType<FormSchema> = z.object({
    cardHolderName: z.string().min(1, { message: 'نام دارنده کارت الزامی است' }),
    ccNumber: z
        .string()
        .min(1, 'شماره کارت اعتباری الزامی است')
        .refine(
            (value) =>
                /^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/.test(
                    value,
                ),
            'شماره کارت نامعتبر است',
        ),
    cardExpiry: z
        .string()
        .min(1, { message: 'تاریخ انقضا الزامی است' })
        .refine(
            (value) => /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/.test(value),
            'تاریخ نامعتبر است',
        ),
    code: z
        .string()
        .min(1, { message: 'کد الزامی است' })
        .refine((value) => /^[0-9]{3}$/.test(value), 'کد CVV نامعتبر است'),
})


const CreditCardDialog = ({
    title,
    dialogOpen,
    onDialogClose,
    defaultValues,
    onSubmit,
}: CreditCardDialogProps) => {
    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
    } = useForm<FormSchema>({
        defaultValues,
        resolver: zodResolver(validationSchema),
    })

    useEffect(() => {
        reset(defaultValues)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValues])

    return (
        <Dialog
            isOpen={dialogOpen}
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
        >
            <h4>{title}</h4>
            <Form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                <FormItem
                    label="نام کاربر"
                    invalid={Boolean(errors.cardHolderName)}
                    errorMessage={errors.cardHolderName?.message}
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
                    invalid={Boolean(errors.ccNumber)}
                    errorMessage={errors.ccNumber?.message}
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
                        invalid={Boolean(errors.cardExpiry)}
                        errorMessage={errors.cardExpiry?.message}
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
                        invalid={Boolean(errors.code)}
                        errorMessage={errors.code?.message}
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
                <Button
                    block
                    variant="solid"
                    type="submit"
                    loading={isSubmitting}
                >
                    بروزرسانی
                </Button>
            </Form>
        </Dialog>
    )
}

export default CreditCardDialog
