import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { Article, Articles, Filter } from '../types'

export const initialTableData: TableQueries = {
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: {
        order: '',
        key: '',
    },
}

export const initialFilterData = {
    category: [
        'introduction',
        'setupGuide',
        'basicFeatures',
        'survey',
        'analytic',
        'dataVisualization',
        'chatbot',
        'media',
        'security',
        'integration',
        'themes',
        'commission',
    ],
}

export type ManageArticleState = {
    tableData: TableQueries
    filterData: Filter
    selectedArticle: Partial<Article>[]
}

type ManageArticleAction = {
    setFilterData: (payload: Filter) => void
    setTableData: (payload: TableQueries) => void
    setSelectedArticle: (checked: boolean, customer: Article) => void
    setSelectAllArticle: (customer: Articles) => void
}

const initialState: ManageArticleState = {
    tableData: initialTableData,
    filterData: initialFilterData,
    selectedArticle: [],
}

export const useManageArticleStore = create<
    ManageArticleState & ManageArticleAction
>((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setTableData: (payload) => set(() => ({ tableData: payload })),
    setSelectedArticle: (checked, row) =>
        set((state) => {
            const prevData = state.selectedArticle
            if (checked) {
                return { selectedArticle: [...prevData, ...[row]] }
            } else {
                if (prevData.some((prevArticle) => row.id === prevArticle.id)) {
                    return {
                        selectedArticle: prevData.filter(
                            (prevArticle) => prevArticle.id !== row.id,
                        ),
                    }
                }
                return { selectedArticle: prevData }
            }
        }),
    setSelectAllArticle: (row) => set(() => ({ selectedArticle: row })),
}))
