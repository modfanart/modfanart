// src/features/users/components/UserListActionTools.tsx
import Button from '@/components/ui/Button'
import { TbCloudDownload, TbUserPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import { useGetAllUsersQuery } from '@/services/userApi'
import { useMemo } from 'react'

const UserListActionTools = () => {
    const navigate = useNavigate()

    // Adjust query params to match your current table filters/pagination if needed
    // For full export you might want higher limit or a separate "export" endpoint
    const { data, isLoading, isFetching } = useGetAllUsersQuery(
        {
            limit: 500, // ← increase if you expect <500 users; otherwise see note below
            page: 1, // or use current page from table state
            // search: ..., status: ..., etc. — pass from parent if filtered
        },
        { skip: false },
    )

    const users = data?.users ?? []

    const isExportDisabled = isLoading || isFetching || users.length === 0

    // Define clean, meaningful CSV columns
    const csvHeaders = useMemo(
        () => [
            { label: 'ID', key: 'id' },
            { label: 'Username', key: 'username' },
            { label: 'Email', key: 'email' },
            { label: 'Status', key: 'status' },
            { label: 'Role', key: 'role.name' }, // nested access — react-csv supports dot notation
            { label: 'Created At', key: 'created_at' },
            { label: 'Last Login', key: 'last_login_at' },
            { label: 'Bio', key: 'bio' },
            { label: 'Location', key: 'location' },
            { label: 'Website', key: 'website' },
            { label: 'Avatar URL', key: 'avatar_url' },
        ],
        [],
    )

    // Optional: transform data for better CSV readability
    const csvData = useMemo(
        () =>
            users.map((user) => ({
                ...user,
                role_name: user.role?.name || '-', // fallback if dot notation fails
                created_at: user.created_at
                    ? new Date(user.created_at).toLocaleString('en-US')
                    : '-',
                last_login_at: user.last_login_at
                    ? new Date(user.last_login_at).toLocaleString('en-US')
                    : '-',
            })),
        [users],
    )

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <CSVLink
                data={csvData}
                headers={csvHeaders}
                filename="users-export.csv"
                className={
                    isExportDisabled ? 'pointer-events-none opacity-60' : ''
                }
            >
                <Button
                    icon={<TbCloudDownload className="text-xl" />}
                    disabled={isExportDisabled}
                    loading={isFetching} // if your Button supports loading prop
                >
                    Export Users
                </Button>
            </CSVLink>

            <Button
                variant="solid"
                icon={<TbUserPlus className="text-xl" />}
                onClick={() => navigate('/users/create')} // ← change to your real create route
            >
                Add New User
            </Button>
        </div>
    )
}

export default UserListActionTools
