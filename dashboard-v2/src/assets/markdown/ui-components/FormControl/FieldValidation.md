```jsx
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useForm, Controller } from 'react-hook-form'

type FormSchema = {
    userName: string,
    email: string
}

const FieldValidation = () => {

    const {
        handleSubmit,
        formState: { errors },
        control
    } = useForm<FormSchema>({
        defaultValues: {
            userName: '',
            email: '',
        },
    })

    return (
        <Form onSubmit={handleSubmit((values) => {
            window.alert(JSON.stringify(values))
        })}>
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
                    rules={{
                        validate: {
                            required: (value) => {
                                if (!value) {
                                    return 'Required'
                                }
                                if (value === 'admin') {
                                    return 'Nice try!'
                                }
                                return
                            }
                        }
                    }}
                />
            </FormItem>
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
                            autoComplete="off"
                            placeholder="Email"
                            {...field}
                        />
                    }
                    rules={{
                        validate: {
                            required: (value) => {
                                let error
                                if (!value) {
                                    error = 'Required'
                                } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
                                    error = 'Invalid email address'
                                }
                                return error
                            }
                        }
                    }}
                />
            </FormItem>
            <FormItem>
                <Button type="submit" variant="solid">
                    Submit
                </Button>
            </FormItem>
        </Form>
    )
}

export default FieldValidation
```
