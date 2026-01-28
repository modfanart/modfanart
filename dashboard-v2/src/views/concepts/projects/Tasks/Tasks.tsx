import useSWR from 'swr'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { useTasksStore } from './store/tasksStore'
import {
    apiGetProjectTasks,
    apiGetProjectMembers,
} from '@/services/ProjectService'
import TasksHeader from './components/TasksHeader'
import TaskList from './components/TaskList'
import type { GetTasksResponse, GetProjectMembersResponse } from './types'

const Tasks = () => {
    const {
        updateOrdered,
        updateGroups,
        updateBoardMembers,
        updateAllMembers,
    } = useTasksStore()

    useSWR(
        ['/api/projects/tasks'],
        () => apiGetProjectTasks<GetTasksResponse>(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
            onSuccess: (data) => {
                updateOrdered(Object.keys(data))
                updateGroups(data)
            },
        },
    )

    useSWR(
        ['/api/projects/task/members'],
        () => apiGetProjectMembers<GetProjectMembersResponse>(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
            onSuccess: (data) => {
                updateBoardMembers(data.participantMembers)
                updateAllMembers(data.allMembers)
            },
        },
    )

    return (
        <AdaptiveCard>
            <TasksHeader />
            <div className="my-8">
                <TaskList />
            </div>
        </AdaptiveCard>
    )
}

export default Tasks
