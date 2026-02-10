import Card from '@/components/ui/Card'
import UsersAvatarGroup from '@/components/shared/UsersAvatarGroup'
import { Link } from 'react-router-dom'
import ProgressionBar from './ProgressionBar'
import { useProjectListStore } from '../store/projectListStore'
import { apiGetProjects } from '@/services/ProjectService'
import useSWR from 'swr'
import { TbClipboardCheck, TbStarFilled, TbStar } from 'react-icons/tb'
import type { GetProjectListResponse } from '../types'

const ProjectListContent = () => {
    const { projectList, updateProjectFavorite, setProjectList } =
        useProjectListStore()

    useSWR(['/api/projects'], () => apiGetProjects<GetProjectListResponse>(), {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        onSuccess: (data) => {
            setProjectList(data)
        },
    })

    const handleToggleFavorite = (id: string, value: boolean) => {
        updateProjectFavorite({ id, value })
    }

    return (
        <div>
            <div className="mt-8">
                <h5 className="mb-3">مورد علاقه</h5>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projectList
                        ?.filter((project) => project.favourite)
                        .map((project) => (
                            <Card key={project.id} bodyClass="h-full">
                                <div className="flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-center">
                                        <Link
                                            to={`/concepts/projects/project-details/${project.id}`}
                                        >
                                            <h6 className="font-bold hover:text-primary">
                                                {project.name}
                                            </h6>
                                        </Link>
                                        <div
                                            className="text-amber-400 cursor-pointer text-lg"
                                            role="button"
                                            onClick={() =>
                                                handleToggleFavorite(
                                                    project.id,
                                                    false,
                                                )
                                            }
                                        >
                                            <TbStarFilled />
                                        </div>
                                    </div>
                                    <p className="mt-4">{project.desc}</p>
                                    <div className="mt-3">
                                        <ProgressionBar
                                            progression={project.progression}
                                        />
                                        <div className="flex items-center justify-between mt-2">
                                            <UsersAvatarGroup
                                                users={project.member}
                                            />
                                            <div className="flex items-center rounded-full font-semibold text-xs">
                                                <div className="flex items-center px-2 py-1 border border-gray-300 rounded-full">
                                                    <TbClipboardCheck className="text-base" />
                                                    <span className="ml-1 rtl:mr-1 whitespace-nowrap">
                                                        {project.completedTask}{' '}
                                                        / {project.totalTask}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                </div>
            </div>
            <div className="mt-8">
                <h5 className="mb-3">پروژه‌های دیگر</h5>
                <div className="flex flex-col gap-4">
                    {projectList
                        ?.filter((project) => !project.favourite)
                        .map((project) => (
                            <Card key={project.id}>
                                <div className="grid gap-x-4 grid-cols-12">
                                    <div className="my-1 sm:my-0 col-span-12 sm:col-span-2 md:col-span-3 lg:col-span-3 md:flex md:items-center">
                                        <div className="flex flex-col">
                                            <h6 className="font-bold hover:text-primary">
                                                <Link
                                                    to={`/concepts/projects/project-details/${project.id}`}
                                                >
                                                    {project.name}
                                                </Link>
                                            </h6>
                                            <span>{project.category}</span>
                                        </div>
                                    </div>
                                    <div className="my-1 sm:my-0 col-span-12 sm:col-span-2 md:col-span-2 lg:col-span-2 md:flex md:items-center md:justify-end">
                                        <div className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-full">
                                            <TbClipboardCheck className="text-base" />
                                            <span className="ml-1 rtl:mr-1 whitespace-nowrap">
                                                {project.completedTask} /{' '}
                                                {project.totalTask}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="my-1 sm:my-0 col-span-12 md:col-span-2 lg:col-span-3 md:flex md:items-center">
                                        <ProgressionBar
                                            progression={project.progression}
                                        />
                                    </div>
                                    <div className="my-1 sm:my-0 col-span-12 md:col-span-3 lg:col-span-3 md:flex md:items-center">
                                        <UsersAvatarGroup
                                            users={project.member}
                                        />
                                    </div>
                                    <div className="my-1 sm:my-0 col-span-12 sm:col-span-1 flex md:items-center justify-end">
                                        <div
                                            className="cursor-pointer text-lg"
                                            role="button"
                                            onClick={() =>
                                                handleToggleFavorite(
                                                    project.id,
                                                    true,
                                                )
                                            }
                                        >
                                            <TbStar />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                </div>
            </div>
        </div>
    )
}

export default ProjectListContent
