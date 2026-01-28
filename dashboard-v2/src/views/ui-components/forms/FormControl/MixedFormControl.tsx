import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import TimeInput from '@/components/ui/TimeInput'
import Checkbox from '@/components/ui/Checkbox'
import Radio from '@/components/ui/Radio'
import Switcher from '@/components/ui/Switcher'
import Segment from '@/components/ui/Segment'
import Upload from '@/components/ui/Upload'
import PresetSegmentItemOption from '@/components/shared/PresetSegmentItemOption'
import { HiCheckCircle } from 'react-icons/hi'
import CreatableSelect from 'react-select/creatable'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

type Option = {
    value: string
    label: string
}

type FormSchema = {
    input: string
    select: string
    multipleSelect: Option[]
    date: Date | null
    time: Date | null
    singleCheckbox: boolean
    multipleCheckbox: Array<string | number>
    radio: string
    switcher: boolean
    segment: string[]
    upload: File[]
}

const options: Option[] = [
    { value: 'foo', label: 'فو' },
    { value: 'bar', label: 'بار' },
]

const segmentSelections = [
    { value: 'Personal', desc: 'برنامه برای شخصی.' },
    { value: 'Team', desc: 'برنامه برای تیم' },
    { value: 'Business', desc: 'برای برنامه کسب‌وکار با ما تماس بگیرید.' },
]


const MAX_UPLOAD = 2

const validationSchema: ZodType<FormSchema> = z.object({
    input: z
        .string()
        .min(1, 'لطفاً نام کاربری را وارد کنید!')
        .min(3, 'خیلی کوتاه است!')
        .max(12, 'خیلی بلند است!'),
    select: z.string().min(1, 'لطفاً یک گزینه را انتخاب کنید!'),
    multipleSelect: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .nonempty('حداقل یک گزینه باید انتخاب شود!'),
    date: z.date({
        required_error: 'تاریخ الزامی است!',
        invalid_type_error: 'تاریخ نامعتبر است',
    }),
    time: z.date({
        required_error: 'زمان الزامی است!',
        invalid_type_error: 'زمان نامعتبر است',
    }),
    singleCheckbox: z.literal<boolean>(true, {
        errorMap: () => ({ message: 'باید این گزینه را تیک بزنید!' }),
    }),
    multipleCheckbox: z
        .array(z.union([z.string(), z.number()]))
        .nonempty('حداقل یک گزینه باید انتخاب شود!'),
    radio: z.string().min(1, 'لطفاً یک گزینه را انتخاب کنید!'),
    switcher: z.literal<boolean>(true, {
        errorMap: () => ({ message: 'باید این گزینه را فعال کنید!' }),
    }),
    upload: z.array(z.instanceof(File)).nonempty('حداقل یک فایل باید آپلود شود!'),
    segment: z.array(z.string()).nonempty('حداقل یک گزینه باید انتخاب شود!'),
})


