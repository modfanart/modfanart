// src/components/collections/CollectionListSelected.tsx

import { useState } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import RichTextEditor from '@/components/shared/RichTextEditor'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbChecks } from 'react-icons/tb'

import {
    useGetCollectionsQuery,
    useDeleteCollectionMutation,
    CollectionRow,
} from '@/services/api/collectionsApi'

// Adjust these types according to your real selection state management
// (usually kept in parent component or zustand / context)
type SelectedCollectionsHook = {
    selectedCollections: CollectionRow[]
    setSelectedCollections: (items: CollectionRow[]) => void
    // If you have select-all logic, add relevant fields here
}

const CollectionListSelected = ({
    selectedCollections,
    setSelectedCollections,
}: SelectedCollectionsHook) => {
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [sendMessageDialogOpen, setSendMessageDialogOpen] = useState(false)
    const [sendMessageLoading, setSendMessageLoading] = useState(false)

    const { data } = useGetCollectionsQuery(
        { owner_type: 'user', owner_id: 'current' }, // ← adjust filters
    )

    const [deleteCollection, { isLoading: isDeleting }] =
        useDeleteCollectionMutation()

    const handleDelete = () => {
        setDeleteConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDeleteConfirmationOpen(false)
    }

    const handleConfirmDelete = async () => {
        const idsToDelete = selectedCollections.map((c) => c.id)

        // Optimistic update – remove items from cache immediately
        const patchResults: Array<ReturnType<typeof deleteCollection>['undo']> =
            []

        try {
            // Optional: parallel deletes (faster but less ordered)
            // await Promise.all(idsToDelete.map(id => deleteCollection(id).unwrap()))

            // Sequential deletes (safer for showing progress / error handling)
            for (const id of idsToDelete) {
                const patchResult = deleteCollection(id, {
                    // Most important part: optimistic removal
                    onQueryStarted: async (
                        arg,
                        { dispatch, queryFulfilled },
                    ) => {
                        // Remove from list cache
                        const patch = dispatch(
                            // We patch the LIST result
                            // Adjust the query args to exactly match what useGetCollectionsQuery uses!
                            api.util.updateQueryData(
                                'getCollections',
                                { owner_type: 'user', owner_id: 'current' }, // ← must match exactly
                                (draft) => {
                                    if (draft?.collections) {
                                        draft.collections =
                                            draft.collections.filter(
                                                (item) => item.id !== arg,
                                            )
                                    }
                                },
                            ),
                        )

                        try {
                            await queryFulfilled
                            // success → keep the patch
                        } catch {
                            patch.undo() // rollback on error
                            throw new Error('Delete failed')
                        }
                    },
                }).unwrap()

                // You can collect results if needed
            }

            toast.push(
                <Notification type="success">
                    {idsToDelete.length} مجموعه با موفقیت حذف شد
                </Notification>,
                { placement: 'top-center' },
            )

            setSelectedCollections([]) // clear selection
        } catch (err) {
            toast.push(
                <Notification type="danger">
                    خطا در حذف مجموعه‌ها. لطفاً دوباره امتحان کنید.
                </Notification>,
                { placement: 'top-center' },
            )
            // rollback already handled per-item via .undo
        }

        setDeleteConfirmationOpen(false)
    }

    const handleSend = () => {
        setSendMessageLoading(true)
        setTimeout(() => {
            toast.push(
                <Notification type="success">پیام ارسال شد!</Notification>,
                { placement: 'top-center' },
            )
            setSendMessageLoading(false)
            setSendMessageDialogOpen(false)
            setSelectedCollections([])
        }, 1200) // fake delay
    }

    if (selectedCollections.length === 0) return null

    return (
        <>
            <StickyFooter
                className="flex items-center justify-between py-4 bg-white dark:bg-gray-800"
                stickyClass="-mx-4 sm:-mx-8 border-t border-gray-200 dark:border-gray-700 px-8"
                defaultClass="container mx-auto px-8 rounded-xl border border-gray-200 dark:border-gray-600 mt-4"
            >
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        <span>
                            <span className="flex items-center gap-2">
                                <span className="text-lg text-primary">
                                    <TbChecks />
                                </span>
                                <span className="font-semibold flex items-center gap-1">
                                    <span className="heading-text">
                                        {selectedCollections.length}
                                    </span>
                                    <span>مجموعه انتخاب شده</span>
                                </span>
                            </span>
                        </span>

                        <div className="flex items-center gap-3">
                            <Button
                                size="sm"
                                className="ltr:mr-3 rtl:ml-3"
                                type="button"
                                customColorClass={() =>
                                    'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error'
                                }
                                onClick={handleDelete}
                                loading={isDeleting}
                                disabled={isDeleting}
                            >
                                حذف کنید
                            </Button>
                            <Button
                                size="sm"
                                variant="solid"
                                onClick={() => setSendMessageDialogOpen(true)}
                            >
                                پیام
                            </Button>
                        </div>
                    </div>
                </div>
            </StickyFooter>

            <ConfirmDialog
                isOpen={deleteConfirmationOpen}
                type="danger"
                title="حذف مجموعه‌ها"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDelete}
                confirmButtonText="حذف"
                cancelButtonText="انصراف"
            >
                <p>
                    آیا مطمئن هستید که می‌خواهید {selectedCollections.length}{' '}
                    مجموعه را حذف کنید؟ این عملیات قابل بازگشت نیست.
                </p>
            </ConfirmDialog>

            <Dialog
                isOpen={sendMessageDialogOpen}
                onRequestClose={() => setSendMessageDialogOpen(false)}
                onClose={() => setSendMessageDialogOpen(false)}
            >
                <h5 className="mb-2">ارسال پیام به مجموعه‌ها</h5>
                <p>ارسال پیام به موارد زیر:</p>

                <Avatar.Group
                    chained
                    omittedAvatarTooltip
                    className="mt-4"
                    maxCount={5}
                    omittedAvatarProps={{ size: 32 }}
                >
                    {selectedCollections.map((col) => (
                        <Tooltip key={col.id} title={col.name}>
                            <Avatar
                                size={32}
                                src={col.cover_image_url || undefined}
                                alt={col.name}
                                fallback={col.name?.[0]?.toUpperCase()}
                            />
                        </Tooltip>
                    ))}
                </Avatar.Group>

                <div className="my-5">
                    <RichTextEditor content={''} />
                </div>

                <div className="ltr:justify-end flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => setSendMessageDialogOpen(false)}
                    >
                        لغو
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        loading={sendMessageLoading}
                        onClick={handleSend}
                    >
                        ارسال
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default CollectionListSelected
