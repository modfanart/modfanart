import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import acronym from '@/utils/acronym'
import classNames from '@/utils/classNames'
import useRandomBgColor from '@/utils/hooks/useRandomBgColor'
import { TbUser, TbTag, TbFileText, TbTicket, TbRefresh } from 'react-icons/tb'
import {
    ADD_TAGS_TO_TICKET,
    ADD_FILES_TO_TICKET,
    UPDATE_TICKET,
    CREATE_TICKET,
    avatarType,
    iconType,
} from './constants'
import type { AvatarProps } from '@/components/ui/Avatar'

type ActivityAvatar = {
    data?: {
        type: string
        userImg?: string
        userName: string
    }
}

const Icon = ({ type }: { type: string }) => {
    switch (type) {
        case ADD_TAGS_TO_TICKET:
            return <TbTag />
        case ADD_FILES_TO_TICKET:
            return <TbFileText />
        case UPDATE_TICKET:
            return <TbRefresh />
        case CREATE_TICKET:
            return <TbTicket />
        default:
            return <TbUser />
    }
}

const ActivityAvatar = ({ data }: ActivityAvatar) => {
    const color = useRandomBgColor()

    const defaultAvatarProps: AvatarProps = useMemo(
        () => ({ size: 35, shape: 'circle' }),
        [],
    )

    if (data && avatarType.includes(data.type)) {
        const avatarProps = data.userImg
            ? { src: data.userImg }
            : { className: classNames(color(data.userName || '')) }

        return (
            <Avatar {...avatarProps} {...defaultAvatarProps}>
                <span className="text-gray-900 font-bold">
                    {acronym(data.userName || '')}
                </span>
            </Avatar>
        )
    }

    if (data && iconType.includes(data.type)) {
        return (
            <Avatar
                className="text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-700"
                icon={<Icon type={data.type} />}
                {...defaultAvatarProps}
            />
        )
    }

    return null
}

export default ActivityAvatar
