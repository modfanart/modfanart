import { useMemo } from 'react'
import Table from '@/components/ui/Table'
import FileSegment from './FileSegment'
import FileRow from './FileRow'
import type { Files, Layout } from '../types'

type FileListProps = {
    fileList: Files
    layout: Layout
    onRename: (id: string) => void
    onDownload: () => void
    onShare: (id: string) => void
    onDelete: (id: string) => void
    onOpen: (id: string) => void
    onClick: (id: string) => void
}

const { TBody, THead, Th, Tr } = Table

const FileList = (props: FileListProps) => {
    const {
        layout,
        fileList,
        onDelete,
        onDownload,
        onShare,
        onRename,
        onOpen,
        onClick,
    } = props

    const folders = useMemo(() => {
        return fileList.filter((file) => file.fileType === 'directory')
    }, [fileList])

    const files = useMemo(() => {
        return fileList.filter((file) => file.fileType !== 'directory')
    }, [fileList])

    const renderFileSegment = (list: Files, isFolder?: boolean) => (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-4 gap-4 lg:gap-6">
            {list.map((file) => (
                <FileSegment
                    key={file.id}
                    fileType={file.fileType}
                    size={file.size}
                    name={file.name}
                    onClick={() => onClick(file.id)}
                    onDownload={onDownload}
                    onShare={() => onShare(file.id)}
                    onDelete={() => onDelete(file.id)}
                    onRename={() => onRename(file.id)}
                    {...(isFolder ? { onOpen: () => onOpen(file.id) } : {})}
                />
            ))}
        </div>
    )

    const renderFileRow = (list: Files, isFolder?: boolean) => (
        <Table className="mt-4">
            <THead>
                <Tr>
                    <Th>فایل</Th>
                    <Th>سایز</Th>
                    <Th>تایپ</Th>
                    <Th></Th>
                </Tr>
            </THead>
            <TBody>
                {list.map((file) => (
                    <FileRow
                        key={file.id}
                        fileType={file.fileType}
                        size={file.size}
                        name={file.name}
                        onClick={() => onClick(file.id)}
                        onDownload={onDownload}
                        onShare={() => onShare(file.id)}
                        onDelete={() => onDelete(file.id)}
                        onRename={() => onRename(file.id)}
                        {...(isFolder ? { onOpen: () => onOpen(file.id) } : {})}
                    />
                ))}
            </TBody>
        </Table>
    )

    return (
        <div>
            {folders.length > 0 && (
                <div>
                    <h4>فولدر</h4>
                    {layout === 'grid' && renderFileSegment(folders, true)}
                    {layout === 'list' && renderFileRow(folders, true)}
                </div>
            )}
            {files.length > 0 && (
                <div className="mt-8">
                    <h4>فایل</h4>
                    {layout === 'grid' && renderFileSegment(files)}
                    {layout === 'list' && renderFileRow(files)}
                </div>
            )}
        </div>
    )
}

export default FileList
