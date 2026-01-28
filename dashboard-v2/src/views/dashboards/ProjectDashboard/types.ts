import type { ExtendedTask } from '@/components/shared/GanttChart'

export type Event =
    | 'meeting'
    | 'task'
    | 'holiday'
    | 'breaks'
    | 'event'
    | 'workshops'
    | 'reminders'

export type Activities = Array<{
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

export type Project = {
    ongoingProject: number
    projectCompleted: number
    upcomingProject: number
}

export type TaskOverviewChart = {
    onGoing: number
    finished: number
    total: number
    series: {
        name: string
        data: number[]
    }[]
    range: string[]
}

export type Task = {
    id: string
    name: string
    dueDate: number
    checked: boolean
    progress: string
    priority: string
    assignee: {
        name: string
        img: string
    }
}

export type GetProjectDashboardResponse = {
    projectOverview: Project
    taskOverview: Record<string, TaskOverviewChart>
    currentTasks: Task[]
    schedule: ExtendedTask[]
    recentActivity: Activities
}
