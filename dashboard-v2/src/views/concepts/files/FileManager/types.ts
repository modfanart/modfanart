export type File = {
    id: string
    name: string
    fileType: string
    srcUrl: string
    size: number
    author: {
        name: string
        email: string
        img: string
    }
    activities: {
        userName: string
        userImg: string
        actionType: string
        timestamp: number
    }[]
    permissions: {
        userName: string
        userImg: string
        role: string
    }[]
    uploadDate: number
    recent: boolean
}

export type DropdownItemCallbackProps = {
    onOpen?: () => void
    onDownload?: () => void
    onShare?: () => void
    onRename?: () => void
    onDelete?: () => void
}

export type Layout = 'grid' | 'list'

export type Files = File[]

export type Directories = { id: string; label: string }[]

export type GetFileListResponse = {
    list: Files
    directory: Directories
}

export type BaseFileItemProps = {
    name?: string
    fileType?: string
    size?: number
    loading?: boolean
    onClick?: () => void
} & DropdownItemCallbackProps
