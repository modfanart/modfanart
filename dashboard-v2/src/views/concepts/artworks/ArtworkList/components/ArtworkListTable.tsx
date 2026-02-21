import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Tooltip from '@/components/ui/Tooltip'
import classNames from '@/utils/classNames'
import { TbPencil, TbTrash } from 'react-icons/tb'
import { FiImage } from 'react-icons/fi'

import {
    useGetMyArtworksQuery,
    useDeleteArtworkMutation,
} from '@/services/artworkApi'

import type { ColumnDef } from '@/components/shared/DataTable'
import type { ArtworkListItem } from '@/services/artworkApi'
import type { TableQueries } from '@/@types/common'

const ArtworkColumn = ({ row }: { row: ArtworkListItem }) => {
    return (
        <div className="flex items-center gap-3">
            <Avatar
                shape="rounded"
                size={64}
                src={row.thumbnail_url || undefined}
                icon={
                    !row.thumbnail_url ? (
                        <FiImage className="text-2xl" />
                    ) : undefined
                }
            />
            <div>
                <div className="font-semibold heading-text mb-0.5 line-clamp-1">
                    {row.title}
                </div>
                {row.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {row.description}
                    </div>
                )}
                <div className="text-xs text-gray-400 mt-0.5">
                    ID: {row.id.slice(0, 8)}...
                </div>
            </div>
        </div>
    )
}

const ActionColumn = ({
    onEdit,
    onDelete,
}: {
    onEdit: () => void
    onDelete: () => void
}) => (
    <div className="flex items-center justify-end gap-4">
        <Tooltip title="Edit artwork">
            <button
                className="text-xl text-primary hover:text-primary-emphasis transition-colors"
                onClick={onEdit}
            >
                <TbPencil />
            </button>
        </Tooltip>
        <Tooltip title="Delete artwork">
            <button
                className="text-xl text-error hover:text-red-600 transition-colors"
                onClick={onDelete}
            >
                <TbTrash />
            </button>
        </Tooltip>
    </div>
)

const ArtworkListTable = () => {
    const navigate = useNavigate()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [toDeleteId, setToDeleteId] = useState<string | null>(null)

    const [deleteArtwork, { isLoading: isDeleting }] =
        useDeleteArtworkMutation()

    const [tableQueries, setTableQueries] = useState<TableQueries>({
        pageIndex: 1,
        pageSize: 10,
        sort: undefined,
    })

    const { data, isLoading, isFetching } = useGetMyArtworksQuery({
        page: tableQueries.pageIndex,
        limit: tableQueries.pageSize,
    })

    const artworks = data?.artworks ?? []
    const total = data?.pagination.total ?? 0

    const columns = useMemo<ColumnDef<ArtworkListItem>[]>(
        () => [
            {
                header: 'Artwork',
                accessorKey: 'title',
                cell: ({ row }) => <ArtworkColumn row={row.original} />,
                size: 300,
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ row }) => {
                    const status = row.original.status
                    const colors = {
                        published: 'bg-success/10 text-success',
                        draft: 'bg-warning/10 text-warning',
                        moderation_pending: 'bg-info/10 text-info',
                        rejected: 'bg-error/10 text-error',
                        archived: 'bg-gray-100 text-gray-600 dark:bg-gray-700',
                    }
                    const statusText = {
                        published: 'Published',
                        draft: 'Draft',
                        moderation_pending: 'Under Review',
                        rejected: 'Rejected',
                        archived: 'Archived',
                    }

                    return (
                        <span
                            className={classNames(
                                'px-2.5 py-1 rounded-full text-xs font-medium',
                                colors[status] || 'bg-gray-100 text-gray-600',
                            )}
                        >
                            {statusText[status] || status}
                        </span>
                    )
                },
            },
            {
                header: 'Views',
                accessorKey: 'views_count',
                cell: ({ getValue }) => (
                    <span className="font-medium">{getValue() as number}</span>
                ),
            },
            {
                header: 'Favorites',
                accessorKey: 'favorites_count',
                cell: ({ getValue }) => (
                    <span className="font-medium">{getValue() as number}</span>
                ),
            },
            {
                header: 'Created At',
                accessorKey: 'created_at',
                cell: ({ getValue }) => {
                    const date = new Date(getValue() as string)
                    return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })
                },
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <ActionColumn
                        onEdit={() =>
                            navigate(`/artworks/edit/${row.original.id}`)
                        }
                        onDelete={() => {
                            setToDeleteId(row.original.id)
                            setDeleteDialogOpen(true)
                        }}
                    />
                ),
                size: 120,
            },
        ],
        [navigate],
    )

    const handleTableChange = (newQueries: TableQueries) => {
        setTableQueries(newQueries)
    }

    const handleConfirmDelete = async () => {
        if (!toDeleteId) return

        try {
            await deleteArtwork(toDeleteId).unwrap()
        } catch (err) {
            console.error('Delete failed:', err)
            // You can add toast.error('Failed to delete artwork') here
        } finally {
            setDeleteDialogOpen(false)
            setToDeleteId(null)
        }
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={artworks}
                loading={isLoading || isFetching}
                noData={!isLoading && artworks.length === 0}
                pagingData={{
                    total,
                    pageIndex: tableQueries.pageIndex,
                    pageSize: tableQueries.pageSize,
                }}
                onPaginationChange={(page) =>
                    handleTableChange({ ...tableQueries, pageIndex: page })
                }
                onSelectChange={(size) =>
                    handleTableChange({
                        ...tableQueries,
                        pageSize: Number(size),
                        pageIndex: 1,
                    })
                }
                onSort={(sort) => handleTableChange({ ...tableQueries, sort })}
            />

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                type="danger"
                title="Delete Artwork"
                onClose={() => setDeleteDialogOpen(false)}
                onCancel={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                confirmButtonText="Delete"
                isLoading={isDeleting}
            >
                <p>
                    Are you sure you want to delete this artwork? This action
                    cannot be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default ArtworkListTable
