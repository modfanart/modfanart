import fileSizeUnit from '@/utils/fileSizeUnit'
import { TbFile } from 'react-icons/tb'

export type AttatchmentProps = {
    attachments?: Array<{
        type: 'image' | 'video' | 'audio' | 'misc'
        source: File
        mediaUrl: string
    }>
}

const Attachment = ({ attachments }: AttatchmentProps) => {
    return (
        <div className="flex flex-col">
            {attachments &&
                attachments.map((attachment, index) => {
                    const key = attachment.mediaUrl + index

                    if (attachment.type === 'image') {
                        return (
                            <div key={key}>
                                <img
                                    className="rounded-xl my-2"
                                    src={attachment.mediaUrl}
                                    alt=""
                                />
                            </div>
                        )
                    }

                    if (attachment.type === 'video') {
                        return (
                            <div key={key}>
                                <a
                                    href={attachment.mediaUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <video
                                        className="rounded-xl my-2"
                                        src={attachment.mediaUrl}
                                    />
                                </a>
                            </div>
                        )
                    }

                    if (attachment.type === 'audio') {
                        return (
                            <div key={key}>
                                <audio controls>
                                    <source src={attachment.mediaUrl} />
                                    Your browser does not support the audio
                                    element.
                                </audio>
                            </div>
                        )
                    }

                    return (
                        <a
                            key={key}
                            download
                            className="flex items-center gap-2 p-2 rounded-xl border border-gray-300 dark:border-gray-600 min-w-[250px] bg-white dark:bg-gray-600 my-2 no-underline"
                            href={attachment.mediaUrl}
                        >
                            <TbFile className="text-3xl heading-text" />
                            <div>
                                <div className="heading-text font-bold">
                                    {attachment.source?.name}
                                </div>
                                <div className="heading-text">
                                    {fileSizeUnit(attachment.source?.size)}
                                </div>
                            </div>
                        </a>
                    )
                })}
        </div>
    )
}

export default Attachment
