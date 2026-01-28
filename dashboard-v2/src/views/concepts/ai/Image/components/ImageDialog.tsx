import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Tooltip from '@/components/ui/Tooltip'
import Tag from '@/components/ui/Tag'
import sleep from '@/utils/sleep'
import { useImageGeneratorStore } from '../store/imageGeneratorStore'
import {
    TbDownload,
    TbHeart,
    TbHeartFilled,
    TbAlertTriangle,
} from 'react-icons/tb'

const ImageDialog = () => {
    const { imageDialog, setImageDialog } = useImageGeneratorStore()

    const [liked, setLiked] = useState(false)

    const handleDialogClose = async () => {
        setImageDialog({
            open: false,
            props: imageDialog.props,
        })
        await sleep(200)
        setImageDialog({
            open: false,
            props: {},
        })
        setLiked(false)
    }

    const downloadFile = () => {
        const fileSegment = imageDialog.props.image?.split('/') as string[]
        const fileName = fileSegment[fileSegment?.length - 1]
        const link = document.createElement('a')
        link.href = imageDialog.props.image || ''
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
    }

    return (
        <Dialog
            isOpen={imageDialog.open}
            width={900}
            onClose={handleDialogClose}
            onRequestClose={handleDialogClose}
        >
            <div className="flex flex-col md:flex-row gap-4">
                <div className="md:max-w-[400px]">
                    <img
                        className="rounded-xl"
                        src={imageDialog.props.image}
                        alt={imageDialog.props.prompt}
                    />
                </div>
                <div className="flex flex-col justify-between flex-1 gap-4">
                    <div className="mt-2">
                        <h5 className="font-bold">پرامپت</h5>
                        <p className="mt-4">{imageDialog.props.prompt}</p>
                        <div className="inline-flex gap-2 mt-6">
                            <Tag>اندازه: {imageDialog.props.size}</Tag>
                            <Tag>نسبت: {imageDialog.props.ratio}</Tag>
                            {imageDialog.props.type === 'existing' && (
                                <Tag>{imageDialog.props.like || 0} لایک</Tag>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Tooltip title="دانلود">
                            <Button
                                icon={<TbDownload />}
                                shape="circle"
                                size="sm"
                                onClick={downloadFile}
                            />
                        </Tooltip>
                        {imageDialog.props.type === 'existing' && (
                            <Tooltip
                                title={
                                    <div className="w-12 text-center">
                                        {liked ? 'پسندیده نشد' : 'پسندیدن'}
                                    </div>
                                }
                            >
                                <Button
                                    icon={
                                        liked ? (
                                            <TbHeartFilled className="text-pink-500" />
                                        ) : (
                                            <TbHeart />
                                        )
                                    }
                                    shape="circle"
                                    size="sm"
                                    onClick={() => setLiked(!liked)}
                                />
                            </Tooltip>
                        )}
                        <Tooltip title="گزارش">
                            <Button
                                icon={<TbAlertTriangle />}
                                shape="circle"
                                size="sm"
                            />
                        </Tooltip>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default ImageDialog
