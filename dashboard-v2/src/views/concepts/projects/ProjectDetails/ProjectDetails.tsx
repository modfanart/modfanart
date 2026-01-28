import { useState, lazy, Suspense } from 'react'
import Spinner from '@/components/ui/Spinner'
import ProjectDetailsHeader from './components/ProjectDetailsHeader'
import ProjectDetailsNavigation from './components/ProjectDetailsNavigation'
import useResponsive from '@/utils/hooks/useResponsive'
import { apiGetProject } from '@/services/ProjectService'
import useSWR from 'swr'
import { useParams } from 'react-router-dom'
import type { GetProjectDetailsResponse } from './types'

const defatultNavValue = 'overview'
const settingsNavValue = 'settings'

const ProjectDetailsOverview = lazy(
    () => import('./components/ProjectDetailsOverview'),
)
const ProjectDetailsTask = lazy(() => import('./components/ProjectDetailsTask'))
const ProjectDetailsAttachments = lazy(
    () => import('./components/ProjectDetailsAttachments'),
)
const ProjectDetailsActivity = lazy(
    () => import('./components/ProjectDetailsActivity'),
)
const ProjectDetailsSetting = lazy(
    () => import('./components/ProjectDetailsSetting'),
)

const ProjectDetails = () => {
    const { id } = useParams()

    const { data, mutate } = useSWR<GetProjectDetailsResponse, { id: string }>(
        [`/api/project/${id}`],
        () => apiGetProject({ id }),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
        },
    )

    const { larger } = useResponsive()

    const [selectedNav, setSelectedNav] = useState(defatultNavValue)
    const [isContentEdit, setIsContentEdit] = useState(false)

    const handleEdit = (isEdit: boolean) => {
        setSelectedNav(settingsNavValue)
        setIsContentEdit(isEdit)
    }

    const handleContentChange = (content: string) => {
        mutate({ ...(data as GetProjectDetailsResponse), content }, false)
        setIsContentEdit(false)
    }

    const handleUpdate = ({
        name,
        content,
        dueDate,
    }: {
        name: string
        content: string
        dueDate: number
    }) => {
        const newData = { ...data }
        newData.name = name
        newData.content = content
        if (newData.schedule) {
            newData.schedule.dueDate = dueDate
        }

        mutate({ ...(newData as GetProjectDetailsResponse) }, false)
        setIsContentEdit(false)
        setSelectedNav(defatultNavValue)
    }

    const handleNavigationChange = (val: string) => {
        if (val === settingsNavValue) {
            setIsContentEdit(true)
        } else {
            setIsContentEdit(false)
        }
        setSelectedNav(val)
    }

    return (
        <div>
            {data && (
                <>
                    <ProjectDetailsHeader
                        title={data.name}
                        isContentEdit={isContentEdit}
                        selected={selectedNav}
                        onEdit={handleEdit}
                        onChange={handleNavigationChange}
                    />
                    <div className="mt-6 flex gap-12">
                        {larger.xl && (
                            <ProjectDetailsNavigation
                                selected={selectedNav}
                                onChange={handleNavigationChange}
                            />
                        )}
                        <div className="w-full">
                            <Suspense
                                fallback={
                                    <div className="my-4 mx-auto text-center flex justify-center">
                                        <Spinner size={40} />
                                    </div>
                                }
                            >
                                {selectedNav === defatultNavValue && (
                                    <ProjectDetailsOverview
                                        content={data.content}
                                        client={data.client}
                                        schedule={data.schedule}
                                        isContentEdit={isContentEdit}
                                        setIsContentEdit={setIsContentEdit}
                                        onContentChange={handleContentChange}
                                    />
                                )}
                                {selectedNav === 'tasks' && (
                                    <ProjectDetailsTask />
                                )}
                                {selectedNav === 'attachments' && (
                                    <ProjectDetailsAttachments />
                                )}
                                {selectedNav === 'activity' && (
                                    <ProjectDetailsActivity />
                                )}
                                {selectedNav === 'settings' && (
                                    <ProjectDetailsSetting
                                        name={data.name}
                                        content={data.content}
                                        dueDate={data.schedule.dueDate}
                                        onUpdate={handleUpdate}
                                    />
                                )}
                            </Suspense>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default ProjectDetails
