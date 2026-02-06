import { useState } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useRolePermissionsStore } from '../store/rolePermissionsStore'
import { TbChecks } from 'react-icons/tb'
import type { MutateRolesPermissionsUsersResponse, Users } from '../types'

type RolesPermissionsUserSelectedProps = {
    mutate: MutateRolesPermissionsUsersResponse
    userList: Users
    userListTotal: number
}

const RolesPermissionsUserSelected = ({
    mutate,
    userList,
    userListTotal,
}: RolesPermissionsUserSelectedProps) => {
    const { selectedUser, setSelectAllUser } = useRolePermissionsStore()

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)

    const handleDelete = () => {
        setDeleteConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDeleteConfirmationOpen(false)
    }

    const handleConfirmDelete = () => {
        const newUserList = userList.filter((user) => {
            return !selectedUser.some((selected) => selected.id === user.id)
        })
        setSelectAllUser([])
        mutate(
            { list: newUserList, total: userListTotal - selectedUser.length },
            false,
        )
        setDeleteConfirmationOpen(false)
    }

    return (
        <>
            {selectedUser.length > 0 && (
                <StickyFooter
                    className="-mx-8 flex items-center justify-between py-4 bg-white dark:bg-gray-800"
                    stickyClass="border-t border-gray-200 dark:border-gray-700 px-8"
                    defaultClass="container mx-auto px-8 rounded-xl border border-gray-200 dark:border-gray-600 mt-4"
                >
                    <div className="container mx-auto">
                        <div className="flex items-center justify-between">
                            <span>
                                {selectedUser.length > 0 && (
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg text-primary">
                                            <TbChecks />
                                        </span>
                                        <span className="font-semibold flex items-center gap-1">
                                            <span className="heading-text">
                                                {selectedUser.length} کاربران
                                            </span>
                                            <span>انتخاب شده است</span>
                                        </span>
                                    </span>
                                )}
                            </span>

                            <div className="flex items-center">
                                <Button
                                    size="sm"
                                    className="ltr:mr-3 rtl:ml-3"
                                    type="button"
                                    customColorClass={() =>
                                        'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error'
                                    }
                                    onClick={handleDelete}
                                >
                                    حذف
                                </Button>
                            </div>
                        </div>
                    </div>
                </StickyFooter>
            )}
            <ConfirmDialog
                isOpen={deleteConfirmationOpen}
                type="danger"
                title="حذف کاربران"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDelete}
            >
                <p>
                    {''}
                    آیا مطمئن هستید که می خواهید این کاربران را حذف کنید؟ این اقدام
                    قابل واگرد نیست.{' '}
                </p>
            </ConfirmDialog>
        </>
    )
}

export default RolesPermissionsUserSelected
