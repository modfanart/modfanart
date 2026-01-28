```jsx
import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { useForm, Controller } from 'react-hook-form'

const WithForm = () => {

    const {
        handleSubmit,
        formState: { errors },
        control
    } = useForm<{textContent?: string}>();

    const onSubmit = (value: {textContent?: string}) => {
        window.alert(JSON.stringify(value))
    }

    return (
        <Form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
            <FormItem
                label="Expiration date"
                invalid={Boolean(errors.textContent)}
                errorMessage={errors.textContent?.message}
            >
                <Controller
                    name="textContent"
                    control={control}
                    render={({ field }) =>
                        <RichTextEditor
                            content={field.value}
                            invalid={Boolean(errors.textContent)}
                            onChange={({html}) => {
                                field.onChange(html)
                            }}
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
