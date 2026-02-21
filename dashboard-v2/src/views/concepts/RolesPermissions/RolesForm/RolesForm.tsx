// src/pages/admin/roles/components/RolesForm.tsx

import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from '@/components/ui/toast'
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

import {
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useGetAllRolesQuery,
    Role,
} from '@/services/api/rolesApi'

// ────────────────────────────────────────────────
// Permissions – you should maintain this list in one place
// (can later come from backend or separate constant file)
// ────────────────────────────────────────────────
const availablePermissions = [
    { key: 'users:read', label: 'مشاهده کاربران' },
    { key: 'users:write', label: 'ویرایش کاربران' },
    { key: 'users:delete', label: 'حذف کاربران' },
    { key: 'roles:manage', label: 'مدیریت نقش‌ها' },
    { key: 'brands:verify', label: 'تأیید برندها' },
    { key: 'contests:manage', label: 'مدیریت مسابقات' },
    { key: 'artworks:moderate', label: 'بررسی آثار' },
    { key: 'reports:resolve', label: 'حل گزارش‌ها' },
    { key: 'analytics:view', label: 'مشاهده آمار' },
    // Add more as needed...
]

const roleSchema = z.object({
    name: z.string().min(3, 'نام نقش باید حداقل ۳ کاراکتر باشد').max(50),
    hierarchy_level: z.number().min(0).max(100),
    permissions: z.record(z.boolean()).optional().default({}),
})

type RoleFormValues = z.infer<typeof roleSchema>

interface RolesFormProps {
    mode: 'create' | 'edit'
}

const RolesForm = ({ mode }: RolesFormProps) => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const isEdit = mode === 'edit' && !!id

    const { data: roles } = useGetAllRolesQuery()

    const [createRole, { isLoading: creating }] = useCreateRoleMutation()
    const [updateRole, { isLoading: updating }] = useUpdateRoleMutation()

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: '',
            hierarchy_level: 10,
            permissions: {},
        },
    })

    const { reset, watch, setValue } = form

    const currentHierarchy = watch('hierarchy_level')

    // Load existing role data in edit mode
    useEffect(() => {
        if (isEdit && roles) {
            const role = roles.find((r) => r.id === id)
            if (role) {
                reset({
                    name: role.name,
                    hierarchy_level: role.hierarchy_level,
                    permissions: role.permissions || {},
                })
            }
        }
    }, [id, roles, reset, isEdit])

    const onSubmit = async (values: RoleFormValues) => {
        try {
            if (isEdit && id) {
                await updateRole({ id, ...values }).unwrap()
                toast.push(
                    <Notification type="success">
                        نقش با موفقیت به‌روزرسانی شد
                    </Notification>,
                )
            } else {
                await createRole(values).unwrap()
                toast.push(
                    <Notification type="success">
                        نقش جدید با موفقیت ایجاد شد
                    </Notification>,
                )
            }
            navigate('/admin/roles')
        } catch (err: any) {
            toast.push(
                <Notification type="danger">
                    {err?.data?.message || 'خطا در ذخیره نقش'}
                </Notification>,
            )
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h2 className="text-2xl font-bold mb-6">
                {isEdit ? 'ویرایش نقش' : 'ایجاد نقش جدید'}
            </h2>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {/* Name */}
                    <FormItem>
                        <FormLabel>نام نقش *</FormLabel>
                        <Input
                            placeholder="مثال: مدیر محتوا، ناظر آثار، ..."
                            {...form.register('name')}
                        />
                        <FormMessage />
                    </FormItem>

                    {/* Hierarchy Level */}
                    <FormItem>
                        <FormLabel>سطح سلسله‌مراتب (Hierarchy Level)</FormLabel>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                className="w-32"
                                {...form.register('hierarchy_level', {
                                    valueAsNumber: true,
                                })}
                            />
                            <div className="text-sm text-gray-500">
                                سطح بالاتر = دسترسی بیشتر (بالاتر از سطح فعلی
                                قابل مدیریت نیست)
                            </div>
                        </div>
                        <FormMessage />
                    </FormItem>

                    {/* Permissions Grid */}
                    <FormItem>
                        <FormLabel>مجوزها</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                            {availablePermissions.map((perm) => (
                                <div
                                    key={perm.key}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="font-medium">
                                        {perm.label}
                                    </span>
                                    <Switch
                                        checked={
                                            !!watch(`permissions.${perm.key}`)
                                        }
                                        onChange={(checked) =>
                                            setValue(
                                                `permissions.${perm.key}`,
                                                checked,
                                                { shouldDirty: true },
                                            )
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </FormItem>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => navigate('/admin/roles')}
                        >
                            انصراف
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={creating || updating}
                            disabled={creating || updating}
                        >
                            {isEdit ? 'به‌روزرسانی نقش' : 'ایجاد نقش'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default RolesForm
