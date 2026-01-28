import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

type FormSchema = {
    email: string
    userName: string
    password: string
    rememberMe: boolean
}
const validationSchema: ZodType<FormSchema> = z.object({
    email: z
        .string()
        .min(1, { message: 'ایمیل الزامی است' })
        .email({ message: 'ایمیل نامعتبر' }),
    userName: z.string().min(3, 'خیلی کوتاه است!').max(12, 'خیلی طولانی است!'),
    password: z
        .string()
        .min(1, { message: 'رمز عبور الزامی است' })
        .min(8, { message: 'خیلی کوتاه است!' })
        .refine(
            (value) => /^[A-Za-z0-9_-]*$/.test(value),
            'فقط حروف و اعداد مجاز هستند',
        ),
    rememberMe: z.boolean(),
})


const Basic = () => {
    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<FormSchema>({
        defaultValues: {
            email: '',
            userName: '',
            password: '',
            rememberMe: false,
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: FormSchema) => {
        window.alert(JSON.stringify(values))
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormItem
                label="ایمیل"
                invalid={Boolean(errors.email)}
                errorMessage={errors.email?.message}
            >
                <Controller
                    name="email"
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
            <FormItem
                label="نام کاربری"
                invalid={Boolean(errors.userName)}
                errorMessage={errors.userName?.message}
            >
                <Controller
                    name="userName"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="text"
                            autoComplete="off"
                            placeholder="نام کاربری"
                            {...field}
                        />
                    )}
                />
            </FormItem>
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
            <FormItem>
                <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                        <Checkbox {...field}>مرا به خاطر بسپار</Checkbox>
                    )}
                />
            </FormItem>
            <FormItem>
                <Button
                    type="reset"
                    className="ltr:mr-2 rtl:ml-2"
                    onClick={() => reset()}
                >
                    بازنشانی
                </Button>
                <Button variant="solid" type="submit">
                    ارسال
                </Button>
            </FormItem>
        </Form>
    )
}

export default Basic
