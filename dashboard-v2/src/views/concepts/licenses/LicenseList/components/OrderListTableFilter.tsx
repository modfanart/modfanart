import { useState } from 'react'
import Button from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'
import Drawer from '@/components/ui/Drawer'
import Checkbox from '@/components/ui/Checkbox'
import Badge from '@/components/ui/Badge'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import { components } from 'react-select'
import { Form, FormItem } from '@/components/ui/Form'
import useOrderlist from '../hooks/useOrderlist'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { ControlProps, OptionProps } from 'react-select'
import classNames from '@/utils/classNames'

type FormSchema = {
    date: [Date, Date]
    status: string
    paymentMethod: Array<string>
}

type Option = {
    value: string
    label: string
    className: string
}

const { Control } = components

const statusOption: Option[] = [
    { value: 'paid', label: 'پرداخت شده', className: 'bg-emerald-500' },
    { value: 'failed', label: 'شکست خورد', className: 'bg-red-500' },
    { value: 'pending', label: 'در انتظار', className: 'bg-amber-500' },
    { value: 'all', label: 'همه', className: 'bg-gray-400' },
]

const paymentMethodList = [
    'کارت اعتباری',
    'کارت بدهی',
    'پی پال',
    'استرایپ',
    'نقدی',
]

const CustomSelectOption = (props: OptionProps<Option>) => {
    return (
        <DefaultOption<Option>
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    <Badge className={data.className} />
                    <span className="ml-2 rtl:mr-2">{label}</span>
                </span>
            )}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<Option>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Badge className={classNames('mr-4', selected.className)} />
            )}
            {children}
        </Control>
    )
}

const validationSchema: ZodType<FormSchema> = z.object({
    date: z.tuple([z.date(), z.date()]),
    status: z.string(),
    paymentMethod: z.array(z.string()),
})

const OrderListTableFilter = () => {
    const [filterIsOpen, setFilterIsOpen] = useState(false)

    const { filterData, setFilterData } = useOrderlist()

    const { handleSubmit, control } = useForm<FormSchema>({
        defaultValues: filterData,
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: FormSchema) => {
        setFilterData(values)
        setFilterIsOpen(false)
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={() => setFilterIsOpen(true)}>
                فیلتر
            </Button>
            <Drawer
                title="فیلتر"
                isOpen={filterIsOpen}
                onClose={() => setFilterIsOpen(false)}
                onRequestClose={() => setFilterIsOpen(false)}
            >
                <Form
                    className="h-full"
                    containerClassName="flex flex-col justify-between h-full"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div>
                        <FormItem label="قیمت محصول">
                            <div className="flex items-center gap-2">
                                <Controller
                                    name="date"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker.DatePickerRange
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                        </FormItem>
                        <FormItem label="وضعیت محصول">
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select<Option>
                                        options={statusOption}
                                        {...field}
                                        value={statusOption.filter(
                                            (option) =>
                                                option.value === field.value,
                                        )}
                                        components={{
                                            Option: CustomSelectOption,
                                            Control: CustomControl,
                                        }}
                                        onChange={(option) =>
                                            field.onChange(option?.value)
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem label="نوع محصول">
                            <div className="mt-4">
                                <Controller
                                    name="paymentMethod"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Group
                                            vertical
                                            className="flex"
                                            {...field}
                                        >
                                            {paymentMethodList.map(
                                                (type, index) => (
                                                    <Checkbox
                                                        key={type + index}
                                                        name={field.name}
                                                        value={type}
                                                        className="justify-between flex-row-reverse heading-text"
                                                    >
                                                        {type}
                                                    </Checkbox>
                                                ),
                                            )}
                                        </Checkbox.Group>
                                    )}
                                />
                            </div>
                        </FormItem>
                    </div>
                    <Button variant="solid" type="submit">
                        جستجو
                    </Button>
                </Form>
            </Drawer>
        </>
    )
}

export default OrderListTableFilter
