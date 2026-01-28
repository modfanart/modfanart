type Member = {
    id: string
    name: string
    email: string
    img: string
}

export type Task = {
    id: string
    name: string
    description: string
    cover: string
    members?: Member[]
    labels?: string[]
    attachments?: {
        id: string
        name: string
        src: string
        size: string
    }[]
    dueDate: number | null
    checked: boolean
}

export type File = {
    id: string
    name: string
    fileType: string
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
    uploadDate: number
    recent: boolean
}

export type GetProjectDetailsTaskResponse = Record<string, Task[]>

export type GetProjectDetailsAttachmentResponse = {
    list: File[]
}

export type GetProjectDetailsResponse = {
    name: string
    content: string
    client: {
        clientName: string
        skateHolder: {
            name: string
            img: string
        }
        projectManager: {
            name: string
            img: string
        }
    }
    schedule: {
        startDate: number
        dueDate: number
        status: string
        completion: number
    }
}

export type GetProjectDetailsActitvityResponse = {
    data: Array<{
        id: string
        date: number
        events: Array<{
            type: string
            dateTime: number
            ticket?: string
            status?: number
            userName: string
            userImg?: string
            comment?: string
            tags?: string[]
            files?: string[]
            assignee?: string
        }>
    }>
    loadable: boolean
}
