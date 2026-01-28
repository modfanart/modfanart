import { useMemo } from 'react'
import Drawer from '@/components/ui/Drawer'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import CloseButton from '@/components/ui/CloseButton'
import FileIcon from '@/components/view/FileIcon'
import FileType from './FileType'
import fileSizeUnit from '@/utils/fileSizeUnit'
import { useFileManagerStore } from '../store/useFileManagerStore'
import dayjs from 'dayjs'
import moment from 'jalali-moment'
import { TbPlus } from 'react-icons/tb'
import type { ReactNode } from 'react'

type FileDetailsProps = {
    onShare: (id: string) => void
}

const InfoRow = ({
    label,
    value,
}: {
    label: string
    value: string | ReactNode
}) => {
    return (
        <div className="flex items-center justify-between">
            <span>{label}</span>
            <span className="heading-text font-bold">{value}</span>
        </div>
    )
}

const FileDetails = ({ onShare }: FileDetailsProps) => {
    const { selectedFile, setSelectedFile, fileList } = useFileManagerStore()

    const file = useMemo(() => {
        return fileList.find((file) => selectedFile === file.id)
    }, [fileList, selectedFile])

    const handleDrawerClose = () => {
        setSelectedFile('')
    }

    return (
        <Drawer
            title={null}
            closable={false}
            isOpen={Boolean(selectedFile)}
            showBackdrop={false}
            width={350}
            onClose={handleDrawerClose}
            onRequestClose={handleDrawerClose}
        >
            {file && (
                <div>
                    <div className="flex justify-end">
                        <CloseButton onClick={handleDrawerClose} />
                    </div>
                    <div className="mt-10 flex justify-center">
                        {file.fileType.startsWith('jpeg') ||
                            file.fileType.startsWith('png') ? (
                            <img
                                src={file.srcUrl}
                                className="max-h-[170px] rounded-xl"
                                alt={file.name}
                            />
                        ) : (
                            <FileIcon type={file.fileType} size={120} />
                        )}
                    </div>
                    <div className="mt-10 text-center">
                        <h4>{file.name}</h4>
                    </div>
                    <div className="mt-8">
                        <h6>اطلاعات</h6>
                        <div className="mt-4 flex flex-col gap-4">
                            <InfoRow
                                label="حجم"
                                value={fileSizeUnit(file.size)}
                            />
                            <InfoRow
                                label="نوع"
                                value={<FileType type={file.fileType} />}
                            />
                            <InfoRow
                                label="تاریخ ایجاد"
                                value={moment
                                    .unix(file.uploadDate)
                                    .locale('fa')
                                    .format('DD MMM, YYYY')}
                            />
                            <InfoRow
                                label="آخرین تغییر"
                                value={moment
                                    .unix(file.activities[0].timestamp)
                                    .locale('fa')
                                    .format('DD MMM, YYYY')}
                            />
                        </div>
                    </div>
                    <div className="mt-10">
                        <div className="flex justify-between items-center">
                            <h6>اشتراک‌گذاری با</h6>
                            <Button
                                type="button"
                                shape="circle"
                                icon={<TbPlus />}
                                size="xs"
                                onClick={() => onShare(file.id)}
                            />
                        </div>
                        <div className="mt-6 flex flex-col gap-4">
                            {file.permissions.map((user) => (
                                <div
                                    key={user.userName}
                                    className="flex items-center gap-2"
                                >
                                    <Avatar src={user.userImg} alt="" />
                                    <div>
                                        <div className="heading-text font-semibold">
                                            {user.userName}
                                        </div>
                                        <div>{user.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Drawer>
    )
}

export default FileDetails
