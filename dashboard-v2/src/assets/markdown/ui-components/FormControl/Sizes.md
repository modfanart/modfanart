```jsx
import { useState } from 'react'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import InputGroup from '@/components/ui/InputGroup'
import DatePicker from '@/components/ui/DatePicker'
import { useForm, Controller } from 'react-hook-form'

type Size = 'lg' | 'md' | 'sm'

type FormSchema = {
    name: string,
    email: string
    date: Date | null
}

const options: {
    label: string
    value: Size
}[] = [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
]

const Sizes = () => {
    const [size, setSize] = useState<Size>('md')

    const onSizeSelect = (val: Size) => {
        setSize(val)
    }

    const {
        handleSubmit,
        control,
    } = useForm<FormSchema>({
        defaultValues: {
            name: '',
            email: '',
            date: null,
        },
    })

    const onSubmit = async (values: FormSchema) => {
        await new Promise((r) => setTimeout(r, 500))
        alert(JSON.stringify(values, null, 2))
    }

    return (
        <>
            <InputGroup className="mb-6">
                {options.map((opt) => (
                    <Button
                        key={opt.value}
                        active={size === opt.value}
                        onClick={() => onSizeSelect(opt.value)}
                    >
                        {opt.label}
                    </Button>
                ))}
            </InputGroup>
            <Form size={size} onSubmit={handleSubmit(onSubmit)}>
                <FormItem label="Name">
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) =>
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="name"
                                {...field}
                            />
                        }
                    />
                </FormItem>
                <FormItem label="Email">
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
                <FormItem label="Date">
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) =>
                            <DatePicker
                                placeholder="Select Date"
                                {...field}
                            />
                        }
                    />
                </FormItem>
                <FormItem>
                    <Button variant="solid" type="submit">Submit</Button>
                </FormItem>
            </Form>
        </>
    )
}

export default Sizes
```
