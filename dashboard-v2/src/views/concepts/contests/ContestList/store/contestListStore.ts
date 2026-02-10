import { create } from 'zustand'
import type { ProjectList, Project, MemberListOption } from '../types'

export type ProjectListState = {
    projectList: ProjectList
    memberList: MemberListOption[]
    newProjectDialog: boolean
}

type ProjectListAction = {
    setProjectList: (payload: ProjectList) => void
    updateProjectList: (payload: Project) => void
    updateProjectFavorite: (payload: { id: string; value: boolean }) => void
    setMembers: (payload: MemberListOption[]) => void
}

const initialState: ProjectListState = {
    projectList: [],
    memberList: [],
    newProjectDialog: false,
}

export const useProjectListStore = create<ProjectListState & ProjectListAction>(
    (set) => ({
        ...initialState,
        setProjectList: (payload) => set(() => ({ projectList: payload })),
        updateProjectList: (payload) =>
            set((state) => ({
                projectList: [...state.projectList, ...[payload]],
            })),
        updateProjectFavorite: (payload) =>
            set((state) => {
                const { id, value } = payload
                const newList = state.projectList.map((project) => {
                    if (project.id === id) {
                        project.favourite = value
                    }
                    return project
                })

                return {
                    projectList: [...newList],
                }
            }),
        setMembers: (payload) => set(() => ({ memberList: payload })),
    }),
)
