import { create } from 'zustand'
import type { Members, Columns } from '../types'

type View = 'NEW_COLUMN' | 'TICKET' | 'ADD_MEMBER' | 'NEW_TICKET' | ''

export type ScrumBoardState = {
    columns: Columns
    ordered: string[]
    boardMembers: Members
    allMembers: Members
    dialogOpen: boolean
    dialogView: View
    ticketId: string
    board: string
}

type ScrumBoardAction = {
    updateOrdered: (payload: string[]) => void
    updateColumns: (payload: Columns) => void
    updateBoardMembers: (payload: Members) => void
    updateAllMembers: (payload: Members) => void
    openDialog: () => void
    closeDialog: () => void
    resetView: () => void
    updateDialogView: (payload: View) => void
    setSelectedTicketId: (payload: string) => void
    setSelectedBoard: (payload: string) => void
}

const initialState: ScrumBoardState = {
    columns: {},
    ordered: [],
    boardMembers: [],
    allMembers: [],
    dialogOpen: false,
    dialogView: '',
    ticketId: '',
    board: '',
}

export const useScrumBoardStore = create<ScrumBoardState & ScrumBoardAction>(
    (set) => ({
        ...initialState,
        updateOrdered: (payload) =>
            set(() => {
                return { ordered: payload }
            }),
        updateColumns: (payload) => set(() => ({ columns: payload })),
        updateBoardMembers: (payload) => set(() => ({ boardMembers: payload })),
        updateAllMembers: (payload) => set(() => ({ allMembers: payload })),
        openDialog: () => set({ dialogOpen: true }),
        closeDialog: () =>
            set({
                dialogOpen: false,
            }),
        resetView: () =>
            set({
                ticketId: '',
                board: '',
                dialogView: '',
            }),
        updateDialogView: (payload) => set(() => ({ dialogView: payload })),
        setSelectedTicketId: (payload) => set(() => ({ ticketId: payload })),
        setSelectedBoard: (payload) => set(() => ({ board: payload })),
    }),
)
