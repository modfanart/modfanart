import { forwardRef, useState, useImperativeHandle, useEffect } from 'react'
import Input from '@/components/ui/Input'
import { TbSearch, TbX } from 'react-icons/tb'
import useDebounce from '@/utils/hooks/useDebounce'
import type { ChangeEvent } from 'react'

type ArtworkListSearchProps = {
    onSearch: (value: string) => void
    debounceMs?: number
    placeholder?: string
    initialValue?: string
}

export interface ArtworkListSearchRef {
    clear: () => void
    focus: () => void
}

const ArtworkListSearch = forwardRef<
    ArtworkListSearchRef,
    ArtworkListSearchProps
>(
    (
        {
            onSearch,
            debounceMs = 450,
            placeholder = 'Search artworks...',
            initialValue = '',
        },
        ref,
    ) => {
        const [value, setValue] = useState(initialValue)

        const debouncedValue = useDebounce(value, debounceMs)

        useEffect(() => {
            onSearch(debouncedValue)
        }, [debouncedValue, onSearch])

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value)
        }

        const handleClear = () => {
            setValue('')
            // onSearch('') will be triggered automatically via debounced value + effect
        }

        useImperativeHandle(ref, () => ({
            clear: handleClear,
            focus: () => {
                // If you want real focus, forward the input ref and call inputRef.current?.focus()
            },
        }))

        return (
            <Input
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                suffix={
                    value ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-gray-700 focus:outline-none"
                            aria-label="Clear search"
                        >
                            <TbX className="text-lg" />
                        </button>
                    ) : (
                        <TbSearch className="text-lg text-gray-400" />
                    )
                }
                className="max-w-md"
            />
        )
    },
)

ArtworkListSearch.displayName = 'ArtworkListSearch'

export default ArtworkListSearch
