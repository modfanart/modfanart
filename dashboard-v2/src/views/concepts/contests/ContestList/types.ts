export type Member = {
    name: string
    img: string
}

export type Project = {
    id: string
    name: string
    category?: string
    desc: string
    attachmentCount?: number
    totalTask: number
    completedTask: number
    progression: number
    dayleft?: number
    favourite?: boolean
    member: Member[]
}

export type ProjectList = Project[]

export type Members = (Member & { id: string })[]

export type GetProjectListResponse = ProjectList

export type MemberListOption = {
    value: string
    label: string
    img: string
}

export type GetProjectMembersResponse = {
    participantMembers: Members
    allMembers: Members
}
