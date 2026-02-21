// src/pages/concepts/contests/components/ContestForm.tsx

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'
import DatePicker from '@/components/ui/DatePicker' // assume you have this or use react-datepicker
import Form, {
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'
import Upload from '@/components/shared/Upload'
import { TbPlus, TbTrash, TbCalendar, TbUpload } from 'react-icons/tb'

// ────────────────────────────────────────────────
// API Hooks
// ────────────────────────────────────────────────
import {
    useCreateContestMutation,
    useUpdateContestMutation,
    useGetContestQuery,
    Contest,
} from '@/services/api/contestApi'

// ────────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────────
const prizeSchema = z.object({
    rank: z.number().min(1, 'رتبه باید حداقل ۱ باشد'),
    amount_inr: z.number().min(0).optional(),
    type: z.enum(['cash', 'product', 'voucher', 'feature', 'other']),
    description: z.string().optional(),
})

const contestSchema = z
    .object({
        title: z.string().min(5, 'عنوان باید حداقل ۵ کاراکتر باشد').max(120),
        description: z.string().max(4000).optional(),
        rules: z.string().max(8000).optional(),
        hero_image: z.string().url().optional().nullable(),
        visibility: z.enum(['public', 'private', 'unlisted']),
        max_entries_per_user: z.number().min(1).max(50),
        start_date: z.string().min(1, 'تاریخ شروع الزامی است'),
        submission_end_date: z
            .string()
            .min(1, 'تاریخ پایان ارسال آثار الزامی است'),
        voting_end_date: z.string().optional().nullable(),
        judging_end_date: z.string().optional().nullable(),
        prizes: z
            .array(prizeSchema)
            .min(1, 'حداقل یک جایزه تعریف کنید')
            .max(10),
    })
    .refine(
        (data) =>
            new Date(data.submission_end_date) > new Date(data.start_date),
        {
            message: 'تاریخ پایان ارسال باید بعد از تاریخ شروع باشد',
            path: ['submission_end_date'],
        },
    )

type ContestFormValues = z.infer<typeof contestSchema>

interface ContestFormProps {
    mode: 'create' | 'edit'
}

const ContestForm = ({ mode }: ContestFormProps) => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const isEdit = mode === 'edit' && !!id

    const [createContest, { isLoading: creating }] = useCreateContestMutation()
    const [updateContest, { isLoading: updating }] = useUpdateContestMutation()

    const { data: contestData, isLoading: loadingContest } = useGetContestQuery(
        id!,
        {
            skip: !isEdit || !id,
        },
    )

    const form = useForm<ContestFormValues>({
        resolver: zodResolver(contestSchema),
        defaultValues: {
            title: '',
            description: '',
            rules: '',
            hero_image: null,
            visibility: 'public',
            max_entries_per_user: 3,
            start_date: '',
            submission_end_date: '',
            voting_end_date: null,
            judging_end_date: null,
            prizes: [{ rank: 1, type: 'cash', amount_inr: 5000000 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'prizes',
    })

    const heroImage = form.watch('hero_image')

    // Populate form in edit mode
    useEffect(() => {
        if (isEdit && contestData) {
            form.reset({
                title: contestData.title,
                description: contestData.description || '',
                rules: contestData.rules || '',
                hero_image: contestData.hero_image || null,
                visibility: contestData.visibility,
                max_entries_per_user: contestData.max_entries_per_user,
                start_date: contestData.start_date
                    ? format(new Date(contestData.start_date), 'yyyy-MM-dd')
                    : '',
                submission_end_date: contestData.submission_end_date
                    ? format(
                          new Date(contestData.submission_end_date),
                          'yyyy-MM-dd',
                      )
                    : '',
                voting_end_date: contestData.voting_end_date
                    ? format(
                          new Date(contestData.voting_end_date),
                          'yyyy-MM-dd',
                      )
                    : null,
                judging_end_date: contestData.judging_end_date
                    ? format(
                          new Date(contestData.judging_end_date),
                          'yyyy-MM-dd',
                      )
                    : null,
                prizes: contestData.prizes || [],
            })
        }
    }, [contestData, form, isEdit])

    const onSubmit = async (values: ContestFormValues) => {
        try {
            const payload = {
                ...values,
                start_date: new Date(values.start_date).toISOString(),
                submission_end_date: new Date(
                    values.submission_end_date,
                ).toISOString(),
                voting_end_date: values.voting_end_date
                    ? new Date(values.voting_end_date).toISOString()
                    : null,
                judging_end_date: values.judging_end_date
                    ? new Date(values.judging_end_date).toISOString()
                    : null,
            }

            if (isEdit && id) {
                await updateContest({ id, ...payload }).unwrap()
                toast.push(
                    <Notification type="success">
                        مسابقه با موفقیت به‌روزرسانی شد
                    </Notification>,
                )
            } else {
                await createContest(payload).unwrap()
                toast.push(
                    <Notification type="success">
                        مسابقه جدید با موفقیت ایجاد شد
                    </Notification>,
                )
            }

            navigate('/concepts/contests')
        } catch (err: any) {
            toast.push(
                <Notification type="danger">
                    {err?.data?.message ||
                        'خطا در ذخیره مسابقه. لطفاً دوباره تلاش کنید.'}
                </Notification>,
            )
        }
    }

    const handleHeroUpload = (file: File | null) => {
        if (!file) {
            form.setValue('hero_image', null)
            return
        }
        // In real app: upload to backend / S3 → get permanent URL
        const preview = URL.createObjectURL(file)
        form.setValue('hero_image', preview)
        // TODO: Real upload → replace preview with real URL
    }

    if (isEdit && loadingContest) {
        return (
            <div className="py-12 text-center">
                در حال بارگذاری اطلاعات مسابقه...
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h2 className="text-2xl font-bold mb-6">
                {isEdit ? 'ویرایش مسابقه' : 'ایجاد مسابقه جدید'}
            </h2>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-7"
                >
                    {/* Title */}
                    <FormItem>
                        <FormLabel>عنوان مسابقه *</FormLabel>
                        <Input
                            placeholder="مثال: بهترین طراحی پوستر نوروز ۱۴۰۵"
                            {...form.register('title')}
                        />
                        <FormMessage />
                    </FormItem>

                    {/* Hero Image */}
                    <FormItem>
                        <FormLabel>تصویر اصلی (بنر) مسابقه</FormLabel>
                        <div className="flex gap-6 items-start">
                            {heroImage ? (
                                <div className="relative">
                                    <img
                                        src={heroImage}
                                        alt="پیش‌نمایش بنر"
                                        className="w-64 h-36 object-cover rounded-lg border shadow-sm"
                                    />
                                    <Button
                                        size="xs"
                                        variant="solid"
                                        color="red"
                                        className="absolute -top-2 -right-2"
                                        icon={<TbTrash />}
                                        onClick={() =>
                                            form.setValue('hero_image', null)
                                        }
                                    />
                                </div>
                            ) : (
                                <div className="w-64 h-36 rounded-lg border-2 border-dashed flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                    <TbUpload className="text-4xl text-gray-400" />
                                </div>
                            )}

                            <Upload
                                accept="image/*"
                                onChange={handleHeroUpload}
                                showList={false}
                                draggable
                            >
                                <div className="p-4 text-center">
                                    <p>
                                        برای آپلود کلیک کنید یا فایل را رها کنید
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        PNG, JPG — حداکثر ۴ مگابایت
                                    </p>
                                </div>
                            </Upload>
                        </div>
                    </FormItem>

                    {/* Description & Rules */}
                    <FormItem>
                        <FormLabel>توضیحات مسابقه</FormLabel>
                        <Controller
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                                <RichTextEditor
                                    content={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="توضیح کامل مسابقه، موضوع، هدف و ..."
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem>
                        <FormLabel>قوانین و مقررات</FormLabel>
                        <Controller
                            name="rules"
                            control={form.control}
                            render={({ field }) => (
                                <RichTextEditor
                                    content={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="قوانین شرکت، محدودیت‌ها، نحوه داوری ..."
                                />
                            )}
                        />
                    </FormItem>

                    {/* Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormItem>
                            <FormLabel>تاریخ شروع</FormLabel>
                            <Controller
                                name="start_date"
                                control={form.control}
                                render={({ field }) => (
                                    <DatePicker
                                        value={
                                            field.value
                                                ? new Date(field.value)
                                                : null
                                        }
                                        onChange={(date) =>
                                            field.onChange(
                                                date
                                                    ? date
                                                          .toISOString()
                                                          .split('T')[0]
                                                    : '',
                                            )
                                        }
                                        placeholder="تاریخ شروع مسابقه"
                                    />
                                )}
                            />
                            <FormMessage />
                        </FormItem>

                        <FormItem>
                            <FormLabel>مهلت ارسال آثار</FormLabel>
                            <Controller
                                name="submission_end_date"
                                control={form.control}
                                render={({ field }) => (
                                    <DatePicker
                                        value={
                                            field.value
                                                ? new Date(field.value)
                                                : null
                                        }
                                        onChange={(date) =>
                                            field.onChange(
                                                date
                                                    ? date
                                                          .toISOString()
                                                          .split('T')[0]
                                                    : '',
                                            )
                                        }
                                        placeholder="آخرین مهلت ارسال"
                                    />
                                )}
                            />
                            <FormMessage />
                        </FormItem>

                        <FormItem>
                            <FormLabel>مهلت رأی‌گیری (اختیاری)</FormLabel>
                            <Controller
                                name="voting_end_date"
                                control={form.control}
                                render={({ field }) => (
                                    <DatePicker
                                        value={
                                            field.value
                                                ? new Date(field.value)
                                                : null
                                        }
                                        onChange={(date) =>
                                            field.onChange(
                                                date
                                                    ? date
                                                          .toISOString()
                                                          .split('T')[0]
                                                    : null,
                                            )
                                        }
                                        placeholder="اختیاری"
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem>
                            <FormLabel>مهلت داوری (اختیاری)</FormLabel>
                            <Controller
                                name="judging_end_date"
                                control={form.control}
                                render={({ field }) => (
                                    <DatePicker
                                        value={
                                            field.value
                                                ? new Date(field.value)
                                                : null
                                        }
                                        onChange={(date) =>
                                            field.onChange(
                                                date
                                                    ? date
                                                          .toISOString()
                                                          .split('T')[0]
                                                    : null,
                                            )
                                        }
                                        placeholder="اختیاری"
                                    />
                                )}
                            />
                        </FormItem>
                    </div>

                    {/* Prizes */}
                    <FormItem>
                        <div className="flex items-center justify-between mb-3">
                            <FormLabel>جوایز مسابقه</FormLabel>
                            <Button
                                size="sm"
                                variant="outline"
                                icon={<TbPlus />}
                                onClick={() =>
                                    append({
                                        rank: fields.length + 1,
                                        type: 'cash',
                                        amount_inr: 0,
                                    })
                                }
                            >
                                افزودن جایزه
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="border rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <FormLabel>رتبه</FormLabel>
                                        <Input
                                            type="number"
                                            {...form.register(
                                                `prizes.${index}.rank`,
                                                { valueAsNumber: true },
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FormLabel>نوع جایزه</FormLabel>
                                        <Controller
                                            name={`prizes.${index}.type`}
                                            control={form.control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={[
                                                        {
                                                            value: 'cash',
                                                            label: 'نقدی',
                                                        },
                                                        {
                                                            value: 'product',
                                                            label: 'محصول',
                                                        },
                                                        {
                                                            value: 'voucher',
                                                            label: 'کوپن/وچر',
                                                        },
                                                        {
                                                            value: 'feature',
                                                            label: 'ویژگی/انتشار',
                                                        },
                                                        {
                                                            value: 'other',
                                                            label: 'سایر',
                                                        },
                                                    ]}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FormLabel>مبلغ (تومان)</FormLabel>
                                        <Input
                                            type="number"
                                            {...form.register(
                                                `prizes.${index}.amount_inr`,
                                                { valueAsNumber: true },
                                            )}
                                            placeholder="مبلغ یا ارزش تقریبی"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            color="red"
                                            size="sm"
                                            icon={<TbTrash />}
                                            onClick={() => remove(index)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <FormMessage />
                    </FormItem>

                    {/* Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormItem>
                            <FormLabel>حداکثر ارسال هر کاربر</FormLabel>
                            <Input
                                type="number"
                                min={1}
                                max={50}
                                {...form.register('max_entries_per_user', {
                                    valueAsNumber: true,
                                })}
                            />
                        </FormItem>

                        <FormItem className="flex items-center justify-between">
                            <div>
                                <FormLabel>نمایش عمومی</FormLabel>
                                <p className="text-sm text-gray-500">
                                    اگر خاموش باشد فقط با لینک مستقیم قابل
                                    مشاهده است
                                </p>
                            </div>
                            <Controller
                                name="visibility"
                                control={form.control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value === 'public'}
                                        onChange={(checked) =>
                                            field.onChange(
                                                checked ? 'public' : 'unlisted',
                                            )
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => navigate('/concepts/contests')}
                        >
                            انصراف
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={creating || updating}
                            disabled={creating || updating}
                        >
                            {isEdit ? 'به‌روزرسانی مسابقه' : 'ایجاد مسابقه'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default ContestForm
