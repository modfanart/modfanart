```jsx
import { useState } from 'react'
import GanttChart, {
    ViewMode,
} from '@/components/shared/GanttChart'
import getStartEndDateForProject from '@/components/shared/GanttChart/getStartEndDateForProject'
import type { ExtendedTask } from '@/components/shared/GanttChart'

const colorsMap = {
    color1: '#fbbf24',
    color2: '#fdba74',
    color3: '#6ee7b7',
    color4: '#7dd3fc',
}

const currentDate = new Date()

const data: ExtendedTask[] = [
    {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        name: 'Some Project',
        id: 'ProjectSample',
        progress: 25,
        type: 'project',
        hideChildren: false,
        displayOrder: 1,
    },
    {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            2,
            12,
            28,
        ),
        name: 'Idea',
        id: 'Task 0',
        progress: 45,
        type: 'task',
        project: 'ProjectSample',
        displayOrder: 2,
        barVariant: 'color2',
    },
    {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
        end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            4,
            0,
            0,
        ),
        name: 'Research',
        id: 'Task 1',
        progress: 25,
        dependencies: ['Task 0'],
        type: 'task',
        project: 'ProjectSample',
        displayOrder: 3,
    },
    {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
        end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            8,
            0,
            0,
        ),
        name: 'Discussion with team',
        id: 'Task 2',
        progress: 10,
        dependencies: ['Task 1'],
        type: 'task',
        project: 'ProjectSample',
        displayOrder: 4,
        barVariant: 'color2',
    },
    {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
        end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            9,
            0,
            0,
        ),
        name: 'Developing',
        id: 'Task 3',
        progress: 27,
        dependencies: ['Task 2'],
        type: 'task',
        project: 'ProjectSample',
        displayOrder: 5,
    },
    {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        name: 'Review',
        id: 'Task 4',
        type: 'task',
        progress: 70,
        dependencies: ['Task 2'],
        project: 'ProjectSample',
        displayOrder: 6,
        barVariant: 'color3',
    },
    {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        name: 'Release',
        id: 'Task 6',
        progress: currentDate.getMonth(),
        type: 'milestone',
        dependencies: ['Task 4'],
        project: 'ProjectSample',
        displayOrder: 7,
        barVariant: 'color4',
    },
    {
        start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
        end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
        name: 'Party Time',
        id: 'Task 9',
        progress: 0,
        isDisabled: true,
        type: 'task',
    },
]

const Example = () => {
    const [tasks, setTasks] = useState<ExtendedTask[]>(data)

    const handleTaskChange = (task: ExtendedTask) => {
        let newTasks = tasks.map((t) => (t.id === task.id ? task : t))
        if (task.project) {
            const [start, end] = getStartEndDateForProject(
                newTasks,
                task.project,
            )
            const project =
                newTasks[newTasks.findIndex((t) => t.id === task.project)]
            if (
                project.start.getTime() !== start.getTime() ||
                project.end.getTime() !== end.getTime()
            ) {
                const changedProject = { ...project, start, end }
                newTasks = newTasks.map((t) =>
                    t.id === task.project ? changedProject : t,
                )
            }
        }
        setTasks(newTasks)
    }

    const handleProgressChange = async (task: ExtendedTask) => {
        setTasks(tasks.map((t) => (t.id === task.id ? task : t)))
    }

    const handleExpanderClick = (task: ExtendedTask) => {
        setTasks(tasks.map((t) => (t.id === task.id ? task : t)))
    }

    return (
        <GanttChart
            tasks={tasks}
            viewMode={ViewMode.Day}
            onDateChange={handleTaskChange}
            onProgressChange={handleProgressChange}
            onExpanderClick={handleExpanderClick}
            colorsMap={colorsMap}
        />
    )
}

export default Example
```
