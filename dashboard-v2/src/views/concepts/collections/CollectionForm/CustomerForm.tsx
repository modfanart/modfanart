// src/pages/concepts/collections/components/CollectionForm.tsx

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Switch from '@/components/ui/Switch'
import Form, {
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/Form'
import RichTextEditor from '@/components/shared/RichTextEditor'
import Upload from '@/components/shared/Upload'
import Avatar from '@/components/ui/Avatar'
import { TbUpload, TbX } from 'react-icons/tb'

// ────────────────────────────────────────────────
// API Hooks
// ────────────────────────────────────────────────
import {
    useCreateCollectionMutation,
    useGetCollectionQuery,
    useUpdateCollectionMutation,
    CollectionRow,
} from '@/services/api/collectionApi'

// ────────────────────────────────────────────────
// Schema & Types
// ────────────────────────────────────────────────
const collectionSchema = z.object({
    name: z.string().min(2, 'نام مجموعه باید حداقل ۲ کاراکتر باشد').max(100),
    description: z.string().max(2000).optional().nullable(),
    is_public: z.boolean().default(true),
    cover_image_url: z.string().url().optional().nullable(),
})

type CollectionFormValues = z.infer<typeof collectionSchema>

interface CollectionFormProps {
    mode: 'create' | 'edit'
}

const CollectionForm = ({ mode }: CollectionFormProps) => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>() // only used in edit mode

    const isEditMode = mode === 'edit' && !!id

    // ────────────────────────────────────────────────
    // API Mutations & Queries
    // ────────────────────────────────────────────────
    const [createCollection, { isLoading: isCreating }] =
        useCreateCollectionMutation()
    const [updateCollection, { isLoading: isUpdating }] =
        useUpdateCollectionMutation()

    const { data: existingCollection, isLoading: isLoadingCollection } =
        useGetCollectionQuery(id!, {
            skip: !isEditMode || !id,
        })

    // ────────────────────────────────────────────────
    // Form Setup
    // ────────────────────────────────────────────────
    const form = useForm<CollectionFormValues>({
        resolver: zodResolver(collectionSchema),
        defaultValues: {
            name: '',
            description: '',
            is_public: true,
            cover_image_url: null,
        },
    })

    const { reset, setValue, watch } = form

    const coverImage = watch('cover_image_url')

    // Populate form when editing
    useEffect(() => {
        if (isEditMode && existingCollection?.collection) {
            const coll = existingCollection.collection
            reset({
                name: coll.name,
                description: coll.description ?? '',
                is_public: coll.is_public,
                cover_image_url: coll.cover_image_url,
            })
        }
    }, [existingCollection, reset, isEditMode])

    // ────────────────────────────────────────────────
    // Handlers
    // ────────────────────────────────────────────────
    const onSubmit = async (values: CollectionFormValues) => {
        try {
            if (isEditMode && id) {
                // Update
                await updateCollection({
                    id,
                    ...values,
                }).unwrap()

                toast.push(
                    <Notification type="success" title="به‌روزرسانی موفق">
                        مجموعه با موفقیت ویرایش شد
                    </Notification>,
                    { placement: 'top-center' },
                )
            } else {
                // Create
                await createCollection({
                    ...values,
                    owner_type: 'user', // ← adjust if brand context
                    owner_id: 'current', // ← backend should resolve "current" or use real user id
                }).unwrap()

                toast.push(
                    <Notification type="success" title="ایجاد موفق">
                        مجموعه جدید با موفقیت ایجاد شد
                    </Notification>,
                    { placement: 'top-center' },
                )
            }

            navigate('/concepts/collections')
        } catch (err: any) {
            console.error(err)
            toast.push(
                <Notification type="danger" title="خطا">
                    {err?.data?.message ||
                        'عملیات با خطا مواجه شد. لطفاً دوباره تلاش کنید.'}
                </Notification>,
                { placement: 'top-center' },
            )
        }
    }

    const handleCoverUpload = (file: File | null) => {
        if (!file) {
            setValue('cover_image_url', null)
            return
        }

        // In real app → upload to your storage (S3 / Cloudinary / backend)
        // Here we simulate with object URL for preview
        const previewUrl = URL.createObjectURL(file)
        setValue('cover_image_url', previewUrl)

        // TODO: Real upload logic
        // uploadFile(file).then(url => setValue('cover_image_url', url))
    }

    const removeCover = () => {
        setValue('cover_image_url', null)
    }

    // ────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────
    if (isEditMode && isLoadingCollection) {
        return (
            <div className="py-12 text-center">
                در حال بارگذاری اطلاعات مجموعه...
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h2 className="text-2xl font-bold mb-6">
                {isEditMode ? 'ویرایش مجموعه' : 'ایجاد مجموعه جدید'}
            </h2>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {/* Name */}
                    <FormItem>
                        <FormLabel>نام مجموعه *</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="مثال: آثار مورد علاقه ۲۰۲۵"
                                {...form.register('name')}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>

                    {/* Cover Image */}
                    <FormItem>
                        <FormLabel>تصویر کاور (اختیاری)</FormLabel>
                        <div className="flex items-start gap-6">
                            <div className="shrink-0">
                                {coverImage ? (
                                    <div className="relative group">
                                        <Avatar
                                            size={120}
                                            shape="square"
                                            src={coverImage}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg"
                                        />
                                        <Button
                                            size="xs"
                                            variant="solid"
                                            color="red"
                                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            icon={<TbX />}
                                            onClick={removeCover}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-[120px] h-[120px] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                        <TbUpload className="text-3xl text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <Upload
                                    accept="image/*"
                                    onChange={(file) => handleCoverUpload(file)}
                                    showList={false}
                                    draggable
                                >
                                    <div className="text-center p-4">
                                        <p className="font-semibold">
                                            کلیک کنید یا فایل را اینجا رها کنید
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            PNG, JPG, WEBP تا حداکثر ۵ مگابایت
                                        </p>
                                    </div>
                                </Upload>
                            </div>
                        </div>
                        <FormMessage />
                    </FormItem>

                    {/* Description */}
                    <FormItem>
                        <FormLabel>توضیحات مجموعه</FormLabel>
                        <FormControl>
                            <RichTextEditor
                                content={form.watch('description') || ''}
                                onChange={(html) =>
                                    form.setValue('description', html || null)
                                }
                                placeholder="درباره این مجموعه چه چیزی می‌خواهید بگویید..."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>

                    {/* Visibility Toggle */}
                    <FormItem className="flex items-center justify-between py-4">
                        <div>
                            <FormLabel>مجموعه عمومی باشد؟</FormLabel>
                            <p className="text-sm text-gray-500">
                                اگر عمومی باشد، دیگران می‌توانند آن را ببینند و
                                آثار شما را در آن مشاهده کنند.
                            </p>
                        </div>
                        <FormControl>
                            <Switch
                                checked={form.watch('is_public')}
                                onChange={(checked) =>
                                    form.setValue('is_public', checked)
                                }
                            />
                        </FormControl>
                    </FormItem>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => navigate('/concepts/collections')}
                        >
                            انصراف
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isCreating || isUpdating}
                            disabled={isCreating || isUpdating}
                        >
                            {isEditMode ? 'به‌روزرسانی مجموعه' : 'ایجاد مجموعه'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default CollectionForm
