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

// ─── RTK Query imports ────────────────────────────────────────────────
import { useGetMyBrandsQuery, useDeleteBrandMutation } from '@/services/brands'

const BrandListSelected = () => {
    // Note: This hook usage looks incorrect — useGetMyBrandsQuery doesn't return selected state.
    // You should manage selectedBrands via local state or context/Redux instead.
    // Example fix (recommended):
    // const [selectedBrands, setSelectedBrands] = useState<Brand[]>([])
    // Then pass selectedBrands & setSelectedBrands from parent or use context

    const { data: brands = [] } = useGetMyBrandsQuery()
    // Temporary placeholder — replace with real selected state
    const selectedBrands: any[] = [] // ← replace with actual selected logic

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [sendMessageDialogOpen, setSendMessageDialogOpen] = useState(false)
    const [sendMessageLoading, setSendMessageLoading] = useState(false)

    const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation()

    const handleDelete = () => {
        if (selectedBrands.length === 0) return
        setDeleteConfirmationOpen(true)
    }

    const handleConfirmDelete = async () => {
        setDeleteConfirmationOpen(false)

        const idsToDelete = selectedBrands.map((b) => b.id)

        try {
            await Promise.all(idsToDelete.map((id) => deleteBrand(id).unwrap()))

            toast.push(
                <Notification type="success">
                    {idsToDelete.length} brand
                    {idsToDelete.length !== 1 ? 's' : ''} deleted successfully
                </Notification>,
                { placement: 'top-center' },
            )

            // Clear selection
            // setSelectedBrands([])
        } catch (err) {
            console.error('Bulk delete failed:', err)
            toast.push(
                <Notification type="danger">
                    Failed to delete selected brands. Please try again.
                </Notification>,
                { placement: 'top-center' },
            )
        }
    }

    const handleSend = () => {
        setSendMessageLoading(true)
        setTimeout(() => {
            toast.push(
                <Notification type="success">
                    Message sent successfully!
                </Notification>,
                { placement: 'top-center' },
            )
            setSendMessageLoading(false)
            setSendMessageDialogOpen(false)
            // setSelectedBrands([])
        }, 800) // simulate network delay
    }

    if (selectedBrands.length === 0) return null

    return (
        <>
            <StickyFooter
                className="flex items-center justify-between py-4 bg-white dark:bg-gray-800"
                stickyClass="-mx-4 sm:-mx-8 border-t border-gray-200 dark:border-gray-700 px-8"
                defaultClass="container mx-auto px-8 rounded-xl border border-gray-200 dark:border-gray-600 mt-4"
            >
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <span className="text-lg text-primary">
                                <TbChecks />
                            </span>
                            <span className="font-semibold flex items-center gap-1">
                                <span className="heading-text">
                                    {selectedBrands.length}
                                </span>
                                <span>
                                    selected brand
                                    {selectedBrands.length !== 1 ? 's' : ''}
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
                                Delete
                            </Button>

                            <Button
                                size="sm"
                                variant="solid"
                                onClick={() => setSendMessageDialogOpen(true)}
                            >
                                Send Message
                            </Button>
                        </div>
                    </div>
                </div>
            </StickyFooter>

            <ConfirmDialog
                isOpen={deleteConfirmationOpen}
                type="danger"
                title="Delete Brands"
                onClose={() => setDeleteConfirmationOpen(false)}
                onRequestClose={() => setDeleteConfirmationOpen(false)}
                onCancel={() => setDeleteConfirmationOpen(false)}
                onConfirm={handleConfirmDelete}
                confirmButtonText="Delete"
                cancelButtonText="Cancel"
            >
                <p>
                    Are you sure you want to delete the {selectedBrands.length}{' '}
                    selected brand{selectedBrands.length !== 1 ? 's' : ''}? This
                    action cannot be undone.
                </p>
            </ConfirmDialog>

            <Dialog
                isOpen={sendMessageDialogOpen}
                onRequestClose={() => setSendMessageDialogOpen(false)}
                onClose={() => setSendMessageDialogOpen(false)}
            >
                <h5 className="mb-2">Send Message to Brands</h5>
                <p className="mb-4">
                    Your message will be sent to the following brands:
                </p>

                <Avatar.Group
                    chained
                    omittedAvatarTooltip
                    className="mt-4 mb-6"
                    maxCount={5}
                    omittedAvatarProps={{ size: 32 }}
                >
                    {selectedBrands.map((brand) => (
                        <Tooltip key={brand.id} title={brand.name}>
                            <Avatar
                                size={32}
                                src={brand.logo_url || '/default-brand.png'}
                                alt={brand.name}
                                fallback={brand.name?.[0]?.toUpperCase()}
                            />
                        </Tooltip>
                    ))}
                </Avatar.Group>

                <div className="my-4 border rounded-lg overflow-hidden">
                    <RichTextEditor content="" />
                </div>

                <div className="ltr:justify-end flex items-center gap-2 mt-6">
                    <Button
                        size="sm"
                        onClick={() => setSendMessageDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        loading={sendMessageLoading}
                        onClick={handleSend}
                    >
                        Send Message
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default BrandListSelected
