import { create } from 'zustand'

export type HelpCenterState = {
    queryText: string
    selectedTopic: string
}

type HelpCenterAction = {
    setQueryText: (payload: string) => void
    setSelectedTopic: (payload: string) => void
}

const initialState: HelpCenterState = {
    queryText: '',
    selectedTopic: '',
}

export const useHelpCenterStore = create<HelpCenterState & HelpCenterAction>(
    (set) => ({
        ...initialState,
        setQueryText: (payload) => set(() => ({ queryText: payload })),
        setSelectedTopic: (payload) => set(() => ({ selectedTopic: payload })),
    }),
)
