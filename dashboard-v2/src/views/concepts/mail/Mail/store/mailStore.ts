import { create } from 'zustand'
import type { Mail, Category } from '../types'

type MessageDialog = {
    mode: '' | 'reply' | 'new'
    open: boolean
}

export type MailState = {
    mailList: Mail[]
    mailListFetched: boolean
    mail: Partial<Mail>
    selectedMailId: string[]
    mobileSideBarExpand: boolean
    selectedCategory: Partial<Category>
    messageDialog: MessageDialog
}

type MailAction = {
    setMailList: (payload: Mail[]) => void
    setMailListFetched: (payload: boolean) => void
    setMail: (payload: Partial<Mail>) => void
    setSelectedMail: (payload: string[]) => void
    setSelectedCategory: (payload: Partial<Category>) => void
    toggleMessageDialog: (payload: MessageDialog) => void
    toggleMobileSidebar: (payload: boolean) => void
}

const initialState: MailState = {
    mailList: [],
    mailListFetched: false,
    mail: {},
    selectedMailId: [],
    mobileSideBarExpand: false,
    selectedCategory: {},
    messageDialog: {
        mode: '',
        open: false,
    },
}

export const useMailStore = create<MailState & MailAction>((set) => ({
    ...initialState,
    setMailList: (payload) => set(() => ({ mailList: payload })),
    setMailListFetched: (payload) => set(() => ({ mailListFetched: payload })),
    setMail: (payload) => set(() => ({ mail: payload })),
    setSelectedMail: (payload) => set(() => ({ selectedMailId: payload })),
    setSelectedCategory: (payload) =>
        set(() => ({ selectedCategory: payload })),
    toggleMessageDialog: (payload) => set(() => ({ messageDialog: payload })),
    toggleMobileSidebar: (payload) =>
        set(() => ({ mobileSideBarExpand: payload })),
}))
