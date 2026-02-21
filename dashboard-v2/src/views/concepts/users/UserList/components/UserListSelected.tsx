// src/features/users/components/UserListSelected.tsx
import { useState } from 'react'
import StickyFooter from '@/components/shared/StickyFooter'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import RichTextEditor from '@/components/shared/RichTextEditor'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbChecks } from 'react-icons/tb'

import {
    useBulkDeleteUsersMutation,
    useBulkSendMessageMutation,
} from '@/services/userApi'

import type { UserProfile } from '@/services/userApi'

type UserListSelectedProps = {
    selectedUsers: UserProfile[]
    onClearSelection: () => void
}

const UserListSelected = ({
    selectedUsers,
    onClearSelection,
}: UserListSelectedProps) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [messageDialogOpen, setMessageDialogOpen] = useState(false)
    const [messageContent, setMessageContent] = useState('')
    const [isSending, setIsSending] = useState(false)

    const [bulkDelete, { isLoading: isDeleting }] = useBulkDeleteUsersMutation()
    const [bulkSendMessage, { isLoading: isSendingMessage }] =
        useBulkSendMessageMutation()

    const selectedCount = selectedUsers.length
    const selectedIds = selectedUsers.map((u) => u.id)

    if (selectedCount === 0) return null

    const handleDeleteClick = () => setDeleteDialogOpen(true)

    const handleConfirmDelete = async () => {
        try {
            await bulkDelete(selectedIds).unwrap()
            toast.push(
                <Notification type="success" duration={4000}>
                    {selectedCount} user{selectedCount !== 1 ? 's' : ''} deleted
                    successfully
                </Notification>,
                { placement: 'top-center' },
            )
            onClearSelection()
        } catch (err) {
            toast.push(
                <Notification type="danger" duration={5000}>
                    Failed to delete users. Please try again.
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setDeleteDialogOpen(false)
        }
    }

    const handleSendMessage = async () => {
        if (!messageContent.trim()) {
            toast.push(
                <Notification type="warning">
                    Please enter a message
                </Notification>,
                { placement: 'top-center' },
            )
            return
        }

        setIsSending(true)

        try {
            await bulkSendMessage({
                userIds: selectedIds,
                content: messageContent,
            }).unwrap()

            toast.push(
                <Notification type="success">
                    Message sent to {selectedCount} user
                    {selectedCount !== 1 ? 's' : ''}
                </Notification>,
                { placement: 'top-center' },
            )
            setMessageContent('')
            setMessageDialogOpen(false)
            onClearSelection()
        } catch (err) {
            toast.push(
                <Notification type="danger">
                    Failed to send message
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSending(false)
        }
    }

    return (
        <>
            <StickyFooter
                className="flex items-center justify-between py-4 bg-white dark:bg-gray-800"
                stickyClass="-mx-4 sm:-mx-8 border-t border-gray-200 dark:border-gray-700 px-8"
                defaultClass="container mx-auto px-8 rounded-xl border border-gray-200 dark:border-gray-600 mt-4"
            >
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <span className="text-lg text-primary">
                                <TbChecks />
                            </span>
                            <span className="font-semibold flex items-center gap-1">
                                <span className="heading-text">
                                    {selectedCount}
                                </span>
                                <span>
                                    selected user
                                    {selectedCount !== 1 ? 's' : ''}
                                </span>
                            </span>
                        </span>

                        <div className="flex items-center gap-3">
                            <Button
                                size="sm"
                                className="border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error"
                                onClick={handleDeleteClick}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>

                            <Button
                                size="sm"
                                variant="solid"
                                onClick={() => setMessageDialogOpen(true)}
                            >
                                Send Message
                            </Button>
                        </div>
                    </div>
                </div>
            </StickyFooter>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                type="danger"
                title="Delete Users"
                confirmButtonText="Delete"
                onClose={() => setDeleteDialogOpen(false)}
                onCancel={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            >
                <p>
                    Are you sure you want to delete the {selectedCount} selected{' '}
                    user{selectedCount !== 1 ? 's' : ''}? This action cannot be
                    undone.
                </p>
            </ConfirmDialog>

            {/* Send Message Dialog */}
            <Dialog
                isOpen={messageDialogOpen}
                onRequestClose={() => setMessageDialogOpen(false)}
                onClose={() => setMessageDialogOpen(false)}
                width="lg"
            >
                <h5 className="mb-3">Send Message to Selected Users</h5>

                <p className="mb-4 text-gray-600 dark:text-gray-400">
                    This message will be sent to {selectedCount} user
                    {selectedCount !== 1 ? 's' : ''}.
                </p>

                <div className="mb-5">
                    <Avatar.Group
                        chained
                        omittedAvatarTooltip
                        className="mb-4"
                        maxCount={5}
                        omittedAvatarProps={{ size: 32 }}
                    >
                        {selectedUsers.map((user) => (
                            <Tooltip
                                key={user.id}
                                title={user.username || user.email}
                            >
                                <Avatar
                                    size={32}
                                    src={user.avatar_url || undefined}
                                    fallback={user.username?.[0]?.toUpperCase()}
                                />
                            </Tooltip>
                        ))}
                    </Avatar.Group>

                    <RichTextEditor
                        content={messageContent}
                        onChange={setMessageContent}
                        placeholder="Write your message here..."
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMessageDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        loading={isSending || isSendingMessage}
                        disabled={isSending || !messageContent.trim()}
                        onClick={handleSendMessage}
                    >
                        Send Message
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default UserListSelected
