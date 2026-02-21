// src/components/collections/CollectionListTable.tsx

import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { Link, useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import { TbPencil, TbEye } from 'react-icons/tb'

import {
    useGetCollectionsQuery,
    CollectionRow,
} from '@/services/api/collectionsApi'

import type { ColumnDef, Row, OnSortParam } from '@/components/shared/DataTable'
import type { TableQueries } from '@/@types/common'

// You can adjust these colors / add more statuses
const statusColor: Record<string, string> = {
    true: 'bg-emerald-200 dark:bg-emerald-600 text-gray-900 dark:text-white',
    false: 'bg-amber-200 dark:bg-amber-600 text-gray-900 dark:text-white',
}

const NameColumn = ({ row }: { row: CollectionRow }) => {
    return (
        <div className="flex items-center">
            <Avatar
                size={40}
                shape="circle"
                src={row.cover_image_url || undefined}
                fallback={row.name?.[0]?.toUpperCase() || '?'}
            />
            <Link
                className="hover:text-primary ml-3 rtl:mr-3 font-semibold text-gray-900 dark:text-gray-100"
                to={`/concepts/collections/collection-details/${row.id}`}
            >
                {row.name}
            </Link>
        </div>
    )
}

const ActionColumn = ({
    onEdit,
    onViewDetail,
}: {
    onEdit: () => void
    onViewDetail: () => void
}) => {
    return (
        <div className="flex items-center gap-4">
            <Tooltip title="ویرایش مجموعه">
                <div
                    className="text-xl cursor-pointer select-none text-primary hover:text-primary-600"
                    role="button"
                    onClick={onEdit}
                >
                    <TbPencil />
                </div>
            </Tooltip>
            <Tooltip title="مشاهده جزئیات">
                <div
                    className="text-xl cursor-pointer select-none text-primary hover:text-primary-600"
                    role="button"
                    onClick={onViewDetail}
                >
                    <TbEye />
                </div>
            </Tooltip>
        </div>
    )
}

const CollectionListTable = () => {
    const navigate = useNavigate()

    // Local table state (pagination, sorting, pageSize)
    const [tableData, setTableData] = useState<TableQueries>({
        pageIndex: 1,
        pageSize: 10,
        sort: { order: '', key: '' }, // or your default sort
    })

    // Optional: if you have search from parent / separate component
    const [search, setSearch] = useState('') // ← connect to <CollectionListSearch />

    // RTK Query – dynamic args based on table state
    const queryArgs = useMemo(
        () => ({
            owner_type: 'user', // or 'brand' — adjust per context
            owner_id: 'current', // or real ID
            page: tableData.pageIndex,
            limit: tableData.pageSize,
            // Sorting: convert to backend format e.g. "name:asc"
            ...(tableData.sort?.key && {
                sort: `${tableData.sort.key}:${tableData.sort.order || 'asc'}`,
            }),
            // If your backend supports search
            ...(search && { search }), // or q= , name_like= , etc.
        }),
        [tableData, search],
    )

    const { data, isLoading, isFetching } = useGetCollectionsQuery(queryArgs)

    const collections = data?.collections ?? []
    const total = data?.total ?? 0 // ← assume backend returns { collections: [], total: number }

    // If backend does NOT return total, you may need another query or estimate

    const columns: ColumnDef<CollectionRow>[] = useMemo(
        () => [
            {
                header: 'نام مجموعه',
                accessorKey: 'name',
                cell: (props) => <NameColumn row={props.row.original} />,
            },
            {
                header: 'Slug',
                accessorKey: 'slug',
            },
            {
                header: 'توضیحات',
                accessorKey: 'description',
                cell: (props) => (
                    <span className="line-clamp-1 max-w-xs">
                        {props.row.original.description || '—'}
                    </span>
                ),
            },
            {
                header: 'عمومی',
                accessorKey: 'is_public',
                cell: (props) => {
                    const isPublic = props.row.original.is_public
                    return (
                        <Tag
                            className={statusColor[isPublic ? 'true' : 'false']}
                        >
                            {isPublic ? 'عمومی' : 'خصوصی'}
                        </Tag>
                    )
                },
            },
            {
                header: 'تعداد آثار',
                accessorKey: 'itemsCount', // ← if backend includes this field (bonus!)
                cell: (props) => props.row.original.items?.length ?? '—',
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() =>
                            navigate(
                                `/concepts/collections/collection-edit/${props.row.original.id}`,
                            )
                        }
                        onViewDetail={() =>
                            navigate(
                                `/concepts/collections/collection-details/${props.row.original.id}`,
                            )
                        }
                    />
                ),
            },
        ],
        [navigate],
    )

    const handlePaginationChange = (page: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageIndex = page
        setTableData(newTableData)
    }

    const handleSelectChange = (value: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageSize = Number(value)
        newTableData.pageIndex = 1 // reset to first page on size change
        setTableData(newTableData)
    }

    const handleSort = (sort: OnSortParam) => {
        const newTableData = cloneDeep(tableData)
        newTableData.sort = sort
        setTableData(newTableData)
    }

    // Selection logic (local for now – can be lifted later for bulk actions)
    const [selectedCollections, setSelectedCollections] = useState<
        CollectionRow[]
    >([])

    const handleRowSelect = (checked: boolean, row: CollectionRow) => {
        setSelectedCollections((prev) =>
            checked
                ? [...prev, row]
                : prev.filter((item) => item.id !== row.id),
        )
    }

    const handleAllRowSelect = (
        checked: boolean,
        rows: Row<CollectionRow>[],
    ) => {
        if (checked) {
            setSelectedCollections(rows.map((r) => r.original))
        } else {
            setSelectedCollections([])
        }
    }

    return (
        <DataTable
            selectable
            columns={columns}
            data={collections}
            noData={!isLoading && collections.length === 0}
            skeletonAvatarColumns={[0]}
            skeletonAvatarProps={{ width: 40, height: 40 }}
            loading={isLoading || isFetching}
            pagingData={{
                total,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
            }}
            checkboxChecked={(row) =>
                selectedCollections.some((sel) => sel.id === row.id)
            }
            onPaginationChange={handlePaginationChange}
            onSelectChange={handleSelectChange}
            onSort={handleSort}
            onCheckBoxChange={handleRowSelect}
            onIndeterminateCheckBoxChange={handleAllRowSelect}
        />
    )
}

export default CollectionListTable
