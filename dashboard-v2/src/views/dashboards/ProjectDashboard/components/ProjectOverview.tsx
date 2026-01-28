import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import classNames from '@/utils/classNames'
import { Link } from 'react-router-dom'
import { TbProgressBolt, TbCopyCheck, TbArrowDownToArc } from 'react-icons/tb'
import { Project } from '../types'
import type { ReactNode } from 'react'

type StatisticCardProps = {
    title: string
    icon: ReactNode
    className: string
    value: number
}

type ProjectOverview = {
    data: Project
}

const StatisticCard = ({
    title,
    className,
    icon,
    value,
}: StatisticCardProps) => {
    return (
        <div
            className={classNames(
                'rounded-2xl p-4 flex flex-col justify-center',
                className,
            )}
        >
            <div className="flex justify-between items-center relative">
                <div>
                    <div className="mb-4 text-gray-900 font-bold">{title}</div>
                    <h1 className="mb-1 text-gray-900">{value}</h1>
                </div>
                <div
                    className={
                        'flex items-center justify-center min-h-12 min-w-12 max-h-12 max-w-12 bg-gray-900 text-white rounded-full text-2xl'
                    }
                >
                    {icon}
                </div>
            </div>
        </div>
    )
}

const ProjectOverview = ({ data }: ProjectOverview) => {
    return (
        <Card>
            <div className="flex items-center justify-between">
                <h4>نمای کلی</h4>
                <Link to="/concepts/projects/project-list">
                    <Button asElement="div" size="sm">
                        همه پروژه‌ها
                    </Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl mt-4">
                <StatisticCard
                    title="پروژه در حال اجرا"
                    className="bg-sky-100 dark:bg-opacity-75"
                    value={data.ongoingProject}
                    icon={<TbProgressBolt />}
                />
                <StatisticCard
                    title="پروژه تکمیل شده"
                    className="bg-emerald-100 dark:bg-opacity-75"
                    value={data.projectCompleted}
                    icon={<TbCopyCheck />}
                />
                <StatisticCard
                    title="پروژه آینده"
                    className="bg-purple-100 dark:bg-opacity-75"
                    value={data.upcomingProject}
                    icon={<TbArrowDownToArc />}
                />
            </div>
        </Card>
    )
}

export default ProjectOverview
