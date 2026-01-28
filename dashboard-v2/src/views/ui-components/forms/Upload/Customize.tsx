import Upload from '@/components/ui/Upload'
import Button from '@/components/ui/Button'
import { HiOutlineCloudUpload } from 'react-icons/hi'
import { FcImageFile } from 'react-icons/fc'

const Customize = () => {
    return (
        <div>
            <div className="mb-4">
                <Upload>
                    <Button variant="solid" icon={<HiOutlineCloudUpload />}>
                        فایل خود را بارگذاری کنید
                    </Button>
                </Upload>
            </div>
            <div>
                <Upload draggable>
                    <div className="my-16 text-center">
                        <div className="text-6xl mb-4 flex justify-center">
                            <FcImageFile />
                        </div>
                        <p className="font-semibold">
                            <span className="text-gray-800 dark:text-white">
                                تصویر خود را اینجا بکشید یا{' '}
                            </span>
                            <span className="text-blue-500">مرور کنید</span>
                        </p>
                        <p className="mt-1 opacity-60 dark:text-white">
                            فرمت‌های پشتیبانی‌شده: jpeg، png، gif
                        </p>
                    </div>
                </Upload>
            </div>
        </div>
    )
}

export default Customize
