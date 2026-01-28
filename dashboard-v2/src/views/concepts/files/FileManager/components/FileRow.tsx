import Table from '@/components/ui/Table'
import FileType from './FileType'
import FileItemDropdown from './FileItemDropdown'
import fileSizeUnit from '@/utils/fileSizeUnit'
import FileIcon from '@/components/view/FileIcon'
import type { BaseFileItemProps } from '../types'

type FileRowProps = BaseFileItemProps

const { Tr, Td } = Table

const FileRow = (props: FileRowProps) => {
    const { fileType, size, name, onClick, ...rest } = props

    return (
        <Tr>
            <Td width="70%">
                <div
                    className="inline-flex items-center gap-2 cursor-pointer group"
                    role="button"
                    onClick={onClick}
                >
                    <div className="text-3xl">
                        <FileIcon type={fileType || ''} />
                    </div>
                    <div className="font-bold heading-text group-hover:text-primary">
                        {name}
                    </div>
                </div>
            </Td>
            <Td>{fileSizeUnit(size || 0)}</Td>
            <Td>
                <FileType type={fileType || ''} />
            </Td>
            <Td>
                <div className="flex justify-end">
                    <FileItemDropdown {...rest} />
                </div>
            </Td>
        </Tr>
    )
}

export default FileRow
