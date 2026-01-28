import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import DebouceInput from '@/components/shared/DebouceInput'
import { useFileManagerStore } from '../store/useFileManagerStore'

const FileManagerRenameDialog = () => {
    const { renameDialog, setRenameDialog, renameFile } = useFileManagerStore()

    const [newName, setNewName] = useState('')

    const handleDialogClose = () => {
        setRenameDialog({ id: '', open: false })
    }

    const handleSubmit = () => {
        renameFile({ id: renameDialog.id, fileName: newName })
        setRenameDialog({ id: '', open: false })
    }

    return (
        <Dialog
            isOpen={renameDialog.open}
            contentClassName="mt-[50%]"
            onClose={handleDialogClose}
            onRequestClose={handleDialogClose}
        >
            <h4>تغییر نام</h4>
            <div className="mt-6">
                <DebouceInput
                    placeholder="نام جدید"
                    type="text"
                    onChange={(e) => setNewName(e.target.value)}
                />
            </div>
            <div className="mt-6 flex justify-end items-center gap-2">
                <Button size="sm" onClick={handleDialogClose}>
                    بستن
                </Button>
                <Button
                    variant="solid"
                    size="sm"
                    disabled={newName.length === 0}
                    onClick={handleSubmit}
                >
                    <span className="flex justify-center min-w-10">تایید</span>
                </Button>
            </div>
        </Dialog>
    )
}

export default FileManagerRenameDialog
