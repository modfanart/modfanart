// src/pages/admin/roles/components/RoleList.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/shared/DataTable'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { TbPencil, TbTrash, TbPlus } from 'react-icons/tb'

import {
    useGetAllRolesQuery,
    useDeleteRoleMutation,
    Role,
} from '@/services/api/rolesApi'

import type { ColumnDef } from '@/components/shared/DataTable'

const RoleList = () => {
    const navigate = useNavigate()

    const { data: roles = [], isLoading, isFetching } = useGetAllRolesQuery()

    const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation()

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

    const handleDeleteClick = (role: Role) => {
        if (role.is_system) {
            toast.push(
                <Notification type="warning">
                    نقش‌های سیستمی قابل حذف نیستند
                </Notification>,
                { placement: 'top-center' },
            )
            return
        }
        setRoleToDelete(role)
        setDeleteConfirmOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!roleToDelete) return

        try {
            await deleteRole(roleToDelete.id).unwrap()
            toast.push(
                <Notification type="success">
                    نقش «{roleToDelete.name}» با موفقیت حذف شد
                </Notification>,
                { placement: 'top-center' },
            )
        } catch (err: any) {
            toast.push(
                <Notification type="danger">
                    {err?.data?.message || 'خطا در حذف نقش'}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setDeleteConfirmOpen(false)
            setRoleToDelete(null)
        }
    }

    const columns: ColumnDef<Role>[] = [
        {
            header: 'نام نقش',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.original.name}
                    {row.original.is_system && (
                        <Tag className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            سیستمی
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            header: 'سطح سلسله‌مراتب',
            accessorKey: 'hierarchy_level',
            cell: ({ getValue }) => (
                <span className="font-mono">{getValue() as number}</span>
            ),
        },
        {
            header: 'تعداد مجوزها',
            accessorKey: 'permissions',
            cell: ({ row }) => {
                const count = Object.keys(row.original.permissions || {}).length
                return <span>{count} مجوز</span>
            },
        },
        {
            header: 'ایجاد شده در',
            accessorKey: 'created_at',
            cell: ({ getValue }) => {
                const date = new Date(getValue() as string)
                return date.toLocaleDateString('fa-IR')
            },
        },
        {
            header: 'عملیات',
            id: 'actions',
            cell: ({ row }) => {
                const role = row.original
                return (
                    <div className="flex items-center gap-3">
                        <Tooltip title="ویرایش نقش">
                            <Button
                                size="sm"
                                variant="ghost"
                                icon={<TbPencil />}
                                onClick={() =>
                                    navigate(`/admin/roles/edit/${role.id}`)
                                }
                            />
                        </Tooltip>

                        {!role.is_system && (
                            <Tooltip title="حذف نقش">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    color="red"
                                    icon={<TbTrash />}
                                    onClick={() => handleDeleteClick(role)}
                                    loading={isDeleting}
                                    disabled={isDeleting}
                                />
                            </Tooltip>
                        )}
                    </div>
                )
            },
        },
    ]

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">نقش‌ها و دسترسی‌ها</h3>
                <Button
                    variant="solid"
                    icon={<TbPlus />}
                    onClick={() => navigate('/admin/roles/create')}
                >
                    نقش جدید
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={roles}
                loading={isLoading || isFetching}
                noData={!isLoading && roles.length === 0}
                skeletonRows={6}
            />

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                type="danger"
                title="حذف نقش"
                onClose={() => setDeleteConfirmOpen(false)}
                onRequestClose={() => setDeleteConfirmOpen(false)}
                onCancel={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                confirmButtonText="حذف"
                cancelButtonText="انصراف"
            >
                <p>
                    آیا مطمئن هستید که می‌خواهید نقش{' '}
                    <strong>{roleToDelete?.name}</strong> را حذف کنید؟
                    <br />
                    این عملیات قابل بازگشت نیست.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default RoleList
