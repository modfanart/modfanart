import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Switcher from '@/components/ui/Switcher'
import Checkbox from '@/components/ui/Checkbox'
import DatePicker from '@/components/ui/DatePicker'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { FormItem, Form } from '@/components/ui/Form'
import useResponsive from '@/utils/hooks/useResponsive'
import dayjs from 'dayjs'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

type FormSchema = {
    name: string
    content: string
    dueDate?: number
    notification?: string[]
    active?: boolean
}

const validationSchema: ZodType<FormSchema> = z.object({
    name: z.string().min(1, { message: 'نام الزامی است' }),
    content: z.string().min(1, { message: 'محتوا الزامی است' }),
})

type ProjectDetailBase = {
    name: string
    content: string
    dueDate: number
}

type ProjectDetailsSettingProps = {
    onUpdate: (values: ProjectDetailBase) => void
} & ProjectDetailBase

const ProjectDetailsSetting = ({
    name,
    content,
    dueDate,
    onUpdate,
}: ProjectDetailsSettingProps) => {
    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<FormSchema>({
        defaultValues: {
            name,
            content,
            dueDate,
            notification: ['ایمیل'],
            active: true,
        },
        resolver: zodResolver(validationSchema),
    })

    const { smaller } = useResponsive()

    const onSubmit = ({ name, content, dueDate }: FormSchema) => {
        onUpdate({
            name,
            content,
            dueDate: dueDate as number,
        })
    }

    return (
        <Form
            layout={smaller.lg ? 'vertical' : 'horizontal'}
            labelWidth={250}
            onSubmit={handleSubmit(onSubmit)}
        >
            <FormItem
                label="نام پروژه"
                invalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
            >
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <Input
                            autoComplete="off"
                            placeholder="ایمیل"
                            {...field}
                        />
                    )}
                />
            </FormItem>
            <FormItem
                label="شرح پروژه"
                invalid={Boolean(errors.content)}
                errorMessage={errors.content?.message}
                className="items-start"
            >
                <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                        <RichTextEditor
                            content={field.value}
                            invalid={Boolean(errors.content)}
                            onChange={({ html }) => {
                                field.onChange(html)
                            }}
                        />
                    )}
                />
            </FormItem>
            <FormItem
                label="تاریخ سررسید پروژه"
                invalid={Boolean(errors.dueDate)}
                errorMessage={errors.dueDate?.message}
            >
                <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                        <DatePicker
                            {...field}
                            value={dayjs.unix(field.value as number).toDate()}
                            onChange={(date) =>
                                field.onChange(dayjs(date).unix())
                            }
                        />
                    )}
                />
            </FormItem>
            <FormItem label="اطلاع رسانی">
                <Controller
                    name="notification"
                    control={control}
                    render={({ field }) => (
                        <Checkbox.Group
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                        >
                            {['ایمیل', 'اعلان فشاری'].map(
                                (notification) => (
                                    <Checkbox
                                        key={notification}
                                        value={notification}
                                    >
                                        {notification}
                                    </Checkbox>
                                ),
                            )}
                        </Checkbox.Group>
                    )}
                />
            </FormItem>
            <FormItem label="وضعیت">
                <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center gap-2">
                            <Switcher
                                checked={field.value}
                                onChange={(val) => field.onChange(!val)}
                            />
                            <span className="font-semibold">
                                {field.value ? 'فعال' : 'غیر فعال'}
                            </span>
                        </div>
                    )}
                />
            </FormItem>
            <div className="flex justify-end">
                <Button type="submit" variant="solid">
                    به روز رسانی
                </Button>
            </div>
        </Form>
    )
}

export default ProjectDetailsSetting
