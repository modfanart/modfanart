import { useManageArticleStore } from '../store/manageArticleStore'
import { apiGetArticleList } from '@/services/HelpCenterService'
import useSWR from 'swr'
import type { TableQueries } from '@/@types/common'
import type { GetArticleListResponse } from '../types'

const useManageArticle = () => {
    const tableData = useManageArticleStore((state) => state.tableData)
    const filterData = useManageArticleStore((state) => state.filterData)

    const { data, isLoading, mutate } = useSWR(
        ['/helps/manage/articles', { ...tableData, ...filterData }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) =>
            apiGetArticleList<GetArticleListResponse, TableQueries>(params),
        {
            revalidateOnFocus: false,
        },
    )

    return {
        articleList: data?.list || [],
        articleTotal: data?.total || 0,
        isLoading,
        mutate,
    }
}

export default useManageArticle
