import { forwardRef, useCallback } from 'react'
import debounce from 'lodash/debounce' // or use your own debounce if you prefer
import { TbSearch } from 'react-icons/tb'

import DebouceInput from '@/components/shared/DebouceInput'

// ────────────────────────────────────────────────
// Props typing (more explicit & future-proof)
// ────────────────────────────────────────────────
interface BrandListSearchProps {
    /**
     * Called with the current search term (debounced).
     * Usually used to update query params or trigger RTK Query.
     */
    onSearch: (value: string) => void

    /**
     * Initial/default search value (optional)
     */
    defaultValue?: string

    /**
     * Placeholder text
     */
    placeholder?: string

    /**
     * Debounce delay in milliseconds
     * @default 350
     */
    debounceDelay?: number

    /**
     * Whether to trim whitespace before passing to onSearch
     * @default true
     */
    trim?: boolean
}

const BrandListSearch = forwardRef<HTMLInputElement, BrandListSearchProps>(
    (
        {
            onSearch,
            defaultValue = '',
            placeholder = 'Quick search brands...',
            debounceDelay = 350,
            trim = true,
        },
        ref,
    ) => {
        // Memoized debounced handler – prevents re-creating on every render
        const debouncedSearch = useCallback(
            debounce((value: string) => {
                const trimmed = trim ? value.trim() : value
                onSearch(trimmed)
            }, debounceDelay),
            [onSearch, debounceDelay, trim],
        )

        // Optional: cancel pending debounced calls on unmount
        // useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch])

        return (
            <DebouceInput
                ref={ref}
                defaultValue={defaultValue}
                placeholder={placeholder}
                suffix={<TbSearch className="text-lg text-gray-500" />}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="max-w-md" // ← optional: typical width for search bars
            />
        )
    },
)

BrandListSearch.displayName = 'BrandListSearch'

export default BrandListSearch
