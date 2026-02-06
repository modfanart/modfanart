import { useEffect } from 'react'
import { Form } from '@/components/ui/Form'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import OverviewSection from './OverviewSection'
import AddressSection from './AddressSection'
import TagsSection from './TagsSection'
import ProfileImageSection from './ProfileImageSection'
import AccountSection from './AccountSection'
import isEmpty from 'lodash/isEmpty'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { CustomerFormSchema } from './types'

type CustomerFormProps = {
    onFormSubmit: (values: CustomerFormSchema) => void
    defaultValues?: CustomerFormSchema
    newCustomer?: boolean
} & CommonProps

const validationSchema: ZodType<CustomerFormSchema> = z.object({
    firstName: z.string().min(1, { message: 'نام لازم است' }),
    lastName: z.string().min(1, { message: 'نام خانوادگی لازم است' }),
    email: z
        .string()
        .min(1, { message: 'ایمیل لازم است' })
        .email({ message: 'ایمیل نامعتبر است' }),
    dialCode: z.string().min(1, { message: 'لطفاً کد کشور خود را انتخاب کنید' }),
    phoneNumber: z
        .string()
        .min(1, { message: 'لطفاً شماره موبایل خود را وارد کنید' }),
    country: z.string().min(1, { message: 'لطفاً کشور را انتخاب کنید' }),
    address: z.string().min(1, { message: 'آدرس لازم است' }),
    postcode: z.string().min(1, { message: 'کد پستی لازم است' }),
    city: z.string().min(1, { message: 'شهر لازم است' }),
    img: z.string(),
    tags: z.array(z.object({ value: z.string(), label: z.string() })),
})


const CustomerForm = (props: CustomerFormProps) => {
    const {
        onFormSubmit,
        defaultValues = {},
        newCustomer = false,
        children,
    } = props

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<CustomerFormSchema>({
        defaultValues: {
            ...{
                banAccount: false,
                accountVerified: true,
            },
            ...defaultValues,
        },
        resolver: zodResolver(validationSchema),
    })

    useEffect(() => {
        if (!isEmpty(defaultValues)) {
            reset(defaultValues)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(defaultValues)])

    const onSubmit = (values: CustomerFormSchema) => {
        onFormSubmit?.(values)
    }

    return (
        <Form
            className="flex w-full h-full"
            containerClassName="flex flex-col w-full justify-between"
            onSubmit={handleSubmit(onSubmit)}
        >
            <Container>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="gap-4 flex flex-col flex-auto">
                        <OverviewSection control={control} errors={errors} />
                        <AddressSection control={control} errors={errors} />
                    </div>
                    <div className="md:w-[370px] gap-4 flex flex-col">
                        <ProfileImageSection
                            control={control}
                            errors={errors}
                        />
                        <TagsSection control={control} errors={errors} />
                        {!newCustomer && (
                            <AccountSection control={control} errors={errors} />
                        )}
                    </div>
                </div>
            </Container>
            <BottomStickyBar>{children}</BottomStickyBar>
        </Form>
    )
}

export default CustomerForm
