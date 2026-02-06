export interface Comment {
    id: string
    name: string
    src: string
    message: string
    date: number
}

export type Member = {
    id: string
    name: string
    img: string
}

export type Task = {
    id: string
    name: string
    progress: string
    assignee?: Member
    priority: string
    dueDate: number | null
    checked: boolean
}

export type Members = Member[]

export type Groups = Record<string, Task[]>

export type GetTasksResponse = Groups

export type GetProjectMembersResponse = {
    participantMembers: Members
    allMembers: Members
}
