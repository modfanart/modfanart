import useSWR from 'swr'
import { apiGetProjects, apiGetProjectMembers } from '@/services/ProjectService'
import { useProjectListStore } from '../store/projectListStore'
import type {
    GetProjectListResponse,
    GetProjectMembersResponse,
} from '../types'

const useProjectList = () => {
    const { setProjectList, setMembers } = useProjectListStore()

    const { isLoading: fetchingProjectList } = useSWR(
        ['/api/projects/scrum-board'],
        () => apiGetProjects<GetProjectListResponse>(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
            onSuccess: (data) => {
                setProjectList(data)
            },
        },
    )

    useSWR(
        ['/api/projects/scrum-board/members'],
        () => apiGetProjectMembers<GetProjectMembersResponse>(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
            onSuccess: (data) => {
                const members = data?.allMembers.map((item) => ({
                    value: item.id,
                    label: item.name,
                    img: item.img,
                }))
                setMembers(members)
            },
        },
    )

    return {
        fetchingProjectList,
    }
}

export default useProjectList
