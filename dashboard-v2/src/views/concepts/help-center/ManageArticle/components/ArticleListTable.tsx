import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Switcher from '@/components/ui/Switcher'
import { UsersAvatarGroup } from '@/components/shared'
import DataTable from '@/components/shared/DataTable'
import { useManageArticleStore } from '../store/manageArticleStore'
import useManageArticle from '../hooks/useManageArticle'
import { categoryIcon, categoryClass } from '../utils'
import classNames from '@/utils/classNames'
import { Link } from 'react-router-dom'
import type { TableQueries } from '@/@types/common'
import type { Article } from '../types'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'

const ArticleListTable = () => {
    const tableData = useManageArticleStore((state) => state.tableData)
    const selectedArticle = useManageArticleStore(
        (state) => state.selectedArticle,
    )
    const setSelectedArticle = useManageArticleStore(
        (state) => state.setSelectedArticle,
    )
    const setSelectAllArticle = useManageArticleStore(
        (state) => state.setSelectAllArticle,
    )
    const setTableData = useManageArticleStore((state) => state.setTableData)

    const { articleList, articleTotal, isLoading } = useManageArticle()
    const columns: ColumnDef<Article>[] = useMemo(
        () => [
            {
                header: 'عنوان',
                accessorKey: 'title',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-4">
                            <Avatar
                                icon={categoryIcon[row.category]}
                                shape="round"
                                className={classNames(
                                    'text-gray-900',
                                    categoryClass[row.category],
                                )}
                            />
                            <div>
                                <div className="mb-2">
                                    <Link
                                        to={`/concepts/help-center/edit-article/${row.id}`}
                                        className="font-bold heading-text hover:text-primary"
                                    >
                                        {row.title}
                                    </Link>
                                </div>
                                <div className="flex items-center gap-1">
                                    {row.tags.map((tag) => (
                                        <Tag key={tag.id}>{tag.label}</Tag>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'نویسندگان',
                accessorKey: 'authors',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <UsersAvatarGroup
                            avatarProps={{ size: 25 }}
                            users={row.authors || []}
                        />
                    )
                },
            },
            {
                header: 'آخرین به‌روزرسانی',
                accessorKey: 'updateTimeStamp',
                cell: (props) => {
                    const row = props.row.original
                    return <div>{row.updateTime}</div>
                },
            },
            {
                header: 'منتشر شده',
                accessorKey: 'published',
                enableSorting: false,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="px-4">
                            <Switcher defaultChecked={row.published} />
                        </div>
                    )
                },
            },
        ],
        [],
    )

    const handleSetTableData = (articleList: TableQueries) => {
        setTableData(articleList)
        if (selectedArticle.length > 0) {
            setSelectAllArticle([])
        }
    }

    const handlePaginationChange = (page: number) => {
        const newTableData = structuredClone(tableData)
        newTableData.pageIndex = page
        handleSetTableData(newTableData)
    }

    const handleSelectChange = (value: number) => {
        const newTableData = structuredClone(tableData)
        newTableData.pageSize = Number(value)
        newTableData.pageIndex = 1
        handleSetTableData(newTableData)
    }

    const handleSort = (sort: OnSortParam) => {
        const newTableData = structuredClone(tableData)
        newTableData.sort = sort
        handleSetTableData(newTableData)
    }

    const handleRowSelect = (checked: boolean, row: Article) => {
        setSelectedArticle(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<Article>[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllArticle(originalRows)
        } else {
            setSelectAllArticle([])
        }
    }

    return (
        <div>
            <DataTable
                selectable
                hoverable={false}
                columns={columns}
                data={articleList}
                noData={!isLoading && articleList.length === 0}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isLoading}
                pagingData={{
                    total: articleTotal || 0,
                    pageIndex: tableData.pageIndex as number,
                    pageSize: tableData.pageSize as number,
                }}
                checkboxChecked={(row) =>
                    selectedArticle.some((selected) => selected.id === row.id)
                }
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />
        </div>
    )
}

export default ArticleListTable
