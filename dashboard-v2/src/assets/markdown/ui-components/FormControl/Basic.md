```jsx

import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

type FormSchema = {
    email: string
    userName: string,
    password: string,
    rememberMe: boolean
}

const validationSchema: ZodType<FormSchema> = z.object({
    email: z.string().min(1,{message: 'Email Required'} ).email({ message: 'Invalid email' }),
    userName: z.string().min(3, 'Too Short!').max(12, 'Too Long!'),
    password: z.string()
        .min(1, { message: 'Password Required' })
        .min(8, {message: 'Too Short!'})
        .refine((value) => /^[A-Za-z0-9_-]*$/.test(value), 'Only Letters & Numbers Allowed'),
    rememberMe: z.boolean()
})

const Basic = () => {

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control
    } = useForm<FormSchema>({
        defaultValues: {
            email: '',
            userName: '',
            password: '',
            rememberMe: false,
        },
        resolver: zodResolver(validationSchema),
    });

    const onSubmit = (values: FormSchema) => {
        window.alert(JSON.stringify(values))
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormItem
                label="Email"
                invalid={Boolean(errors.email)}
                errorMessage={errors.email?.message}
            >
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) =>
                        <Input
                            type="email"
                            autoComplete="off"
                            placeholder="Email"
                            {...field}
                        />
                    }
                />
            </FormItem>
            <FormItem
                label="User Name"
                invalid={Boolean(errors.userName)}
                errorMessage={errors.userName?.message}
            >
                <Controller
                    name="userName"
                    control={control}
                    render={({ field }) =>
                        <Input
                            type="text"
                            autoComplete="off"
                            placeholder="User Name"
                            {...field}
                        />
                    }
                />
            </FormItem>
            <FormItem
                label="Password"
                invalid={Boolean(errors.password)}
                errorMessage={errors.password?.message}
            >
                <Controller
                    name="password"
                    control={control}
                    render={({ field }) =>
                        <Input
                            type="password"
                            autoComplete="off"
                            placeholder="Password"
                            {...field}
                        />
                    }
                />
            </FormItem>
            <FormItem>
                <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) =>
                        <Checkbox {...field}>Remember me</Checkbox>
                    }
                />
            </FormItem>
            <FormItem>
                <Button
                    type="reset"
                    className="ltr:mr-2 rtl:ml-2"
                    onClick={() => reset()}
                >
                    Reset
                </Button>
                <Button variant="solid" type="submit">
                    Submit
                </Button>
            </FormItem>
        </Form>
    )
}

export default Basic
```