const MixedFormControl = () => {
    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
    } = useForm<FormSchema>({
        defaultValues: {
            input: '',
            select: '',
            date: null,
            time: null,
            multipleSelect: [],
            singleCheckbox: false,
            multipleCheckbox: [],
            radio: '',
            switcher: false,
            segment: [],
            upload: [],
        },
        resolver: zodResolver(validationSchema),
    })

    const beforeUpload = (file: FileList | null, fileList: File[]) => {
        let valid: string | boolean = true

        const allowedFileType = ['image/jpeg', 'image/png']
        const MAX_FILE_SIZE = 500000

        if (fileList.length >= MAX_UPLOAD) {
            return `شما می‌توانید فقط ${MAX_UPLOAD} فایل آپلود کنید`
        }
        
        if (file) {
            for (const f of file) {
                if (!allowedFileType.includes(f.type)) {
                    valid = 'لطفاً یک فایل .jpeg یا .png آپلود کنید!'
                }
        
                if (f.size >= MAX_FILE_SIZE) {
                    valid = 'حجم فایل آپلودی نباید بیشتر از 500 کیلوبایت باشد!'
                }
            }
        }        

        return valid
    }

    const onSubmit = (values: FormSchema) => {
        setTimeout(() => {
            alert(JSON.stringify(values, null, 2))
        }, 400)
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormItem
                asterisk
                label="ورودی"
                invalid={Boolean(errors.input)}
                errorMessage={errors.input?.message}
            >
                <Controller
                    name="input"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="text"
                            autoComplete="off"
                            placeholder="ورودی"
                            {...field}
                        />
                    )}
                />
            </FormItem>
            <FormItem
                asterisk
                label="انتخاب"
                invalid={Boolean(errors.select)}
                errorMessage={errors.select?.message}
            >
                <Controller
                    name="select"
                    control={control}
                    render={({ field }) => (
                        <Select
                            options={options}
                            {...field}
                            value={options.filter(
                                (option) => option.value === field.value,
                            )}
                            onChange={(option) => field.onChange(option?.value)}
                        />
                    )}
                />
            </FormItem>
            <FormItem
                asterisk
                label="انتخاب چندگانه"
                invalid={Boolean(errors.multipleSelect)}
                errorMessage={errors.multipleSelect?.message}
            >
                <Controller
                    name="multipleSelect"
                    control={control}
                    render={({ field }) => (
                        <Select<Option, true>
                            isMulti
                            componentAs={CreatableSelect}
                            options={options}
                            {...field}
                        />
                    )}
                />
            </FormItem>
            <FormItem
                asterisk
                label="تاریخ"
                invalid={Boolean(errors.date)}
                errorMessage={errors.date?.message}
            >
                <Controller
                    name="date"
                    control={control}
                    render={({ field }) => <DatePicker {...field} />}
                />
            </FormItem>
            <FormItem
                asterisk
                label="زمان"
                invalid={Boolean(errors.time)}
                errorMessage={errors.time?.message}
            >
                <Controller
                    name="time"
                    control={control}
                    render={({ field }) => <TimeInput {...field} />}
                />
            </FormItem>
            <FormItem
                asterisk
                label="چک‌باکس تک"
                invalid={Boolean(errors.singleCheckbox)}
                errorMessage={errors.singleCheckbox?.message}
            >
                <Controller
                    name="singleCheckbox"
                    control={control}
                    render={({ field }) => <Checkbox {...field} />}
                />
            </FormItem>
            <FormItem
                asterisk
                label="چک‌باکس چندگانه"
                invalid={Boolean(errors.multipleCheckbox)}
                errorMessage={errors.multipleCheckbox?.message}
            >
                <Controller
                    name="multipleCheckbox"
                    control={control}
                    render={({ field }) => (
                        <Checkbox.Group
                            value={field.value as string[]}
                            onChange={field.onChange}
                        >
                            <Checkbox name={field.name} value="Apple">
                                سیب
                            </Checkbox>
                            <Checkbox name={field.name} value="Banana">
                                موز
                            </Checkbox>
                            <Checkbox name={field.name} value="Lemon">
                                لیمو
                            </Checkbox>
                        </Checkbox.Group>
                    )}
                />
            </FormItem>
            <FormItem
                asterisk
                label="رادیو"
                invalid={Boolean(errors.radio)}
                errorMessage={errors.radio?.message}
            >
                <Controller
                    name="radio"
                    control={control}
                    render={({ field }) => (
                        <Radio.Group {...field}>
                            <Radio value={'1'}>پی‌پال</Radio>
                            <Radio value={'2'}>استرایپ</Radio>
                        </Radio.Group>
                    )}
                />
            </FormItem>
            <FormItem
                asterisk
                label="سوئیچر"
                invalid={Boolean(errors.switcher)}
                errorMessage={errors.switcher?.message}
            >
                <Controller
                    name="switcher"
                    control={control}
                    render={({ field }) => (
                        <Switcher
                            checked={field.value}
                            onChange={(checked) => {
                                field.onChange(checked)
                            }}
                        />
                    )}
                />
            </FormItem>
            <FormItem
                asterisk
                label="بارگذاری"
                invalid={Boolean(errors.upload)}
                errorMessage={errors.upload?.message}
            >
                <Controller
                    name="upload"
                    control={control}
                    render={({ field }) => (
                        <Upload
                            beforeUpload={beforeUpload}
                            fileList={field.value}
                            onFileRemove={(files) => field.onChange(files)}
                            onChange={(files) => field.onChange(files)}
                        />
                    )}
                />
            </FormItem>
            <FormItem
                asterisk
                label="بخش"
                invalid={Boolean(errors.segment)}
                errorMessage={errors.segment?.message}
            >
                <Controller
                    name="segment"
                    control={control}
                    render={({ field }) => (
                        <Segment
                            className="w-full bg-transparent dark:bg-transparent p-0"
                            selectionType="multiple"
                            {...field}
                        >
                            <div className="grid grid-cols-3 gap-4 w-full">
                                {segmentSelections.map((segment) => (
                                    <Segment.Item
                                        key={segment.value}
                                        value={segment.value}
                                    >
                                        {({
                                            active,
                                            onSegmentItemClick,
                                            disabled,
                                        }) => {
                                            return (
                                                <div className="text-center">
                                                    <PresetSegmentItemOption
                                                        hoverable
                                                        active={active}
                                                        disabled={disabled}
                                                        defaultGutter={false}
                                                        className="relative min-h-[80px] w-full"
                                                        customCheck={
                                                            <HiCheckCircle className="text-primary absolute top-2 right-2 text-2xl" />
                                                        }
                                                        onSegmentItemClick={
                                                            onSegmentItemClick
                                                        }
                                                    >
                                                        <div className="flex flex-col items-start mx-4">
                                                            <h6>
                                                                {segment.value}
                                                            </h6>
                                                            <p>
                                                                {segment.desc}
                                                            </p>
                                                        </div>
                                                    </PresetSegmentItemOption>
                                                </div>
                                            )
                                        }}
                                    </Segment.Item>
                                ))}
                            </div>
                        </Segment>
                    )}
                />
            </FormItem>
            <FormItem>
                <Button
                    type="reset"
                    className="ltr:mr-2 rtl:ml-2"
                    onClick={() => reset()}
                >
                    بازنشانی
                </Button>
                <Button variant="solid" loading={isSubmitting} type="submit">
                    ارسال
                </Button>
            </FormItem>
        </Form>
    )
}

export default MixedFormControl
