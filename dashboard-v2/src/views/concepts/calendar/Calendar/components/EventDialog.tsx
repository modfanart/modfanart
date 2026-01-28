import { useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import Badge from '@/components/ui/Badge'
import hooks from '@/components/ui/hooks'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TbChecks } from 'react-icons/tb'
import { components } from 'react-select'
import dayjs from 'dayjs'
import type { SelectedCell } from '../types'
import type { ControlProps, OptionProps } from 'react-select'

type FormModel = {
    title: string
    startDate: Date
    endDate: Date
    color: string
}

export type EventParam = {
    id: string
    title: string
    start: string
    eventColor: string
    end?: string
}

type ColorOption = {
    value: string
    label: string
    color: string
}

type EventDialogProps = {
    open: boolean
    selected: SelectedCell
    onDialogOpen: (open: boolean) => void
    submit: (eventData: EventParam, type: string) => void
}

const { Control } = components

const { useUniqueId } = hooks

const colorOptions = [
    {
        value: 'red',
        label: 'قرمز',
        color: 'bg-red-400',
    },
    {
        value: 'orange',
        label: 'نارنجی',
        color: 'bg-orange-400',
    },
    {
        value: 'yellow',
        label: 'زرد',
        color: 'bg-yellow-400',
    },
    {
        value: 'green',
        label: 'سبز',
        color: 'bg-green-400',
    },
    {
        value: 'blue',
        label: 'آبی',
        color: 'bg-blue-400',
    },
    {
        value: 'purple',
        label: 'بنفش',
        color: 'bg-purple-400',
    },
]


const CustomSelectOption = ({
    innerProps,
    label,
    data,
    isSelected,
}: OptionProps<ColorOption>) => {
    return (
        <div
            className={`flex items-center justify-between rounded-lg p-2 ${isSelected
                    ? 'bg-gray-100 dark:bg-gray-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            {...innerProps}
        >
            <div className="flex items-center">
                <Badge className={data.color} />
                <span className="ml-2 rtl:mr-2 capitalize">{label}</span>
            </div>
            {isSelected && <TbChecks className="text-emerald-500 text-xl" />}
        </div>
    )
}

const CustomControl = ({ children, ...props }: ControlProps<ColorOption>) => {
    const selected = props.getValue()[0]

    return (
        <Control className="capitalize" {...props}>
            {selected && (
                <Badge className={`${selected.color} ltr:ml-4 rtl:mr-4`} />
            )}
            {children}
        </Control>
    )
}

const validationSchema = z.object({
    title: z.string().min(1, { message: 'عنوان رویداد الزامی است' }),
    startDate: z.date({
        required_error: 'لطفاً یک تاریخ انتخاب کنید',
        invalid_type_error: 'این تاریخ معتبر نیست!',
    }),
    endDate: z.date({
        required_error: 'لطفاً یک تاریخ انتخاب کنید',
        invalid_type_error: 'این تاریخ معتبر نیست!',
    }),
    color: z.string().min(1, { message: 'رنگ الزامی است' }),
})


const EventDialog = (props: EventDialogProps) => {
    const { submit, open, selected, onDialogOpen } = props

    const newId = useUniqueId('event-')

    const handleDialogClose = () => {
        onDialogOpen(false)
    }

    const onSubmit = (values: FormModel) => {
        const eventData: EventParam = {
            id: selected.id || newId,
            title: values.title,
            start: dayjs(values.startDate).format(),
            eventColor: values.color,
        }
        if (values.endDate) {
            eventData.end = dayjs(values.endDate).format()
        }
        submit?.(eventData, selected.type)
        handleDialogClose()
    }

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<FormModel>({
        resolver: zodResolver(validationSchema),
    })

    useEffect(() => {
        if (selected) {
            reset({
                title: selected.title || '',
                startDate: (selected.start &&
                    dayjs(selected.start).toDate()) as Date,
                endDate: (selected.end && dayjs(selected.end).toDate()) as Date,
                color: selected.eventColor || colorOptions[0].value,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected])

    return (
        <Dialog
            isOpen={open}
            onClose={handleDialogClose}
            onRequestClose={handleDialogClose}
        >
            <h5 className="mb-4">
                {selected.type === 'NEW' ? 'افزودن رویداد جدید' : 'ویرایش رویداد'}
            </h5>
            <Form
                className="flex-1 flex flex-col"
                onSubmit={handleSubmit(onSubmit)}
            >
                <FormItem
                    label="عنوان رویداد"
                    invalid={Boolean(errors.title)}
                    errorMessage={errors.title?.message}
                >
                    <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                autoComplete="off"
                                placeholder="عنوان رویداد"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="تاریخ شروع"
                    invalid={Boolean(errors.startDate)}
                    errorMessage={errors.startDate?.message}
                >
                    <Controller
                        name="startDate"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="تاریخ پایان"
                    invalid={Boolean(errors.endDate)}
                    errorMessage={errors.endDate?.message}
                >
                    <Controller
                        name="endDate"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="رنگ رویداد"
                    asterisk={true}
                    invalid={Boolean(errors.color)}
                    errorMessage={errors.color?.message}
                >
                    <Controller
                        name="color"
                        control={control}
                        render={({ field }) => (
                            <Select<ColorOption>
                                options={colorOptions}
                                value={colorOptions.filter(
                                    (option) => option.value === field.value,
                                )}
                                components={{
                                    Option: CustomSelectOption,
                                    Control: CustomControl,
                                }}
                                onChange={(selected) => {
                                    field.onChange(selected?.value)
                                }}
                            />
                        )}
                    />
                </FormItem>
                <FormItem className="mb-0 text-right rtl:text-left">
                    <Button block variant="solid" type="submit">
                        {selected.type === 'NEW' ? 'ایجاد' : 'به‌روزرسانی'}
                    </Button>
                </FormItem>
            </Form>
        </Dialog>
    )
}

export default EventDialog
