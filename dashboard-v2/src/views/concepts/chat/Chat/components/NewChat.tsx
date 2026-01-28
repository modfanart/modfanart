import { useEffect, useState, useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import ScrollBar from '@/components/ui/ScrollBar'
import DebouceInput from '@/components/shared/DebouceInput'
import classNames from '@/utils/classNames'
import { apiGetContacts } from '@/services/ChatService'
import { TbSearch, TbCheck } from 'react-icons/tb'
import useSWRMutation from 'swr/mutation'
import type { GetContactsResponse, UserDetails } from '../types'

async function getContacts() {
    const data = await apiGetContacts<GetContactsResponse>()
    return data
}

const NewChat = () => {
    const [contactListDialog, setContactListDialog] = useState(false)
    const [selectedContact, setSelectedContact] = useState<UserDetails[]>([])
    const [query, setQuery] = useState('')

    const { data, trigger: fetchContacts } = useSWRMutation(
        `/api/contacts/`,
        getContacts,
    )

    useEffect(() => {
        if (contactListDialog) {
            fetchContacts()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactListDialog])

    const contacts = useMemo(() => {
        if (data) {
            return data.filter((contact) => {
                if (!query) {
                    return true
                }

                if (contact.name.toLocaleLowerCase().includes(query)) {
                    return true
                }

                return false
            })
        }
    }, [data, query])

    const handleDialogClose = () => {
        setContactListDialog(false)
        setSelectedContact([])
    }

    const handleStartNewChat = () => {
        handleDialogClose()
    }

    const handleInputChange = (value: string) => {
        setQuery(value)
    }

    const handleSetSelectedContact = (contact: UserDetails) => {
        setSelectedContact((prevSelectedContacts) => {
            const contactExists = prevSelectedContacts.some(
                (c) => c.id === contact.id,
            )

            if (contactExists) {
                return prevSelectedContacts.filter((c) => c.id !== contact.id)
            } else {
                return [...prevSelectedContacts, contact]
            }
        })
    }

    return (
        <>
            <Button
                block
                variant="solid"
                onClick={() => setContactListDialog(true)}
            >
                چت جدید
            </Button>
            <Dialog
                isOpen={contactListDialog}
                onClose={handleDialogClose}
                onRequestClose={handleDialogClose}
            >
                {contacts && (
                    <div>
                        <div className="text-center mb-6">
                            <h4 className="mb-1">لیست مخاطبین</h4>
                            <p>
                                مرور و انتخاب مخاطبین برای شروع یک مکالمه
                            </p>
                        </div>
                        <DebouceInput
                            placeholder="جستجو..."
                            type="text"
                            size="sm"
                            prefix={<TbSearch className="text-lg" />}
                            onChange={(e) => handleInputChange(e.target.value)}
                        />
                        <div className="mt-4">
                            <p className="font-semibold uppercase text-xs mb-4">
                                {contacts.length} نفر موجود است
                            </p>
                            <div className="mb-6">
                                <ScrollBar
                                    className={classNames(
                                        'overflow-y-auto h-80',
                                    )}
                                >
                                    <div className="h-full pr-3 flex flex-col gap-2">
                                        {contacts.map((contact) => (
                                            <div
                                                key={contact.id}
                                                className={classNames(
                                                    'py-3 px-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                                                    selectedContact.some(
                                                        (item) =>
                                                            item.id ===
                                                            contact.id,
                                                    ) &&
                                                    'bg-gray-100 dark:bg-gray-700',
                                                )}
                                                role="button"
                                                onClick={() =>
                                                    handleSetSelectedContact(
                                                        contact,
                                                    )
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Avatar
                                                        shape="circle"
                                                        src={contact.img}
                                                    />
                                                    <div>
                                                        <p className="heading-text font-bold">
                                                            {contact.name}
                                                        </p>
                                                        <p>{contact.email}</p>
                                                    </div>
                                                </div>
                                                {selectedContact.some(
                                                    (item) =>
                                                        item.id === contact.id,
                                                ) && (
                                                        <TbCheck className="text-2xl text-primary" />
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollBar>
                            </div>
                            <Button
                                block
                                variant="solid"
                                onClick={handleStartNewChat}
                            >
                                {selectedContact.length > 1
                                    ? 'پیام گروهی'
                                    : 'پیام'}
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    )
}

export default NewChat
