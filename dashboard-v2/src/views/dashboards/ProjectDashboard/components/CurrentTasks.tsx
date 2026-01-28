/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import classNames from '@/utils/classNames'
import isLastChild from '@/utils/isLastChild'
import { TbCircleCheck, TbCircleCheckFilled, TbCalendar } from 'react-icons/tb'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import type { Task } from '../types'
import moment from 'jalali-moment'

type CurrentTasksProps = {
    data: Task[]
}

export const labelClass: Record<string, string> = {
    'In Progress': 'bg-sky-200 dark:bg-sky-200 dark:text-gray-900',
    Completed: 'bg-emerald-200 dark:bg-emerald-200 dark:text-gray-900',
    'Pending': 'bg-amber-200 dark:bg-amber-200 dark:text-gray-900',
    High: 'bg-red-200 dark:bg-red-200 dark:text-gray-900',
    Medium: 'bg-orange-200 dark:bg-orange-200 dark:text-gray-900',
    Low: 'bg-purple-200 dark:bg-purple-200 dark:text-gray-900',
}

const CurrentTasks = ({ data }: CurrentTasksProps) => {
    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        if (tasks.length === 0) {
            setTasks(data)
        }
    }, [data, tasks.length])

    const handleChange = (taskId: string) => {
        const newTasks = structuredClone(tasks).map((task) => {
            if (task.id === taskId) {
                task.checked = !task.checked
            }
            return task
        })
        setTasks(newTasks)
    }

    return (
        <Card>
            <div className="flex items-center justify-between">
                <h4>کارهای فعلی</h4>
                <Link to="/concepts/projects/tasks">
                    <Button asElement="div" size="sm">
                        مشاهده همه کارها
                    </Button>
                </Link>
            </div>
            <div className="mt-4">
                {tasks.map((task, index) => (
                    <div
                        key={task.id}
                        className={classNames(
                            'flex items-center justify-between py-4 border-gray-200 dark:border-gray-600',
                            !isLastChild(tasks, index) && 'border-b',
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <button
                                className=" text-[26px] cursor-pointer"
                                role="button"
                                onClick={() => handleChange(task.id)}
                            >
                                {task.checked ? (
                                    <TbCircleCheckFilled className="text-primary" />
                                ) : (
                                    <TbCircleCheck className="hover:text-primary" />
                                )}
                            </button>
                            <div>
                                <div
                                    className={classNames(
                                        'heading-text font-bold mb-1',
                                        task.checked &&
                                        'line-through opacity-50',
                                    )}
                                >
                                    {task.name}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <TbCalendar className="text-lg" />
                                        {task.dueDate
                                            ? moment(task.dueDate, 'YYYY-MM-DD') // فرمت تاریخ ورودی را مشخص کنید
                                                .locale('fa')
                                                .format('jDD jMMMM') // خروجی به فرمت روز و ماه شمسی
                                            : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Tag
                                className={`mr-2 rtl:ml-2 mb-2 ${task.priority
                                    ? labelClass[task.priority]
                                    : ''
                                    }`}
                            >
                                {task.priority}
                            </Tag>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}

export default CurrentTasks
