import { useState } from 'react'
import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import InputGroup from '@/components/ui/InputGroup'
import { useForm, Controller } from 'react-hook-form'

type FormLayout = 'horizontal' | 'vertical' | 'inline'

type FormSchema = {
    name: string
    email: string
}

const options: {
    label: string
    value: FormLayout
}[] = [
        { label: 'عمودی', value: 'vertical' },
        { label: 'افقی', value: 'horizontal' },
        { label: 'درون‌خطی', value: 'inline' },
    ]

const Layout = () => {
    const [layout, setLayout] = useState<FormLayout>('vertical')

    const onLayoutSelect = (val: FormLayout) => {
        setLayout(val)
    }

    const { handleSubmit, control } = useForm<FormSchema>({
        defaultValues: {
            email: '',
            name: '',
        },
    })

    const onSubmit = async (values: FormSchema) => {
        await new Promise((r) => setTimeout(r, 500))
        alert(JSON.stringify(values, null, 2))
    }

    return (
        <div>
            <InputGroup className="mb-6">
                {options.map((opt) => (
                    <Button
                        key={opt.value}
                        active={layout === opt.value}
                        onClick={() => onLayoutSelect(opt.value)}
                    >
                        {opt.label}
                    </Button>
                ))}
            </InputGroup>
            <Form layout={layout} onSubmit={handleSubmit(onSubmit)}>
                <FormItem label="نام">
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="نام"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem label="ایمیل">
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
                <FormItem>
                    <Button variant="solid" type="submit">
                        ارسال
                    </Button>
                </FormItem>
            </Form>
        </div>
    )
}

export default Layout
