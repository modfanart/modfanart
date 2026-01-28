import { useEffect, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import CloseButton from '@/components/ui/CloseButton'
import Drawer from '@/components/ui/Drawer'
import ScrollBar from '@/components/ui/ScrollBar'
import Tabs from '@/components/ui/Tabs'
import ImageGallery from '@/components/shared/ImageGallery'
import FileIcon from '@/components/view/FileIcon'
import fileSizeUnit from '@/utils/fileSizeUnit'
import { useChatStore } from '../store/chatStore'
import { apiGetContactDetails } from '@/services/ChatService'
import useSWRMutation from 'swr/mutation'
import isEmpty from 'lodash/isEmpty'
import dayjs from 'dayjs'
import {
    TbMail,
    TbPhone,
    TbClock,
    TbArrowDown,
    TbChevronRight,
} from 'react-icons/tb'
import type { ReactNode } from 'react'
import type { GetContactDetailResponse } from '../types'

type ContactInfoFieldProps = {
    title?: string
    value?: string
    icon?: ReactNode
}

const { TabNav, TabList, TabContent } = Tabs

const ContactInfoField = ({ title, value, icon }: ContactInfoFieldProps) => {
    return (
        <div className="flex items-center gap-4">
            <div className="text-2xl">{icon}</div>
            <div>
                <small className="font-semibold">{title}</small>
                <p className="heading-text font-semibold">{value}</p>
            </div>
        </div>
    )
}

const ContactInfoDrawer = () => {
    const contactInfoDrawer = useChatStore((state) => state.contactInfoDrawer)
    const setContactInfoDrawer = useChatStore(
        (state) => state.setContactInfoDrawer,
    )

    const [imageGalleryIndex, setImageGalleryIndex] = useState(-1)

    const { trigger, data } = useSWRMutation(
        [`/api/chats/contact/${contactInfoDrawer.userId}`, contactInfoDrawer],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) =>
            apiGetContactDetails<GetContactDetailResponse>({
                id: params.userId,
            }),
    )

    const handleDrawerClose = () => {
        setContactInfoDrawer({
            userId: '',
            chatId: '',
            chatType: '',
            open: false,
        })
    }

    const handleDownload = () => {
        const blob = new Blob(
            [
                'This text file is created to demonstrate how file downloading works in our template demo.',
            ],
            { type: 'text/plain;charset=utf-8' },
        )

        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'sample-dowoad-file'
        document.body.appendChild(link)

        link.click()

        document.body.removeChild(link)
        window.URL.revokeObjectURL(link.href)
    }

    useEffect(() => {
        if (contactInfoDrawer.userId) {
            trigger()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactInfoDrawer.userId])

    return (
        <Drawer
            title={null}
            closable={false}
            isOpen={contactInfoDrawer.open}
            showBackdrop={false}
            width={400}
            onClose={handleDrawerClose}
            onRequestClose={handleDrawerClose}
        >
            <div className="flex justify-end">
                <CloseButton onClick={handleDrawerClose} />
            </div>
            {!isEmpty(data?.userDetails) && (
                <ScrollBar className="h-[calc(100%-30px)]">
                    <div className="mt-10 flex justify-center">
                        <Avatar src={data?.userDetails.img} size={90} />
                    </div>
                    <div className="mt-4 text-center">
                        <h5 className="font-bold">{data?.userDetails.name}</h5>
                        <span className="mt-1">
                            {contactInfoDrawer.chatType === 'personal'
                                ? data?.userDetails.title
                                : `Groups • ${data?.userDetails?.members?.length} members`}
                        </span>
                    </div>
                    <div className="flex flex-col gap-y-7 mt-8">
                        {contactInfoDrawer.chatType === 'personal' ? (
                            <>
                                <ContactInfoField
                                    title="Email"
                                    value={data.userDetails.email}
                                    icon={<TbMail />}
                                />
                                <ContactInfoField
                                    title="Phone"
                                    value={
                                        data.userDetails?.personalInfo
                                            .phoneNumber
                                    }
                                    icon={<TbPhone />}
                                />
                                <ContactInfoField
                                    title="Last Online"
                                    value={dayjs
                                        .unix(
                                            data.userDetails
                                                .lastOnline as number,
                                        )
                                        .format('DD MMM YYYY hh:mm A')}
                                    icon={<TbClock />}
                                />
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="heading-text font-semibold">
                                        Members
                                    </div>
                                    {data?.userDetails?.members?.map(
                                        (member) => (
                                            <div
                                                key={member.id}
                                                className="rounded-xl py-4 flex items-center justify-between gap-2 group"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Avatar src={member.img} />
                                                    <div>
                                                        <div className="font-bold heading-text">
                                                            {member.name}
                                                        </div>
                                                        <span>
                                                            {member.email}
                                                        </span>
                                                    </div>
                                                </div>
                                                {member.id !== '1' && (
                                                    <button
                                                        type="button"
                                                        className="close-button button-press-feedback opacity-0 group-hover:opacity-100"
                                                    >
                                                        <TbChevronRight className="text-xl" />
                                                    </button>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mt-8">
                        <Tabs defaultValue="media">
                            <TabList>
                                <TabNav value="media" className="flex-1">
                                    Media
                                </TabNav>
                                <TabNav value="files" className="flex-1">
                                    Files
                                </TabNav>
                                <TabNav value="tab3" className="flex-1">
                                    Links
                                </TabNav>
                            </TabList>
                            <div className="py-4">
                                <TabContent value="media">
                                    <ImageGallery
                                        index={imageGalleryIndex}
                                        slides={
                                            data.media.images?.map((img) => {
                                                return {
                                                    src: img.url,
                                                }
                                            }) || []
                                        }
                                        onClose={() => setImageGalleryIndex(-1)}
                                    >
                                        <div className="grid grid-cols-3 gap-2">
                                            {data.media.images?.map(
                                                (img, index) => (
                                                    <div
                                                        key={img.id}
                                                        data-src={img.url}
                                                        className="cursor-pointer"
                                                        role="button"
                                                        onClick={() =>
                                                            setImageGalleryIndex(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <img
                                                            className="rounded-xl"
                                                            src={img.url}
                                                        />
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </ImageGallery>
                                </TabContent>
                                <TabContent value="files">
                                    {data.media.files.map((file) => (
                                        <div
                                            key={file.id}
                                            className="rounded-xl py-4 flex items-center justify-between gap-2 group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="text-3xl">
                                                    <FileIcon
                                                        type={file.fileType}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-bold heading-text">
                                                        {file.name}
                                                    </div>
                                                    <span className="text-xs">
                                                        {fileSizeUnit(
                                                            file.size || 0,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="close-button button-press-feedback opacity-0 group-hover:opacity-100"
                                                onClick={handleDownload}
                                            >
                                                <TbArrowDown className="text-xl" />
                                            </button>
                                        </div>
                                    ))}
                                </TabContent>
                                <TabContent value="tab3">
                                    {data.media.links.map((link) => (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            className="rounded-xl py-4 px-2 flex items-center justify-between gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            target='"_blank'
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="flex items-center">
                                                    <Avatar
                                                        src={link.favicon}
                                                        className="bg-transparent"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold heading-text truncate">
                                                        {link.title}
                                                    </div>
                                                    <div className="text-xs truncate">
                                                        {link.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </TabContent>
                            </div>
                        </Tabs>
                    </div>
                </ScrollBar>
            )}
        </Drawer>
    )
}

export default ContactInfoDrawer
