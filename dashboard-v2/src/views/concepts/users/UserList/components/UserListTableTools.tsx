// src/features/users/components/UserListTableTools.tsx
import { useState, useEffect } from 'react'
import UserListSearch from './UserListSearch'
import UserListTableFilter from './UserListTableFilter'
import useDebounce from '@/utils/hooks/useDebounce'

type UserListTableToolsProps = {
    onSearchChange: (search: string) => void
    onFiltersChange: (filters: { status?: string; roles?: string[] }) => void
}

const UserListTableTools = ({
    onSearchChange,
    onFiltersChange,
}: UserListTableToolsProps) => {
    // Local controlled search value
    const [searchValue, setSearchValue] = useState('')

    // Debounce before notifying parent (prevents query spam)
    const debouncedSearch = useDebounce(searchValue.trim(), 500)

    // Notify parent when debounced value changes
    useEffect(() => {
        onSearchChange(debouncedSearch)
    }, [debouncedSearch, onSearchChange])

    // Optional: reset page to 1 when search changes (common UX)
    // → usually handled in parent component when debouncedSearch changes

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
            {/* Search */}
            <UserListSearch
                onSearch={setSearchValue}
                initialValue={searchValue}
                placeholder="Search by username, email or role..."
            />

            {/* Filters */}
            <UserListTableFilter onApply={onFiltersChange} />
        </div>
    )
}

export default UserListTableTools
