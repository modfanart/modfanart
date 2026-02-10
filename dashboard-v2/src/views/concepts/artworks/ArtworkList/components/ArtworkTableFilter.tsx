import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Checkbox from '@/components/ui/Checkbox'
import Badge from '@/components/ui/Badge'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import { components } from 'react-select'
import { Form, FormItem } from '@/components/ui/Form'
import NumericInput from '@/components/shared/NumericInput'
import useProductList from '../hooks/useProductList'
import { TbFilter, TbMinus } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { ControlProps, OptionProps } from 'react-select'
import classNames from '@/utils/classNames'

type FormSchema = {
    minAmount: number | string
    maxAmount: number | string
    productStatus: string
    productType: Array<string>
}

type Option = {
    value: string
    label: string
    className: string
}

const { Control } = components

const productStatusOption: Option[] = [
{ value: 'published', label: 'منتشر شده', className: 'bg-emerald-500' },
{ value: 'inactive', label: 'غیرفعال', className: 'bg-red-500' },
{ value: 'scheduled', label: 'برنامه‌ریزی شده', className: 'bg-amber-500' },
{ value: 'draft', label: 'پیش‌نویس', className: 'bg-gray-400' },
]
const productTypeList = ['کیف‌ها', 'پوشاک', 'دستگاه‌ها', 'کفش‌ها', 'ساعت‌ها']


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
    minAmount: z.union([z.string(), z.number()]),
    maxAmount: z.union([z.string(), z.number()]),
    productStatus: z.string(),
    productType: z.array(z.string()),
})

const ProductTableFilter = () => {
    const [filterIsOpen, setFilterIsOpen] = useState(false)

    const { filterData, setFilterData } = useProductList()

    const { handleSubmit, control, getValues } = useForm<FormSchema>({
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
                                name="minAmount"
                                control={control}
                                render={({ field }) => (
                                    <NumericInput
                                        thousandSeparator
                                        type="text"
                                        inputPrefix="$"
                                        autoComplete="off"
                                        placeholder="0.00"
                                        value={field.value}
                                        max={getValues('maxAmount')}
                                        isAllowed={(values) => {
                                            const { floatValue } = values
                                            return (
                                                (floatValue || 0) <=
                                                (getValues('maxAmount') as number)
                                            )
                                        }}
                                        onChange={(e) =>
                                            field.onChange(e.target.value)
                                        }
                                    />
                                )}
                            />
                            <span>
                                <TbMinus />
                            </span>
                            <Controller
                                name="maxAmount"
                                control={control}
                                render={({ field }) => (
                                    <NumericInput
                                        thousandSeparator
                                        type="text"
                                        inputPrefix="$"
                                        autoComplete="off"
                                        placeholder="0.00"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>
                    </FormItem>
                    <FormItem label="وضعیت محصول">
                        <Controller
                            name="productStatus"
                            control={control}
                            render={({ field }) => (
                                <Select<Option>
                                    options={productStatusOption}
                                    {...field}
                                    value={productStatusOption.filter(
                                        (option) => option.value === field.value
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
                                name="productType"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox.Group
                                        vertical
                                        className="flex"
                                        {...field}
                                    >
                                        {productTypeList.map((type, index) => (
                                            <Checkbox
                                                key={type + index}
                                                name={field.name}
                                                value={type}
                                                className="justify-between flex-row-reverse heading-text"
                                            >
                                                {type}
                                            </Checkbox>
                                        ))}
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

export default ProductTableFilter
