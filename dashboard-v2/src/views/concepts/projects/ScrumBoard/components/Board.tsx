import { lazy, Suspense } from 'react'
import Dialog from '@/components/ui/Dialog'
import Spinner from '@/components/ui/Spinner'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import reorderDragable from '@/utils/reorderDragable'
import BoardColumn from './BoardColumn'
import ScrumBoardHeader from './ScrumBoardHeader'
import { useScrumBoardStore } from '../store/scrumBoardStore'
import sleep from '@/utils/sleep'
import reoderArray from '@/utils/reoderArray'
import {
    apiGetScrumBoards,
    apiGetProjectMembers,
} from '@/services/ProjectService'
import {
    Droppable,
    DragDropContext,
    DraggableChildrenFn,
} from '@hello-pangea/dnd'
import useSWR from 'swr'
import type {
    GetScrumBoardsResponse,
    GetProjectMembersResponse,
    Ticket,
} from '../types'
import type { DropResult } from '@hello-pangea/dnd'

export type BoardProps = {
    containerHeight?: boolean
    useClone?: DraggableChildrenFn
    isCombineEnabled?: boolean
    withScrollableColumns?: boolean
}

const TicketContent = lazy(() => import('./TicketContent'))
const AddNewTicketContent = lazy(() => import('./AddNewTicketContent'))
const AddNewMemberContent = lazy(() => import('./AddNewMemberContent'))
const AddNewColumnContent = lazy(() => import('./AddNewColumnContent'))

const Board = (props: BoardProps) => {
    const {
        columns,
        ordered,
        boardMembers,
        updateOrdered,
        updateColumns,
        updateBoardMembers,
        updateAllMembers,
        closeDialog,
        resetView,
        dialogView,
        dialogOpen,
    } = useScrumBoardStore()

    const {
        containerHeight,
        useClone,
        isCombineEnabled,
        withScrollableColumns,
    } = props

    useSWR(
        ['/api/projects/scrum-board'],
        () => apiGetScrumBoards<GetScrumBoardsResponse>(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
            onSuccess: (data) => {
                updateOrdered(Object.keys(data))
                updateColumns(data)
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
                updateBoardMembers(data.participantMembers)
                updateAllMembers(data.allMembers)
            },
        },
    )

    const onDialogClose = async () => {
        closeDialog()
        await sleep(200)
        resetView()
    }

    const onDragEnd = (result: DropResult) => {
        if (result.combine) {
            if (result.type === 'COLUMN') {
                const shallow = [...ordered]
                shallow.splice(result.source.index, 1)
                updateOrdered(shallow)
                return
            }

            const column = columns[result.source.droppableId]
            const withQuoteRemoved = [...column]
            withQuoteRemoved.splice(result.source.index, 1)
            const newColumns = {
                ...columns,
                [result.source.droppableId]: withQuoteRemoved,
            }
            updateColumns(newColumns)
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

        const data = reorderDragable<Record<string, Ticket[]>>({
            quoteMap: columns,
            source,
            destination,
        })

        updateColumns(data.quoteMap)
    }

    return (
        <>
            <AdaptiveCard className="h-full" bodyClass="h-full flex flex-col">
                <ScrumBoardHeader boardMembers={boardMembers} />
                <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
                    <Droppable
                        droppableId="board"
                        type="COLUMN"
                        direction="horizontal"
                        ignoreContainerClipping={containerHeight}
                        isCombineEnabled={isCombineEnabled}
                    >
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                className="scrumboard flex flex-col flex-auto w-full mb-2"
                                {...provided.droppableProps}
                            >
                                <div className="scrumboard-body flex max-w-full overflow-x-auto h-full mt-4 gap-4">
                                    {ordered.map((key, index) => (
                                        <BoardColumn
                                            key={key}
                                            index={index}
                                            title={key}
                                            contents={columns[key]}
                                            isScrollable={withScrollableColumns}
                                            isCombineEnabled={isCombineEnabled}
                                            useClone={useClone}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </AdaptiveCard>
            <Dialog
                isOpen={dialogOpen}
                width={dialogView === 'TICKET' ? 700 : 520}
                closable={dialogView !== 'TICKET'}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <Suspense
                    fallback={
                        <div className="my-4 text-center">
                            <Spinner />
                        </div>
                    }
                >
                    {dialogView === 'TICKET' && (
                        <TicketContent onTicketClose={onDialogClose} />
                    )}
                    {dialogView === 'NEW_TICKET' && <AddNewTicketContent />}
                    {dialogView === 'NEW_COLUMN' && <AddNewColumnContent />}
                    {dialogView === 'ADD_MEMBER' && <AddNewMemberContent />}
                </Suspense>
            </Dialog>
        </>
    )
}

export default Board
