import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Upload from '@/components/ui/Upload'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import UploadMedia from '@/assets/svg/UploadMedia'
import sleep from '@/utils/sleep'

const UploadFile = () => {
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

    const handleUploadDialogClose = () => {
        setUploadDialogOpen(false)
    }

    const handleUpload = async () => {
        setIsUploading(true)
        await sleep(500)
        handleUploadDialogClose()
        setIsUploading(false)
        toast.push(
            <Notification title={'با موفقیت آپلود شد'} type="success" />,
            { placement: 'top-center' },
        )
    }

    return (
        <>
            <Button variant="solid" onClick={() => setUploadDialogOpen(true)}>
                آپلود کنید
            </Button>
            <Dialog
                isOpen={uploadDialogOpen}
                onClose={handleUploadDialogClose}
                onRequestClose={handleUploadDialogClose}
            >
                <h4>آپلود فایل ها</h4>
                <Upload
                    draggable
                    className="mt-6 bg-gray-100"
                    onChange={setUploadedFiles}
                    onFileRemove={setUploadedFiles}
                >
                    <div className="my-4 text-center">
                        <div className="text-6xl mb-4 flex justify-center">
                            <UploadMedia height={150} width={200} />
                        </div>
                        <p className="font-semibold">
                            <span className="text-gray-800 dark:text-white">
                                فایل های خود را اینجا رها کنید، یا{' '}
                            </span>
                            <span className="text-blue-500">مرور کنید</span>
                        </p>
                        <p className="mt-1 font-semibold opacity-60 dark:text-white">
                            از طریق دستگاه شما
                        </p>
                    </div>
                </Upload>
                <div className="mt-4">
                    <Button
                        block
                        loading={isUploading}
                        variant="solid"
                        disabled={uploadedFiles.length === 0}
                        onClick={handleUpload}
                    >
                        فایل 
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default UploadFile
