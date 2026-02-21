import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { Link, useNavigate } from 'react-router-dom'
import { TbPencil, TbEye } from 'react-icons/tb'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { OnSortParam, Row } from '@/components/shared/DataTable'
import type { TableQueries } from '@/@types/common'

// ─── RTK Query ────────────────────────────────────────────────────────
import { useGetMyBrandsQuery } from '@/services/brands'
import type { Brand } from '@/services/brands'

// Status color mapping (aligned with your Brand type)
const statusColor: Record<Brand['status'], string> = {
    active: 'bg-emerald-200 dark:bg-emerald-600 text-gray-900 dark:text-white',
    suspended: 'bg-rose-200 dark:bg-rose-600 text-gray-900 dark:text-white',
    pending: 'bg-amber-200 dark:bg-amber-600 text-gray-900 dark:text-white',
    deactivated: 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white',
}

const NameColumn = ({ row }: { row: Brand }) => {
    return (
        <div className="flex items-center gap-3">
            <Avatar
                size={40}
                shape="circle"
                src={row.logo_url || undefined}
                fallback={row.name?.[0]?.toUpperCase() || '?'}
            />
            <Link
                className="hover:text-primary font-semibold text-gray-900 dark:text-gray-100"
                to={`/concepts/brands/brand-details/${row.id}`} // ← update path as needed
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
            <Tooltip title="Edit Brand">
                <button
                    type="button"
                    className="text-xl text-primary hover:text-primary-600 transition-colors"
                    onClick={onEdit}
                >
                    <TbPencil />
                </button>
            </Tooltip>
            <Tooltip title="View Details">
                <button
                    type="button"
                    className="text-xl text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                    onClick={onViewDetail}
                >
                    <TbEye />
                </button>
            </Tooltip>
        </div>
    )
}

const BrandListTable = () => {
    const navigate = useNavigate()

    // Local selection state (can be lifted to parent or context later)
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
        {},
    )

    // Table query state (pagination, sort, etc.)
    const [tableQueries, setTableQueries] = useState<TableQueries>({
        pageIndex: 1,
        pageSize: 10,
        sort: { id: 'created_at', desc: true },
        search: '',
    })

    const { data, isLoading, isFetching } = useGetMyBrandsQuery({
        limit: tableQueries.pageSize,
        offset: (tableQueries.pageIndex - 1) * tableQueries.pageSize!,
        sortBy: tableQueries.sort?.id,
        sortOrder: tableQueries.sort?.desc ? 'desc' : 'asc',
        search: tableQueries.search,
    })

    const brands = data?.brands ?? []
    const total = data?.pagination.total ?? 0

    const handleEdit = (brand: Brand) => {
        navigate(`/concepts/brands/brand-edit/${brand.id}`)
    }

    const handleViewDetails = (brand: Brand) => {
        navigate(`/concepts/brands/brand-details/${brand.id}`)
    }

    const columns = useMemo<ColumnDef<Brand>[]>(
        () => [
            {
                header: 'Brand Name',
                accessorKey: 'name',
                cell: ({ row }) => <NameColumn row={row.original} />,
            },
            {
                header: 'Slug',
                accessorKey: 'slug',
            },
            {
                header: 'Website',
                accessorKey: 'website',
                cell: ({ getValue }) => getValue() || '—',
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ row }) => {
                    const status = row.original.status
                    return (
                        <Tag className={statusColor[status]}>
                            <span className="capitalize">{status}</span>
                        </Tag>
                    )
                },
            },
            {
                header: 'Followers',
                accessorKey: 'followers_count',
                cell: ({ getValue }) => getValue() || 0,
            },
            {
                header: 'Views',
                accessorKey: 'views_count',
                cell: ({ getValue }) => getValue() || 0,
            },
            {
                header: '',
                id: 'actions',
                enableSorting: false,
                cell: ({ row }) => (
                    <ActionColumn
                        onEdit={() => handleEdit(row.original)}
                        onViewDetail={() => handleViewDetails(row.original)}
                    />
                ),
            },
        ],
        [],
    )

    return (
        <DataTable<Brand>
            selectable
            columns={columns}
            data={brands}
            loading={isLoading || isFetching}
            noData={!isLoading && !isFetching && brands.length === 0}
            skeletonAvatarColumns={[0]}
            skeletonAvatarProps={{ width: 40, height: 40 }}
            pagingData={{
                total,
                pageIndex: tableQueries.pageIndex,
                pageSize: tableQueries.pageSize,
            }}
            state={{ rowSelection }}
            onRowSelectionChange={setRowSelection}
            onPaginationChange={(pageIndex) =>
                setTableQueries((prev) => ({ ...prev, pageIndex }))
            }
            onSelectChange={(pageSize) =>
                setTableQueries((prev) => ({ ...prev, pageSize, pageIndex: 1 }))
            }
            onSort={(sort) => setTableQueries((prev) => ({ ...prev, sort }))}
            // If you have BrandListSearch component:
            // onSearch={(value) => setTableQueries((prev) => ({ ...prev, search: value, pageIndex: 1 }))}
        />
    )
}

export default BrandListTable
