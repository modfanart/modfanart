import { useState } from 'react'
import Button from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Segment from '@/components/ui/Segment'
import { Form, FormItem } from '@/components/ui/Form'
import { campaignTypeOption } from '../utils'
import NumericInput from '@/components/shared/NumericInput'
import classNames from '@/utils/classNames'
import sleep from '@/utils/sleep'
import dayjs from 'dayjs'
import CreatableSelect from 'react-select/creatable'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import uniqueId from 'lodash/uniqueId'
import type { ZodType } from 'zod'
import type { Campagin } from '../types'

type AudienceGroupOption = {
    label: string
    value: string
}

export type FormSchema = {
    name: string
    startDate: number
    endDate: number
    budget: number
    campaignType: string
    audienceGroup: AudienceGroupOption[]
}

type CreateCampaignProps = {
    onCreate: (value: Campagin) => void
}

const audienceGroupOption = [
    { label: 'مشتریان فعلی', value: 'existingCustomer' },
    { label: 'علاقه‌مندان به فناوری', value: 'techEnthusiasts' },
    { label: 'دانش‌آموزان و والدین', value: 'studentsParents' },
    { label: 'عموم مردم', value: 'generalPublic' },
    { label: 'خریداران هدیه', value: 'giftShoppers' },
]

const validationSchema: ZodType<FormSchema> = z.object({
    name: z.string({ required_error: 'لطفاً نام کمپین را وارد کنید' }),
    startDate: z.number({ required_error: 'لطفاً تاریخ شروع را انتخاب کنید' }),
    endDate: z.number({ required_error: 'لطفاً تاریخ پایان را انتخاب کنید' }),
    budget: z.number({ required_error: 'لطفاً بودجه را وارد کنید' }),
    campaignType: z.string({ required_error: 'لطفاً نوع کمپین را انتخاب کنید' }),
    audienceGroup: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .nonempty('حداقل یک مورد باید انتخاب شود!'),
});


const CreateCampaign = ({ onCreate }: CreateCampaignProps) => {
    const [dialogOpen, setDialogOpen] = useState(false)

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        resetField,
        control,
        watch,
    } = useForm<FormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    const handleDialogCancel = () => {
        reset()
        handleDialogClose()
    }

    const onSubmit = async (formValue: FormSchema) => {
        await sleep(500)
        onCreate({
            id: uniqueId('campaign-'),
            name: formValue.name || 'Untitle campaign',
            startDate: formValue.startDate * 1000,
            endDate: formValue.endDate * 1000,
            budget: formValue.budget,
            leadsGenerated: 0,
            conversions: 0,
            conversionRate: 0,
            status: 'disabled',
            type: formValue.campaignType,
            audienceGroup: formValue.audienceGroup.map((group) => group.value),
        })
        reset()
        handleDialogClose()
    }

    return (
        <>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
                کمپین ایجاد کنید
            </Button>
            <Dialog
                isOpen={dialogOpen}
                width={600}
                onClose={handleDialogClose}
                onRequestClose={handleDialogClose}
                height={'90vh'}
                overFlow={true}
            >
                <h4>کمپین جدید</h4>
                <Form   className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                    <FormItem
                        label="توع"
                        invalid={Boolean(errors.campaignType)}
                        errorMessage={errors.campaignType?.message}
                    >
                        <Controller
                            name="campaignType"
                            control={control}
                            render={({ field }) => (
                                <Segment
                                    value={field.value}
                                    className="grid grid-cols-3 gap-4 bg-transparent"
                                    onChange={(value) => field.onChange(value)}
                                >
                                    {Object.entries(campaignTypeOption).map(
                                        ([key, props]) => (
                                            <Segment.Item key={key} value={key}>
                                                {({
                                                    active,
                                                    onSegmentItemClick,
                                                }) => {
                                                    return (
                                                        <div
                                                            className={classNames(
                                                                'flex justify-between border rounded-xl border-gray-300 py-5 px-4 select-none ring-1',
                                                                active
                                                                    ? 'ring-primary border-primary '
                                                                    : 'ring-transparent bg-gray-100',
                                                            )}
                                                            role="button"
                                                            onClick={
                                                                onSegmentItemClick
                                                            }
                                                        >
                                                            <div className="flex flex-col items-center justify-center flex-1 gap-2 heading-text font-bold">
                                                                <div className="text-3xl">
                                                                    {props.icon}
                                                                </div>
                                                                <div className="font-bold">
                                                                    {
                                                                        props.label
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }}
                                            </Segment.Item>
                                        ),
                                    )}
                                </Segment>
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="نام کمپین"
                        invalid={Boolean(errors.name)}
                        errorMessage={errors.name?.message}
                    >
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="نام کمپین"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <div className="flex gap-4">
                        <FormItem
                            className="flex-1"
                            label="تاریخ شروع"
                            invalid={Boolean(errors.startDate)}
                            errorMessage={errors.startDate?.message}
                        >
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        value={
                                            field.value
                                                ? dayjs
                                                    .unix(
                                                        field.value as number,
                                                    )
                                                    .toDate()
                                                : null
                                        }
                                        placeholder="تاریخ را انتخاب کنید"
                                        minDate={dayjs()
                                            .startOf('day')
                                            .toDate()}
                                        onChange={(date) => {
                                            if (watch('endDate')) {
                                                resetField('endDate')
                                            }
                                            field.onChange(dayjs(date).unix())
                                        }}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            className="flex-1"
                            label="تاریخ پایان"
                            invalid={Boolean(errors.endDate)}
                            errorMessage={errors.endDate?.message}
                        >
                            <Controller
                                name="endDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        // {...field}
                                        // value={
                                        //     field.value
                                        //         ? dayjs
                                        //             .unix(
                                        //                 field.value as number,
                                        //             )
                                        //             .toDate()
                                        //         : null
                                        // }
                                        placeholder="تاریخ را انتخاب کنید"
                                        minDate={dayjs(
                                            dayjs.unix(watch('startDate')),
                                        )
                                            .endOf('day')
                                            .toDate()}
                                        onChange={(date) =>
                                            field.onChange(dayjs(date).unix())
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                    <FormItem
                        label="بودجه"
                        invalid={Boolean(errors.budget)}
                        errorMessage={errors.budget?.message}
                    >
                        <Controller
                            name="budget"
                            control={control}
                            render={({ field }) => (
                                <NumericInput
                                    allowLeadingZeros
                                    thousandSeparator=","
                                    value={field.value}
                                    inputPrefix={'$'}
                                    placeholder="0.00"
                                    onValueChange={(e) => {
                                        field.onChange(e.floatValue)
                                    }}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="انتخاب چندگانه"
                        invalid={Boolean(errors.audienceGroup)}
                        errorMessage={errors.audienceGroup?.message}
                    >
                        <Controller
                            name="audienceGroup"
                            control={control}
                            render={({ field }) => (
                                <Select<AudienceGroupOption, true>
                                    placeholder={'انتخاب کنید...'}
                                    isMulti
                                    componentAs={CreatableSelect}
                                    options={audienceGroupOption}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <div className="flex justify-end gap-2 mb-8">
                        <Button type="button" onClick={handleDialogCancel}>
                          لغو
                        </Button>
                        <Button
                            loading={isSubmitting}
                            variant="solid"
                            type="submit"
                        >
                            ارسال
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </>
    )
}

export default CreateCampaign
