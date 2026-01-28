import { useState } from 'react'
import Table from '@/components/ui/Table'
import TaskItem from '@/components/view/TaskItem'
import AddTask from './AddTask'
import { labelClass } from '../utils'
import reoderArray from '@/utils/reoderArray'
import reorderDragable from '@/utils/reorderDragable'
import { useTasksStore } from '../store/tasksStore'
import { Droppable, DragDropContext, Draggable } from '@hello-pangea/dnd'
import { MdDragIndicator } from 'react-icons/md'
import type { DropResult } from '@hello-pangea/dnd'
import type { Task } from '../types'

const { TBody } = Table

const TaskList = () => {
    const [selectedCreateTaskButton, setSelectedCreateTaskButton] = useState('')

    const { updateOrdered, updateGroups, ordered, groups } = useTasksStore()

    const onDragEnd = (result: DropResult) => {
        if (result.combine) {
            if (result.type === 'COLUMN') {
                const shallow = [...ordered]
                shallow.splice(result.source.index, 1)
                updateOrdered(shallow)
                return
            }

            const column = groups[result.source.droppableId]
            const withQuoteRemoved = [...column]
            withQuoteRemoved.splice(result.source.index, 1)
            const newColumns = {
                ...groups,
                [result.source.droppableId]: withQuoteRemoved,
            }
            updateGroups(newColumns)
            return
        }

        if (!result.destination) {
            return
        }

        const source = result.source
        const destination = result.destination

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return
        }

        if (result.type === 'COLUMN') {
            const newOrdered = reoderArray(
                ordered,
                source.index,
                destination.index,
            )
            updateOrdered(newOrdered)
            return
        }

        const data = reorderDragable<Record<string, Task[]>>({
            quoteMap: groups,
            source,
            destination,
        })

        updateGroups(data.quoteMap)
    }

    const handleChange = (taskId: string, groupKey: string) => {
        const newData = { ...groups }

        newData[groupKey] = newData[groupKey].filter((task) => {
            if (task.id === taskId) {
                task.checked = !task.checked
            }
            return task
        })

        updateGroups(newData)
    }

    const handleCreatetask = (key: string, task: Task) => {
        const newData = { ...groups }
        newData[key].push(task)
        updateGroups(newData)
        setSelectedCreateTaskButton('')
    }

    return (
        <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
            <Droppable droppableId="board" type="COLUMN" direction="vertical">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        <div className="flex flex-col gap-10">
                            {ordered.map((key, index) => (
                                <Draggable
                                    key={key}
                                    draggableId={key}
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                        >
                                            <div className="flex items-center gap-2 mb-4">
                                                <span
                                                    className="text-lg"
                                                    {...provided.dragHandleProps}
                                                >
                                                    <MdDragIndicator />
                                                </span>
                                                <h4>{key}</h4>
                                            </div>
                                            <Table className="lg:overflow-hidden">
                                                <Droppable
                                                    droppableId={key}
                                                    type="CONTENT"
                                                >
                                                    {(dropProvided) => (
                                                        <TBody
                                                            ref={
                                                                dropProvided.innerRef
                                                            }
                                                            {...dropProvided.droppableProps}
                                                        >
                                                            {groups[key]?.map(
                                                                (
                                                                    item,
                                                                    index,
                                                                ) => (
                                                                    <Draggable
                                                                        key={
                                                                            item.id +
                                                                            index
                                                                        }
                                                                        draggableId={
                                                                            item.id +
                                                                            index
                                                                        }
                                                                        index={
                                                                            index
                                                                        }
                                                                    >
                                                                        {(
                                                                            provided,
                                                                        ) => (
                                                                            <TaskItem
                                                                                ref={
                                                                                    provided.innerRef
                                                                                }
                                                                                taskId={
                                                                                    item.id
                                                                                }
                                                                                progress={
                                                                                    item.progress
                                                                                }
                                                                                checked={
                                                                                    item.checked
                                                                                }
                                                                                name={
                                                                                    item.name
                                                                                }
                                                                                dueDate={
                                                                                    item.dueDate as number
                                                                                }
                                                                                assignee={
                                                                                    item.assignee
                                                                                }
                                                                                priority={
                                                                                    item.priority
                                                                                }
                                                                                dragger={
                                                                                    <span
                                                                                        {...provided.dragHandleProps}
                                                                                    >
                                                                                        <MdDragIndicator />
                                                                                    </span>
                                                                                }
                                                                                labelClass={
                                                                                    labelClass
                                                                                }
                                                                                onChange={(
                                                                                    taskId,
                                                                                ) =>
                                                                                    handleChange(
                                                                                        taskId,
                                                                                        key,
                                                                                    )
                                                                                }
                                                                                {...provided.draggableProps}
                                                                            />
                                                                        )}
                                                                    </Draggable>
                                                                ),
                                                            )}
                                                            {
                                                                dropProvided.placeholder
                                                            }
                                                        </TBody>
                                                    )}
                                                </Droppable>
                                            </Table>
                                            <div className="mt-4">
                                                <AddTask
                                                    isCreatingTask={
                                                        key ===
                                                        selectedCreateTaskButton
                                                    }
                                                    groupKey={key}
                                                    onAddTaskClick={
                                                        setSelectedCreateTaskButton
                                                    }
                                                    onCreateTask={(task) =>
                                                        handleCreatetask(
                                                            key,
                                                            task,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}

export default TaskList
