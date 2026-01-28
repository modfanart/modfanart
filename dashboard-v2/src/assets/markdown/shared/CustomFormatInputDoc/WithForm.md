```jsx
import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import FormCustomFormatInput from '@/components/shared/CustomFormatInput'
import { useForm, Controller } from 'react-hook-form'

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

const WithForm = () => {

    const {
        handleSubmit,
        formState: { errors },
        control
    } = useForm<{cardExpiry?: string}>();

    const onSubmit = (value: {cardExpiry?: string}) => {
        console.log(value)
    }

    return (
        <Form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
            <FormItem
                label="Expiration date"
                invalid={Boolean(errors.cardExpiry)}
                errorMessage={errors.cardExpiry?.message}
            >
                <Controller
                    name="cardExpiry"
                    control={control}
                    render={({ field }) =>
                        <FormCustomFormatInput
                            placeholder="••/••"
                            format={cardExpiryFormat}
                            onValueChange={(e) => {
                                field.onChange(e.value)
                            }}
                            value={field.value}
                        />
                    }
                />
            </FormItem>
            <Button variant="solid" type="submit" block>
                Submit
            </Button>
        </Form>
    )
}

export default WithForm
```
