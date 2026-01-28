```jsx
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
    { value: 'foo', label: 'Foo' },
    { value: 'bar', label: 'Bar' },
]

const segmentSelections = [
    { value: 'Personal', desc: 'The plan for personal.' },
    { value: 'Team', desc: 'The plan for team' },
    { value: 'Business', desc: 'Talk to us for business plan.' },
]

const MAX_UPLOAD = 2

const validationSchema: ZodType<FormSchema> = z.object({
    input: z.string().min(1, 'Please input user name!').min(3, 'Too Short!').max(12, 'Too Long!'),
    select: z.string().min(1, 'Please select one!'),
    multipleSelect: z.array(z.object({value: z.string(), label: z.string()})).nonempty('At least one is selected!'),
    date: z.date({ required_error: 'Date Required!', invalid_type_error: 'Invalid Date' }),
    time: z.date({ required_error: 'Time Required!', invalid_type_error: 'Invalid Time' }),
    singleCheckbox: z.literal<boolean>(true, { errorMap: () => ({ message: 'You must tick this!' })}),
    multipleCheckbox: z.array(z.union([z.string(), z.number()])).nonempty('Select at least one option!'),
    radio: z.string().min(1, 'Please select one!'),
    switcher: z.literal<boolean>(true, { errorMap: () => ({ message: 'You must turn this on!' })}),
    upload: z.array(z.instanceof(File)).nonempty('At least one file uploaded!'),
    segment: z.array(z.string()).nonempty('Select at least one option!')
})


const MixedFormControl = () => {

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control
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
            return `You can only upload ${MAX_UPLOAD} file(s)`
        }

        if (file) {
            for (const f of file) {
                if (!allowedFileType.includes(f.type)) {
                    valid = 'Please upload a .jpeg or .png file!'
                }

                if (f.size >= MAX_FILE_SIZE) {
                    valid = 'Upload image cannot more then 500kb!'
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
                label="Input"
                invalid={Boolean(errors.input)}
                errorMessage={errors.input?.message}
            >
                <Controller
                    name="input"
                    control={control}
                    render={({ field }) =>
                        <Input
                            type="text"
                            autoComplete="off"
                            placeholder="Input"
                            {...field}
                        />
                    }
                />
            </FormItem>
            <FormItem
                asterisk
                label="Select"
                invalid={Boolean(errors.select)}
                errorMessage={errors.select?.message}
            >
                <Controller
                    name="select"
                    control={control}
                    render={({ field }) =>
                        <Select
                            options={options}
                            {...field}
                            value={options.filter((option) => option.value === field.value)}
                            onChange={(option) =>
                                field.onChange(option?.value)
                            }
                        />
                    }
                />
            </FormItem>
            <FormItem
                asterisk
                label="Multiple Select"
                invalid={Boolean(errors.multipleSelect)}
                errorMessage={errors.multipleSelect?.message}
            >
                <Controller
                    name="multipleSelect"
                    control={control}
                    render={({ field }) =>
                        <Select<Option, true>
                            isMulti
                            componentAs={CreatableSelect}
                            options={options}
                            {...field}
                        />
                    }
                />
            </FormItem>
            <FormItem
                asterisk
                label="Date"
                invalid={Boolean(errors.date)}
                errorMessage={errors.date?.message}
            >
                <Controller
                    name="date"
                    control={control}
                    render={({ field }) =>
                        <DatePicker {...field} />
                    }
                />
            </FormItem>
            <FormItem
                asterisk
                label="Time"
                invalid={Boolean(errors.time)}
                errorMessage={errors.time?.message}
            >
                <Controller
                    name="time"
                    control={control}
                    render={({ field }) =>
                        <TimeInput {...field}/>
                    }
                />
            </FormItem>
            <FormItem
                asterisk
                label="Single Checkbox"
                invalid={Boolean(errors.singleCheckbox)}
                errorMessage={errors.singleCheckbox?.message}
            >
                <Controller
                    name="singleCheckbox"
                    control={control}
                    render={({ field }) =>
                        <Checkbox {...field} />
                    }
                />
            </FormItem>
            <FormItem
                asterisk
                label="Multiple Checkbox"
                invalid={Boolean(errors.multipleCheckbox)}
                errorMessage={errors.multipleCheckbox?.message}
            >
                <Controller
                    name="multipleCheckbox"
                    control={control}
                    render={({ field }) =>
                        <Checkbox.Group {...field}>
                            <Checkbox
                                name={field.name}
                                value="Apple"
                            >
                                Apple{' '}
                            </Checkbox>
                            <Checkbox
                                name={field.name}
                                value="Banana"
                            >
                                Banana{' '}
                            </Checkbox>
                            <Checkbox
                                name={field.name}
                                value="Lemon"
                            >
                                Lemon{' '}
                            </Checkbox>
                        </Checkbox.Group>
                    }
                />
            </FormItem>
            <FormItem
                asterisk
                label="Radio"
                invalid={Boolean(errors.radio)}
                errorMessage={errors.radio?.message}
            >
                <Controller
                    name="radio"
                    control={control}
                    render={({ field }) =>
                        <Radio.Group {...field}>
                            <Radio value={'1'}>Paypal</Radio>
                            <Radio value={'2'}>Stripe</Radio>
                        </Radio.Group>
                    }
                />
            </FormItem>
            <FormItem
                asterisk
                label="Switcher"
                invalid={Boolean(errors.switcher)}
                errorMessage={errors.switcher?.message}
            >
                <Controller
                    name="switcher"
                    control={control}
                    render={({ field }) =>
                        <Switcher
                            checked={field.value}
                            onChange={checked => {
                                field.onChange(checked)
                            }}
                        />
                    }
                />
            </FormItem>
            <FormItem
                asterisk
                label="Upload"
                invalid={Boolean(errors.upload)}
                errorMessage={errors.upload?.message}
            >
                <Controller
                    name="upload"
                    control={control}
                    render={({ field }) =>
                        <Upload
                            beforeUpload={beforeUpload}
                            fileList={field.value}
                            onFileRemove={(files) =>
                                field.onChange(files)
                            }
                            onChange={(files) =>
                                field.onChange(files)
                            }
                        />
                    }
                />
            </FormItem>
            <FormItem
                asterisk
                label="Segment"
                invalid={Boolean(errors.segment)}
                errorMessage={errors.segment?.message}
            >
                <Controller
                    name="segment"
                    control={control}
                    render={({ field }) =>
                        <Segment
                            className="w-full bg-transparent dark:bg-transparent p-0"
                            selectionType="multiple"
                            {...field}
                        >
                            <div className="grid grid-cols-3 gap-4 w-full">
                                {segmentSelections.map(
                                    (segment) => (
                                        <Segment.Item
                                            key={segment.value}
                                            value={
                                                segment.value
                                            }
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
                                                            active={
                                                                active
                                                            }
                                                            disabled={
                                                                disabled
                                                            }
                                                            defaultGutter={
                                                                false
                                                            }
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
                                                                    {
                                                                        segment.value
                                                                    }
                                                                </h6>
                                                                <p>
                                                                    {
                                                                        segment.desc
                                                                    }
                                                                </p>
                                                            </div>
                                                        </PresetSegmentItemOption>
                                                    </div>
                                                )
                                            }}
                                        </Segment.Item>
                                    )
                                )}
                            </div>
                        </Segment>
                    }
                />
            </FormItem>
                <FormItem>
                    <Button
                        type="reset"
                        className="ltr:mr-2 rtl:ml-2"
                        onClick={() => reset()}
                    >
                        Reset
                    </Button>
                    <Button variant="solid" loading={isSubmitting} type="submit">
                        Submit
                    </Button>
                </FormItem>
        </Form>
    )
}

export default MixedFormControl
```
