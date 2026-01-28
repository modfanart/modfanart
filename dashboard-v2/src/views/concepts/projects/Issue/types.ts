type Activity = {
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
}

export type Member = {
    id: string
    name: string
    email: string
    img: string
}

export type Comment = {
    id: string
    name: string
    src: string
    message: string
    date: string
}

export type Attachment = {
    id: string
    name: string
    src: string
    size: string
}

export type IssueDetail = {
    ticketId?: string
    title?: string
    createdBy?: string
    underProject?: string
    description?: string
    dueDate?: number
    status?: string
    priority?: string
    assignees: {
        id: string
        name: string
        email: string
        img: string
    }[]
    labels: {
        id: string
        title: string
    }[]
    attachments: Attachment[]
    activity: Activity[]
    comments: Comment[]
}

export type MemberListOption = {
    value: string
    label: string
    img: string
}

export type Members = Member[]

export type GetProjectMembersResponse = {
    participantMembers: Members
    allMembers: Members
}

export type GetIssueResponse = IssueDetail
