import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import { Form, FormItem } from '@/components/ui/Form'
import {
    TbVideo,
    TbCheckbox,
    TbCoffee,
    TbCalendarStar,
    TbPresentation,
    TbBell,
} from 'react-icons/tb'
import { LuPalmtree } from 'react-icons/lu'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import uniqueId from 'lodash/uniqueId'
import { components } from 'react-select'
import type { Event } from '../types'
import type { ZodType } from 'zod'
import type { ReactNode } from 'react'
import type { ControlProps, OptionProps } from 'react-select'

export type FormSchema = {
    type: Event
    label: string
    time: number
}

type EventOption = { label: string; value: Event; color: string }

const { Control } = components

// eslint-disable-next-line react-refresh/only-export-components
export const eventTypes: Record<
    Event,
    { label: string; icon: ReactNode; color: string }
> = {
    task: {
        label: 'وظیفه',
        icon: <TbCheckbox />,
        color: 'bg-purple-200 dark:bg-purple-200',
    },
    meeting: {
        label: 'ملاقات',
        icon: <TbVideo />,
        color: 'bg-sky-200 dark:bg-sky-200',
    },
    holiday: {
        label: 'از تعطیلات خود لذت ببرید',
        icon: <LuPalmtree />,
        color: 'bg-amber-200 dark:bg-amber-200',
    },
    breaks: {
        label: 'پاسخ',
        icon: <TbCoffee />,
        color: 'bg-orange-200 dark:bg-orange-200',
    },
    event: {
        label: 'رویداد',
        icon: <TbCalendarStar />,
        color: 'bg-emerald-200 dark:bg-emerald-200',
    },
    workshops: {
        label: 'کارگاه',
        icon: <TbPresentation />,
        color: 'bg-rose-200 dark:bg-rose-200',
    },
    reminders: {
        label: 'یادآوری',
        icon: <TbBell />,
        color: 'bg-teal-200 dark:bg-teal-200',
    },
}

const eventOptions: EventOption[] = [
    { label: 'وظیفه', value: 'task', color: 'bg-purple-200' },
    { label: 'ملاقات', value: 'meeting', color: 'bg-sky-200' },
    { label: 'پاسخ', value: 'breaks', color: 'bg-orange-200' },
    { label: 'رویداد', value: 'event', color: 'bg-emerald-200' },
    { label: 'کارگاه', value: 'workshops', color: 'bg-rose-200' },
    { label: 'یادآوری', value: 'reminders', color: 'bg-teal-200' },
]

const timeOption = [
    { value: 0, label: '12:00 صبح' },
    { value: 1, label: '1:00 صبح' },
    { value: 2, label: '2:00 صبح' },
    { value: 3, label: '3:00 صبح' },
    { value: 4, label: '4:00 صبح' },
    { value: 5, label: '5:00 صبح' },
    { value: 6, label: '6:00 صبح' },
    { value: 7, label: '7:00 صبح' },
    { value: 8, label: '8:00 صبح' },
    { value: 9, label: '9:00 صبح' },
    { value: 10, label: '10:00 صبح' },
    { value: 11, label: '11:00 صبح' },
    { value: 12, label: '12:00 ظهر' },
    { value: 13, label: '1:00 عصر' },
    { value: 14, label: '2:00 عصر' },
    { value: 15, label: '3:00 عصر' },
    { value: 16, label: '4:00 عصر' },
    { value: 17, label: '5:00 عصر' },
    { value: 18, label: '6:00 عصر' },
    { value: 19, label: '7:00 عصر' },
    { value: 20, label: '8:00 عصر' },
    { value: 21, label: '9:00 عصر' },
    { value: 22, label: '10:00 عصر' },
    { value: 23, label: '11:00 عصر' },
]

const CustomSelectOption = (props: OptionProps<EventOption>) => {
    return (
        <DefaultOption<EventOption>
            {...props}
            customLabel={(_, label) => (
                <span className="flex items-center gap-2">
                    <span>{label}</span>
                </span>
            )}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<EventOption>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && <></>}
            {children}
        </Control>
    )
}

const validationSchema: ZodType<FormSchema> = z.object({
    type: z.union([
        z.literal('meeting'),
        z.literal('task'),
        z.literal('holiday'),
        z.literal('breaks'),
        z.literal('event'),
        z.literal('workshops'),
        z.literal('reminders'),
    ]),
    label: z.string({ required_error: 'لطفا نام رویداد را وارد کنید' }),
    time: z.number({ required_error: 'لطفا یک زمان انتخاب کنید' }),
})

const CreateEventDialog = ({
    onCreateEvent,
}: {
    onCreateEvent: (value: FormSchema & { id: string }) => void
}) => {
    const [dialogOpen, setDialogOpen] = useState(false)

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
    } = useForm<FormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const handleDialogClose = () => {
        reset()
        setDialogOpen(false)
    }

    const onSubmit = (value: FormSchema) => {
        onCreateEvent({
            id: uniqueId('schedule-event-'),
            ...value,
        })
        handleDialogClose()
    }

    return (
        <>
            <Button block onClick={() => setDialogOpen(true)}>
                رویداد اضافه کن
            </Button>
            <Dialog
                isOpen={dialogOpen}
                onClose={handleDialogClose}
                onRequestClose={handleDialogClose}
            >
                <h4>رویداد جدید</h4>
                <Form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                    <FormItem
                        label="نام رویداد"
                        invalid={Boolean(errors.label)}
                        errorMessage={errors.label?.message}
                    >
                        <Controller
                            name="label"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="نام رویداد"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="نوع رویداد"
                        invalid={Boolean(errors.type)}
                        errorMessage={
                            errors.type?.message && 'لطفا یک نوع انتخاب کنید'
                        }
                    >
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <Select<EventOption>
                                    options={eventOptions}
                                    {...field}
                                    components={{
                                        Option: CustomSelectOption,
                                        Control: CustomControl,
                                    }}
                                    placeholder="نوع رویداد"
                                    value={eventOptions.filter(
                                        (option) =>
                                            option.value === field.value,
                                    )}
                                    onChange={(option) =>
                                        field.onChange(option?.value)
                                    }
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="زمان"
                        invalid={Boolean(errors.time)}
                        errorMessage={errors.time?.message}
                    >
                        <Controller
                            name="time"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={timeOption}
                                    {...field}
                                    placeholder="زمان را انتخاب کنید..."
                                    value={timeOption.filter(
                                        (option) =>
                                            option.value === field.value,
                                    )}
                                    onChange={(option) =>
                                        field.onChange(option?.value)
                                    }
                                />
                            )}
                        />
                    </FormItem>
                    <Button
                        block
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                    >
                        ایجاد کن
                    </Button>
                </Form>
            </Dialog>
        </>
    )
}

export default CreateEventDialog
