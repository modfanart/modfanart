// src/features/users/components/UserListTable.tsx
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { TbPencil, TbEye } from 'react-icons/tb'
import { Link } from 'react-router-dom'

import { useGetAllUsersQuery } from '@/services/userApi'

import type { ColumnDef } from '@/components/shared/DataTable'
import type { UserProfile } from '@/services/userApi'
import type { TableQueries, OnSortParam } from '@/@types/common'

const statusColorMap: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400',
    pending_verification:
        'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400',
    deactivated:
        'bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400',
}

const NameColumn = ({ user }: { user: UserProfile }) => {
    return (
        <div className="flex items-center gap-3">
            <Avatar
                size={42}
                shape="circle"
                src={user.avatar_url || undefined}
                fallback={
                    user.username?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase() ||
                    '?'
                }
            />
            <Link
                to={`/users/${user.id}`}
                className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
            >
                {user.username || user.email.split('@')[0]}
            </Link>
        </div>
    )
}

const StatusTag = ({ status }: { status: UserProfile['status'] }) => {
    const label =
        status === 'active'
            ? 'Active'
            : status === 'suspended'
              ? 'Suspended'
              : status === 'pending_verification'
                ? 'Pending Verification'
                : status === 'deactivated'
                  ? 'Deactivated'
                  : status

    return (
        <Tag className={statusColorMap[status] || 'bg-gray-100 text-gray-700'}>
            {label}
        </Tag>
    )
}

type UserListTableProps = {
    selectedUsers: UserProfile[]
    onSelectionChange: (selected: UserProfile[]) => void
    // Optional: add search/filters from parent later
}

const UserListTable = ({
    selectedUsers,
    onSelectionChange,
}: UserListTableProps) => {
    const navigate = useNavigate()

    const [tableQueries, setTableQueries] = useState<TableQueries>({
        pageIndex: 1,
        pageSize: 10,
        sort: undefined,
        // query: '' // add when you connect search
    })

    const { data, isLoading, isFetching } = useGetAllUsersQuery({
        page: tableQueries.pageIndex,
        limit: tableQueries.pageSize,
        sort: tableQueries.sort
            ? `${tableQueries.sort.id}:${tableQueries.sort.desc ? 'desc' : 'asc'}`
            : undefined,
        // search: tableQueries.query,   // uncomment when search is connected
        // status: filters?.status,
    })

    const users = data?.users ?? []
    const total = data?.pagination.total ?? 0

    const columns = useMemo<ColumnDef<UserProfile>[]>(
        () => [
            {
                header: 'Username / Email',
                accessorKey: 'username',
                cell: ({ row }) => <NameColumn user={row.original} />,
                size: 280,
            },
            {
                header: 'Email',
                accessorKey: 'email',
            },
            {
                header: 'Role',
                accessorKey: 'role.name',
                cell: ({ row }) => (
                    <span className="font-medium">
                        {row.original.role?.name || '—'}
                    </span>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ row }) => <StatusTag status={row.original.status} />,
            },
            {
                header: 'Created At',
                accessorKey: 'created_at',
                cell: ({ getValue }) => {
                    const date = new Date(getValue() as string)
                    return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })
                },
            },
            {
                header: 'Last Login',
                accessorKey: 'last_login_at',
                cell: ({ getValue }) => {
                    const val = getValue() as string | null
                    return val
                        ? new Date(val).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                          })
                        : '—'
                },
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-4">
                        <Tooltip title="View Details">
                            <button
                                className="text-xl text-gray-600 hover:text-primary transition-colors"
                                onClick={() =>
                                    navigate(`/users/${row.original.id}`)
                                }
                            >
                                <TbEye />
                            </button>
                        </Tooltip>
                        <Tooltip title="Edit">
                            <button
                                className="text-xl text-primary hover:text-primary-emphasis transition-colors"
                                onClick={() =>
                                    navigate(`/users/edit/${row.original.id}`)
                                }
                            >
                                <TbPencil />
                            </button>
                        </Tooltip>
                    </div>
                ),
                size: 140,
            },
        ],
        [navigate],
    )

    const handleTableChange = (newQueries: TableQueries) => {
        setTableQueries(newQueries)
    }

    const handleRowSelect = (checked: boolean, row: UserProfile) => {
        if (checked) {
            onSelectionChange([...selectedUsers, row])
        } else {
            onSelectionChange(selectedUsers.filter((u) => u.id !== row.id))
        }
    }

    const handleAllSelect = (
        checked: boolean,
        visibleRows: Row<UserProfile>[],
    ) => {
        if (checked) {
            const newSelected = [
                ...selectedUsers,
                ...visibleRows
                    .map((r) => r.original)
                    .filter((r) => !selectedUsers.some((s) => s.id === r.id)),
            ]
            onSelectionChange(newSelected)
        } else {
            onSelectionChange(
                selectedUsers.filter(
                    (s) => !visibleRows.some((r) => r.original.id === s.id),
                ),
            )
        }
    }

    return (
        <DataTable
            selectable
            columns={columns}
            data={users}
            loading={isLoading || isFetching}
            noData={!isLoading && users.length === 0}
            skeletonAvatarColumns={[0]}
            skeletonAvatarProps={{ width: 42, height: 42 }}
            pagingData={{
                total,
                pageIndex: tableQueries.pageIndex,
                pageSize: tableQueries.pageSize,
            }}
            checkboxChecked={(row) =>
                selectedUsers.some((sel) => sel.id === row.id)
            }
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
            onSort={(sort: OnSortParam) =>
                handleTableChange({ ...tableQueries, sort })
            }
            onCheckBoxChange={handleRowSelect}
            onIndeterminateCheckBoxChange={handleAllSelect}
        />
    )
}

export default UserListTable
