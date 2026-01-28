import { useRef } from 'react'
import Dropdown from '@/components/ui/Dropdown'
import EllipsisButton from '@/components/shared/EllipsisButton'
import {
    TbCloudDownload,
    TbPencil,
    TbUserPlus,
    TbTrash,
    TbFolderSymlink,
} from 'react-icons/tb'
import type { DropdownItemCallbackProps } from '../types'
import type { DropdownRef } from '@/components/ui/Dropdown'
import type { MouseEvent, SyntheticEvent } from 'react'

type FileItemDropdownProps = DropdownItemCallbackProps

const FileItemDropdown = (props: FileItemDropdownProps) => {
    const { onDelete, onShare, onRename, onDownload, onOpen } = props

    const dropdownRef = useRef<DropdownRef>(null)

    const handleDropdownClick = (e: MouseEvent) => {
        e.stopPropagation()
        dropdownRef.current?.handleDropdownOpen()
    }

    const handleDropdownItemClick = (
        e: SyntheticEvent,
        callback?: () => void,
    ) => {
        e.stopPropagation()
        callback?.()
    }

    return (
        <Dropdown
            ref={dropdownRef}
            renderTitle={<EllipsisButton onClick={handleDropdownClick} />}
            placement="bottom-end"
        >
            {onOpen && (
                <Dropdown.Item
                    eventKey="Open"
                    onClick={(e) => handleDropdownItemClick(e, onOpen)}
                >
                    <TbFolderSymlink className="text-xl" />
                    <span>باز کردن</span>
                </Dropdown.Item>
            )}
            <Dropdown.Item
                eventKey="download"
                onClick={(e) => handleDropdownItemClick(e, onDownload)}
            >
                <TbCloudDownload className="text-xl" />
                <span>دانلود</span>
            </Dropdown.Item>
            <Dropdown.Item
                eventKey="rename"
                onClick={(e) => handleDropdownItemClick(e, onRename)}
            >
                <TbPencil className="text-xl" />
                <span>ویرایش نام</span>
            </Dropdown.Item>
            <Dropdown.Item
                eventKey="share"
                onClick={(e) => handleDropdownItemClick(e, onShare)}
            >
                <TbUserPlus className="text-xl" />
                <span>اشتراک گذاری</span>
            </Dropdown.Item>
            <Dropdown.Item
                eventKey="share"
                onClick={(e) => handleDropdownItemClick(e, onDelete)}
            >
                <span className="flex items-center gap-2 text-error">
                    <TbTrash className="text-xl" />
                    <span>حذف</span>
                </span>
            </Dropdown.Item>
        </Dropdown>

    )
}

export default FileItemDropdown
