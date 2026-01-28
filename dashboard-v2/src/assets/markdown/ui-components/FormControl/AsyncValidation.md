```jsx
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import Spinner from '@/components/ui/Spinner'

type FormSchema = {
    userName: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const AsyncValidation = () => {

    const {
        handleSubmit,
        formState: { errors, isValidating },
        control,
        trigger,
        reset,
    } = useForm<FormSchema>({
        defaultValues: {
            userName: 'Adam',
        },
    })

    const validateAsync = async (value: string) => {
        await sleep(1000)
        if (value === 'Adam') {
            return true
        }
        return `This User name has been taken (only 'Adam' allow)`

    };

    const onSubmit = (values: FormSchema) => {
        setTimeout(() => {
            window.alert(JSON.stringify(values, null, 2))
            reset()
        }, 200)
    }

    return (
        <div>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItem
                    label="Check valid username"
                    invalid={Boolean(errors.userName)}
                    errorMessage={errors.userName?.message}
                >
                    <Controller
                        name="userName"
                        control={control}
                        render={({field}) =>
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="User Name"
                                suffix={
                                    <Spinner
                                        className={
                                            !isValidating ? 'hidden' : ''
                                        }
                                    />
                                }
                                {...field}
                                onChange={(value) => {
                                    field.onChange(value)
                                    trigger(['userName'])
                                }}
                            />
                        }
                        rules={{
                            validate: validateAsync
                        }}
                    />
                </FormItem>
                <FormItem>
                    <Button variant="solid" type="submit">
                        Submit
                    </Button>
                </FormItem>
            </Form>
        </div>
    )
}

export default AsyncValidation
```
