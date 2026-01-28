import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

type FormSchema = {
    password: string
    confirmPassword: string
}

const validationSchema: ZodType<FormSchema> = z
    .object({
        password: z.string().min(1, { message: 'رمز عبور الزامی است' }),
        confirmPassword: z
            .string()
            .min(1, { message: 'تایید رمز عبور الزامی است' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'رمز عبور مطابقت ندارد',
        path: ['confirmPassword'],
    })


const DependentValidation = () => {
    const [submitting, setSubmitting] = useState(false)

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm<FormSchema>({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: FormSchema) => {
        setSubmitting(true)
        setTimeout(() => {
            window.alert(JSON.stringify(values, null, 2))
            setSubmitting(false)
            reset()
        }, 400)
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormItem
                label="رمز عبور"
                invalid={Boolean(errors.password)}
                errorMessage={errors.password?.message}
            >
                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="password"
                            autoComplete="off"
                            placeholder="رمز عبور"
                            {...field}
                        />
                    )}
                />
            </FormItem>
            <FormItem
                label="تایید رمز عبور"
                invalid={Boolean(errors.confirmPassword)}
                errorMessage={errors.confirmPassword?.message}
            >
                <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="password"
                            autoComplete="off"
                            placeholder="تایید رمز عبور"
                            {...field}
                        />
                    )}
                />
            </FormItem>
            <FormItem>
                <div className="flex gap-2">
                    <Button type="reset" onClick={() => reset()}>
                        بازنشانی
                    </Button>
                    <Button variant="solid" type="submit" loading={submitting}>
                        ارسال
                    </Button>
                </div>
            </FormItem>
        </Form>

    )
}

export default DependentValidation
