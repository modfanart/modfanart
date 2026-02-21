// src/features/artworks/components/ArtworkListTableTools.tsx
import { useState } from 'react'
import ArtworkListSearch from './ArtworkListSearch'
import ArtworkTableFilter from './ArtworkTableFilter'
import useDebounce from '@/utils/hooks/useDebounce'

const ArtworkListTableTools = () => {
    const [searchValue, setSearchValue] = useState('')

    const debouncedSearch = useDebounce(searchValue, 500)

    const handleSearch = (value: string) => {
        setSearchValue(value)
        // → Parent component should react to debouncedSearch changes
        //   (either via props callback or shared state / context / URL params)
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <ArtworkListSearch
                onSearch={handleSearch}
                placeholder="Search by title, description or artwork ID..."
                debounceMs={500}
                // initialValue=""           // optional
            />

            <ArtworkTableFilter />
            {/* 
                Suggested additions (uncomment/implement as needed):
                - Status filter dropdown (Published / Draft / Under Review / Rejected)
                - Category / tag multi-select
                - Sort dropdown (Newest first / Most viewed / Most favorited / Oldest)
            */}
        </div>
    )
}

export default ArtworkListTableTools
