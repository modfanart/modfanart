import { useState } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbChecks } from 'react-icons/tb'
import { useBulkDeleteArtworksMutation } from '@/services/artworkApi'

type ArtworkListSelectedProps = {
    selectedArtworks: ArtworkListItem[] // or string[] if you only pass ids
    onClearSelection: () => void
}

const ArtworkListSelected = ({
    selectedArtworks,
    onClearSelection,
}: ArtworkListSelectedProps) => {
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)

    const [bulkDelete, { isLoading: isDeleting }] =
        useBulkDeleteArtworksMutation()

    const selectedCount = selectedArtworks.length
    const selectedIds = selectedArtworks.map((a) => a.id)

    const handleDeleteClick = () => {
        if (selectedCount === 0) return
        setDeleteConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDeleteConfirmationOpen(false)
    }

    const handleConfirmDelete = async () => {
        try {
            await bulkDelete(selectedIds).unwrap()
            onClearSelection()
            setDeleteConfirmationOpen(false)
            // Optional: success toast → "X artworks deleted successfully"
        } catch (err) {
            console.error('Bulk delete failed:', err)
            // Optional: error toast
        }
    }

    if (selectedCount === 0) return null

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
                                    {selectedCount}
                                </span>
                                <span>selected</span>
                            </span>
                        </span>

                        <div className="flex items-center gap-3">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error"
                                disabled={isDeleting}
                                onClick={handleDeleteClick}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            </StickyFooter>

            <ConfirmDialog
                isOpen={deleteConfirmationOpen}
                type="danger"
                title="Delete Artworks"
                confirmButtonText="Delete"
                cancelButtonText="Cancel"
                onClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            >
                <p>
                    Are you sure you want to delete the {selectedCount} selected{' '}
                    {selectedCount === 1 ? 'artwork' : 'artworks'}? This action
                    cannot be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default ArtworkListSelected
