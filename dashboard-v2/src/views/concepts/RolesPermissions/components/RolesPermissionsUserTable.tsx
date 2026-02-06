import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Dropdown from '@/components/ui/Dropdown'
import DataTable from '@/components/shared/DataTable'
import { useRolePermissionsStore } from '../store/rolePermissionsStore'
import dayjs from 'dayjs'
import cloneDeep from 'lodash/cloneDeep'
import { TbChevronDown } from 'react-icons/tb'
import type {
    User,
    Users,
    MutateRolesPermissionsUsersResponse,
    Roles,
} from '../types'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { TableQueries } from '@/@types/common'
import moment from 'jalali-moment'

type RolesPermissionsUserTableProps = {
    isLoading: boolean
    userList: Users
    roleList: Roles
    userListTotal: number
    mutate: MutateRolesPermissionsUsersResponse
}

const statusColor: Record<string, string> = {
    'فعال': 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    'مسدود شده': 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

const RolesPermissionsUserTable = (props: RolesPermissionsUserTableProps) => {
    const { userList, userListTotal, isLoading, roleList, mutate } = props

    const {
        tableData,
        selectedUser,
        setTableData,
        setSelectedUser,
        setSelectAllUser,
    } = useRolePermissionsStore()

    const handleSetTableData = (data: TableQueries) => {
        setTableData(data)
        if (selectedUser.length > 0) {
            setSelectAllUser([])
        }
    }

    const handlePaginationChange = (page: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageIndex = page
        handleSetTableData(newTableData)
    }

    const handleSelectChange = (value: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageSize = Number(value)
        newTableData.pageIndex = 1
        handleSetTableData(newTableData)
    }

    const handleSort = (sort: OnSortParam) => {
        const newTableData = cloneDeep(tableData)
        newTableData.sort = sort
        handleSetTableData(newTableData)
    }

    const handleRowSelect = (checked: boolean, row: User) => {
        setSelectedUser(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<User>[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllUser(originalRows)
        } else {
            setSelectAllUser([])
        }
    }

    const handleRoleChange = (role: string, id: string) => {
        const newUserList = structuredClone(userList).map((user) => {
            if (user.id === id) {
                user.role = role
            }

            return user
        })

        mutate(
            { list: newUserList, total: userListTotal - selectedUser.length },
            false,
        )
    }

    const columns: ColumnDef<User>[] = useMemo(
        () => [
            {
                header: 'نام',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <Avatar size={40} shape="circle" src={row.img} />
                            <div>
                                <div className="font-bold heading-text">
                                    {row.name}
                                </div>
                                <div>{row.email}</div>
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'وضعیت',
                accessorKey: 'status',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            <Tag className={statusColor[row.status]}>
                                <span className="capitalize">{row.status}</span>
                            </Tag>
                        </div>
                    )
                },
            },
            {
                header: 'آخرین آنلاین',
                accessorKey: 'lastOnline',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold">
                                {moment
                                    .unix(row.lastOnline)
                                    .locale('fa').format('MMMM, D YYYY')}
                            </span>
                            <small>
                                {moment.unix(row.lastOnline).locale('fa').format('hh:mm A')}
                            </small>
                        </div>
                    )
                },
            },
            {
                header: 'نقش',
                accessorKey: 'role',
                size: 70,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <Dropdown
                            renderTitle={
                                <div
                                    className="inline-flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-gray-100 hover:dark:bg-gray-700 cursor-pointer"
                                    role="button"
                                >
                                    <span className="font-bold heading-text">
                                        {
                                            roleList.find(
                                                (role) => role.id === row.role,
                                            )?.name
                                        }
                                    </span>
                                    <TbChevronDown />
                                </div>
                            }
                        >
                            {roleList
                                .filter((role) => role.id !== row.role)
                                .map((role) => (
                                    <Dropdown.Item
                                        key={role.id}
                                        eventKey={role.id}
                                        onClick={() =>
                                            handleRoleChange(role.id, row.id)
                                        }
                                    >
                                        {role.name}
                                    </Dropdown.Item>
                                ))}
                        </Dropdown>
                    )
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [roleList, userList],
    )

    return (
        <DataTable
            selectable
            columns={columns}
            data={userList}
            noData={!isLoading && userList.length === 0}
            skeletonAvatarColumns={[0]}
            skeletonAvatarProps={{ width: 28, height: 28 }}
            loading={isLoading}
            pagingData={{
                total: userListTotal,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
            }}
            checkboxChecked={(row) =>
                selectedUser.some((selected) => selected.id === row.id)
            }
            hoverable={false}
            onPaginationChange={handlePaginationChange}
            onSelectChange={handleSelectChange}
            onSort={handleSort}
            onCheckBoxChange={handleRowSelect}
            onIndeterminateCheckBoxChange={handleAllRowSelect}
        />
    )
}

export default RolesPermissionsUserTable
