import { useFileManagerStore } from '../store/useFileManagerStore'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const FileManagerDeleteDialog = () => {
    const { deleteDialog, setDeleteDialog, deleteFile } = useFileManagerStore()

    const handleDeleteDialogClose = () => {
        setDeleteDialog({ id: '', open: false })
    }

    const handleDeleteConfirm = () => {
        deleteFile(deleteDialog.id)
        setDeleteDialog({ id: '', open: false })
    }

    return (
        <ConfirmDialog
            isOpen={deleteDialog.open}
            type="danger"
            title="Delete file"
            onClose={handleDeleteDialogClose}
            onRequestClose={handleDeleteDialogClose}
            onCancel={handleDeleteDialogClose}
            onConfirm={handleDeleteConfirm}
        >
            <p>
                Are you sure you want to delete file? This action can&apos;t be
                undo.{' '}
            </p>
        </ConfirmDialog>
    )
}

export default FileManagerDeleteDialog
