import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'
import Badge from '@/components/ui/Badge'
import MailDeleteConfimation from './MailDeleteConfimation'
import useResponsive from '@/utils/hooks/useResponsive'
import { useMailStore } from '../store/mailStore'
import useMailAction from '../hooks/useMailAction'
import { labelList } from '../constants'
import { TbMail, TbTrash, TbMenu2 } from 'react-icons/tb'

const MailBodyTop = () => {
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)

    const { selectedMailId, toggleMessageDialog, toggleMobileSidebar } =
        useMailStore()

    const { onMailDelete, onBatchMoveMailClick } = useMailAction()

    const { smaller } = useResponsive()

    const hasMailSelected = selectedMailId.length > 0

    const handleClose = () => {
        setDeleteConfirmationOpen(false)
    }

    const handleConfirmDelete = () => {
        onMailDelete(selectedMailId)
        handleClose()
    }

    const handleMoveMailClick = (destination: string) => {
        onBatchMoveMailClick(selectedMailId, destination)
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    {smaller.xl && (
                        <button
                            className="close-button"
                            type="button"
                            onClick={() => toggleMobileSidebar(true)}
                        >
                            <TbMenu2 />
                        </button>
                    )}
                    {hasMailSelected && (
                        <h5>{selectedMailId.length} items selected</h5>
                    )}
                </div>
                <div className="inline-flex items-center gap-2">
                    {hasMailSelected ? (
                        <>
                            <Dropdown
                                renderTitle={<Button size="sm">Move to</Button>}
                                placement="bottom-end"
                            >
                                {labelList.map((item) => (
                                    <Dropdown.Item
                                        key={item.value}
                                        onClick={() =>
                                            handleMoveMailClick(item.value)
                                        }
                                    >
                                        <Badge className={item.dotClass} />
                                        <span>{item.label}</span>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown>
                            <Button
                                size="sm"
                                type="button"
                                customColorClass={() =>
                                    'border-error ring-0 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                }
                                icon={<TbTrash />}
                                onClick={() => setDeleteConfirmationOpen(true)}
                            >
                                Delete
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="solid"
                            icon={<TbMail />}
                            size="sm"
                            onClick={() =>
                                toggleMessageDialog({
                                    open: true,
                                    mode: 'new',
                                })
                            }
                        >
                          ایمیل جدید
                        </Button>
                    )}
                </div>
            </div>
            <MailDeleteConfimation
                isOpen={deleteConfirmationOpen}
                selectedMailCount={selectedMailId.length}
                onClose={handleClose}
                onConfirmDelete={handleConfirmDelete}
            />
        </>
    )
}

export default MailBodyTop
