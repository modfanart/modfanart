import FileItemDropdown from './FileItemDropdown'
import fileSizeUnit from '@/utils/fileSizeUnit'
import MediaSkeleton from '@/components/shared/loaders/MediaSkeleton'
import FileIcon from '@/components/view/FileIcon'
import type { BaseFileItemProps } from '../types'

type FileSegmentProps = BaseFileItemProps

const FileSegment = (props: FileSegmentProps) => {
    const { fileType, size, name, onClick, loading, ...rest } = props

    return (
        <div
            className="bg-white rounded-2xl dark:bg-gray-800 border border-gray-200 dark:border-transparent py-4 px-3.5 flex items-center justify-between gap-2 transition-all hover:shadow-[0_0_1rem_0.25rem_rgba(0,0,0,0.04),0px_2rem_1.5rem_-1rem_rgba(0,0,0,0.12)] cursor-pointer"
            role="button"
            onClick={onClick}
        >
            {loading ? (
                <MediaSkeleton
                    avatarProps={{
                        width: 33,
                        height: 33,
                    }}
                />
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <div className="text-3xl">
                            <FileIcon type={fileType || ''} />
                        </div>
                        <div>
                            <div className="font-bold heading-text">{name}</div>
                            <span className="text-xs">
                                {fileSizeUnit(size || 0)}
                            </span>
                        </div>
                    </div>
                    <FileItemDropdown {...rest} />
                </>
            )}
        </div>
    )
}

export default FileSegment
