import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useForm, Controller } from 'react-hook-form'

type FormSchema = {
    userName: string
    email: string
}

const FieldValidation = () => {
    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<FormSchema>({
        defaultValues: {
            userName: '',
            email: '',
        },
    })

    return (
        <Form
        onSubmit={handleSubmit((values) => {
            window.alert(JSON.stringify(values))
        })}
    >
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
                rules={{
                    validate: {
                        required: (value) => {
                            if (!value) {
                                return 'الزامی است'
                            }
                            if (value === 'admin') {
                                return 'سعی خوبی بود!'
                            }
                            return
                        },
                    },
                }}
            />
        </FormItem>
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
                        autoComplete="off"
                        placeholder="ایمیل"
                        {...field}
                    />
                )}
                rules={{
                    validate: {
                        required: (value) => {
                            let error
                            if (!value) {
                                error = 'الزامی است'
                            } else if (
                                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
                                    value,
                                )
                            ) {
                                error = 'آدرس ایمیل نامعتبر است'
                            }
                            return error
                        },
                    },
                }}
            />
        </FormItem>
        <FormItem>
            <Button type="submit" variant="solid">
                ارسال
            </Button>
        </FormItem>
    </Form>
    
    )
}

export default FieldValidation
