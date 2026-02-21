// src/features/users/pages/UserList.tsx
import { useState, useEffect } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import UserListActionTools from './components/UserListActionTools'
import UserListTableTools from './components/UserListTableTools'
import UserListTable from './components/UserListTable'
import UserListSelected from './components/UserListSelected'

import type { UserProfile } from '@/services/userApi'

const UserList = () => {
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState<{
        status?: string
        roles?: string[]
    }>({})
    const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([])

    // Optional: clear selection when search or filters change
    // (prevents confusing stale selections after filtering)
    useEffect(() => {
        setSelectedUsers([])
    }, [search, filters])

    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-6">
                        {/* Header + Action buttons */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <h3 className="text-2xl font-bold heading-text">
                                Users
                            </h3>
                            <UserListActionTools />
                        </div>

                        {/* Toolbar: Search + Filter */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <UserListTableTools
                                onSearchChange={setSearch}
                                onFiltersChange={setFilters}
                            />
                        </div>

                        {/* Main Table */}
                        <UserListTable
                            search={search}
                            filters={filters}
                            selectedUsers={selectedUsers}
                            onSelectionChange={setSelectedUsers}
                        />
                    </div>
                </AdaptiveCard>
            </Container>

            <UserListSelected
                selectedUsers={selectedUsers}
                onClearSelection={() => setSelectedUsers([])}
            />
        </>
    )
}

export default UserList
