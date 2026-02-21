// src/features/users/components/UserListSearch.tsx
import { forwardRef, useState, useImperativeHandle, useEffect } from 'react'
import DebounceInput from '@/components/shared/DebounceInput'
import { TbSearch, TbX } from 'react-icons/tb'

type UserListSearchProps = {
    onSearch: (value: string) => void
    placeholder?: string
    initialValue?: string
    debounceMs?: number
}

export interface UserListSearchRef {
    clear: () => void
    focus: () => void
    getValue: () => string
}

const UserListSearch = forwardRef<UserListSearchRef, UserListSearchProps>(
    (
        {
            onSearch,
            placeholder = 'Search users (name, email, username...)',
            initialValue = '',
            debounceMs = 450,
        },
        ref,
    ) => {
        const [value, setValue] = useState(initialValue)

        // Debounce the value before calling parent
        useEffect(() => {
            const timer = setTimeout(() => {
                onSearch(value.trim())
            }, debounceMs)

            return () => clearTimeout(timer)
        }, [value, debounceMs, onSearch])

        const handleClear = () => {
            setValue('')
            onSearch('')
        }

        useImperativeHandle(ref, () => ({
            clear: handleClear,
            focus: () => {
                // If you forward ref to the actual input → inputRef.current?.focus()
            },
            getValue: () => value,
        }))

        return (
            <DebounceInput
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                debounceDelay={debounceMs} // if your DebounceInput accepts this prop
                suffix={
                    value ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-gray-700 focus:outline-none"
                            aria-label="Clear search"
                        >
                            <TbX className="text-xl" />
                        </button>
                    ) : (
                        <TbSearch className="text-lg text-gray-400" />
                    )
                }
                className="max-w-md w-full"
            />
        )
    },
)

UserListSearch.displayName = 'UserListSearch'

export default UserListSearch
