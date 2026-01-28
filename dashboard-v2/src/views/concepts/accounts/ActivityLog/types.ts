export type Activity = {
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
}

export type Activities = Activity[]

export type GetActivityLogResponse = {
    data: Activities
    loadable: boolean
}
